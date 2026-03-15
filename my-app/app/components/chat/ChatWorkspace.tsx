"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RequestMessageBubble from "./RequestMessageBubble";
import {
  sendSystemMessage,
  sendTextMessage,
  subscribeMessages,
  subscribeThreadsForOrg,
  updateRequestMessageStatus,
  appendRequestMessage, markMatchOfferUsed
} from "@/app/lib/firestore/messages";
import {
  cancelHeldRequest,
  completeHeldRequest,
  getRequestById,
  getRequestLinesOnce,
  holdRequestInventory,
  createRequest,
} from "@/app/lib/firestore/requests";
import type {
  ChatMessage,
  ChatRole,
  ChatThread,
} from "@/app/lib/chat/chatTypes";
import MatchOfferMessageBubble from "@/app/components/chat/MatchOfferMessageBubble";

type Props = {
  viewerRole: ChatRole;
  title: string;
  currentOrgId: string;
  currentOrgName: string;
};

function formatTime(value: any) {
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : typeof value === "number"
          ? new Date(value)
          : null;

  if (!date) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPeerLabel(thread: ChatThread, currentOrgId: string) {
  const otherOrgId = thread.orgIds.find((id) => id !== currentOrgId);
  if (!otherOrgId) return "Conversation";
  return thread.orgNames?.[otherOrgId] ?? otherOrgId;
}

function lastMessagePreview(thread: ChatThread) {
  return thread.lastMessageText || "No messages yet.";
}

export default function ChatWorkspace({
  viewerRole,
  title,
  currentOrgId,
  currentOrgName,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [draft, setDraft] = useState("");
  const [requestingMatchMessageId, setRequestingMatchMessageId] = useState("");
  
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return subscribeThreadsForOrg(currentOrgId, setThreads);
  }, [currentOrgId]);

  useEffect(() => {
    const requestedThread = searchParams.get("thread");

    if (requestedThread && threads.some((thread) => thread.id === requestedThread)) {
      setSelectedThreadId((prev) =>
        prev === requestedThread ? prev : requestedThread
      );
      return;
    }

    setSelectedThreadId((prev) => {
      if (prev && threads.some((thread) => thread.id === prev)) {
        return prev;
      }

      return threads[0]?.id ?? "";
    });
  }, [threads, searchParams]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }

    return subscribeMessages(selectedThreadId, setMessages);
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;

    const currentThreadParam = searchParams.get("thread");
    if (currentThreadParam === selectedThreadId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("thread", selectedThreadId);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedThreadId, pathname, router, searchParams]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );

  useEffect(() => {
    if (!selectedThreadId) return;

    const el = messagesViewportRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, selectedThreadId]);

  const handleSend = async () => {
    if (!selectedThreadId || !draft.trim()) return;

    try {
      await sendTextMessage({
        threadId: selectedThreadId,
        senderRole: viewerRole,
        senderOrgId: currentOrgId,
        senderOrgName: currentOrgName,
        text: draft,
      });

      setDraft("");
    } catch (error) {
      console.error(error);
      window.alert("Could not send message.");
    }
  };

  const handleRequestFromMatch = async (message: ChatMessage) => {
    const offer = message.matchOffer;
    if (!selectedThread || !offer || requestingMatchMessageId) return;

    setRequestingMatchMessageId(message.id);

    try {
      const expiresAtIso = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const requestId = await createRequest({
        fromOrgId: currentOrgId,
        fromOrgNameSnapshot: currentOrgName,
        toOrgId: offer.offeringOrgId,
        toOrgNameSnapshot: offer.offeringOrgName,
        expiresAt: expiresAtIso,
        lines: [
          {
            listingId: offer.offeringListingId,
            itemKey: offer.itemKey,
            nameSnapshot: offer.itemName,
            categorySnapshot: offer.category,
            imageUrlSnapshot: offer.imageUrl || "",
            expirationSnapshot: offer.expiration ?? undefined,
            urgencySnapshot: undefined,
            quantityRequested: offer.availableQuantity,
          },
        ],
      });

      await appendRequestMessage({
        threadId: selectedThread.id,
        senderRole: viewerRole,
        senderOrgId: currentOrgId,
        senderOrgName: currentOrgName,
        requestId,
        text: `${currentOrgName} sent a request.`,
        expiresAt: expiresAtIso,
        requestLines: [
          {
            itemName: offer.itemName,
            quantity: offer.availableQuantity,
          },
        ],
      });

      await markMatchOfferUsed({
        threadId: selectedThread.id,
        messageId: message.id,
      });

      await sendSystemMessage({
        threadId: selectedThread.id,
        senderOrgId: offer.offeringOrgId,
        senderOrgName: offer.offeringOrgName,
        requestId,
        text: "Automatic reply: This is only a request and nothing has been confirmed yet. You will receive another message if it is accepted or cancelled.",
      });
    } catch (error) {
      console.error(error);
      window.alert("Could not send request from this match.");
    } finally {
      setRequestingMatchMessageId("");
    }
  };

  const handleHoldRequest = async (messageId: string, requestId?: string) => {
    if (!selectedThread || !requestId) return;

    try {
      const request = await getRequestById(requestId);
      if (!request) {
        window.alert("Request not found.");
        return;
      }

      const lines = await getRequestLinesOnce(requestId);
      await holdRequestInventory(request, lines);

      await updateRequestMessageStatus({
        threadId: selectedThread.id,
        messageId,
        status: "held",
      });

      await sendSystemMessage({
        threadId: selectedThread.id,
        senderOrgId: currentOrgId,
        senderOrgName: currentOrgName,
        requestId,
        text: "Automatic reply: Your request has been accepted and placed on hold. Please collect it within 48 hours or it may be released.",
      });
    } catch (error) {
      console.error(error);
      window.alert("Could not hold this request.");
    }
  };

  const handleDoneRequest = async (messageId: string, requestId?: string) => {
    if (!selectedThread || !requestId) return;

    try {
      const request = await getRequestById(requestId);
      if (!request) {
        window.alert("Request not found.");
        return;
      }

      const lines = await getRequestLinesOnce(requestId);
      await completeHeldRequest(request, lines);

      await updateRequestMessageStatus({
        threadId: selectedThread.id,
        messageId,
        status: "completed",
      });
    } catch (error) {
      console.error(error);
      window.alert("Could not complete this request.");
    }
  };

  const handleCancelRequest = async (messageId: string, requestId?: string) => {
    if (!selectedThread || !requestId) return;

    try {
      const request = await getRequestById(requestId);
      if (!request) {
        window.alert("Request not found.");
        return;
      }

      const lines = await getRequestLinesOnce(requestId);
      await cancelHeldRequest(request, lines);

      await updateRequestMessageStatus({
        threadId: selectedThread.id,
        messageId,
        status: "cancelled",
      });

      await sendSystemMessage({
        threadId: selectedThread.id,
        senderOrgId: currentOrgId,
        senderOrgName: currentOrgName,
        requestId,
        text: "Automatic reply: This request has been cancelled.",
      });
    } catch (error) {
      console.error(error);
      window.alert("Could not cancel this request.");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: { xs: "0 0 78px 0", md: "72px 0 0 0" },
        overflow: "hidden",
        bgcolor: "var(--background)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 0,
          border: "none",
          boxShadow: "none",
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "340px minmax(0, 1fr)" },
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
              borderRight: { md: "1px solid var(--border)" },
              borderBottom: { xs: "1px solid var(--border)", md: "none" },
              bgcolor: "#fbfbf9",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ p: 2, flexShrink: 0 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,
                  color: "var(--muted)",
                  fontSize: "0.94rem",
                }}
              >
                Conversations update live through Firestore.
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "var(--border)", flexShrink: 0 }} />

            <Stack
              spacing={0.5}
              sx={{
                p: 1,
                minHeight: 0,
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {threads.length === 0 ? (
                <Typography sx={{ color: "var(--muted)", p: 1 }}>
                  No conversations yet.
                </Typography>
              ) : (
                threads.map((thread) => (
                  <Box
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    sx={{
                      p: 1.25,
                      borderRadius: "18px",
                      cursor: "pointer",
                      bgcolor:
                        selectedThreadId === thread.id
                          ? "var(--accent-soft)"
                          : "transparent",
                      border:
                        selectedThreadId === thread.id
                          ? "1px solid rgba(40, 199, 167, 0.3)"
                          : "1px solid transparent",
                      transition: "0.16s ease",
                      minWidth: 0,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                          }}
                          noWrap
                        >
                          {getPeerLabel(thread, currentOrgId)}
                        </Typography>

                        <Typography
                          sx={{
                            color: "var(--foreground)",
                            fontSize: "0.92rem",
                            mt: 0.2,
                          }}
                          noWrap
                        >
                          {thread.subject}
                        </Typography>

                        <Typography
                          sx={{
                            color: "var(--muted)",
                            fontSize: "0.86rem",
                            mt: 0.5,
                          }}
                          noWrap
                        >
                          {lastMessagePreview(thread)}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          color: "var(--muted)",
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatTime(thread.updatedAt || thread.lastMessageAt)}
                      </Typography>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              display: "grid",
              gridTemplateRows: "auto minmax(0, 1fr) auto",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid var(--border)",
                bgcolor: "white",
                minWidth: 0,
              }}
            >
              {selectedThread ? (
                <>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                    noWrap
                  >
                    {getPeerLabel(selectedThread, currentOrgId)}
                  </Typography>
                  <Typography
                    sx={{ color: "var(--muted)", fontSize: "0.9rem" }}
                    noWrap
                  >
                    {selectedThread.subject}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: "var(--muted)" }}>
                  Select a conversation
                </Typography>
              )}
            </Box>

            <Stack
              ref={messagesViewportRef}
              spacing={1.25}
              sx={{
                p: 2,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                bgcolor: "#fcfcfa",
                alignItems: "stretch",
              }}
            >
              {!selectedThread ? (
                <Typography sx={{ color: "var(--muted)" }}>
                  Open a conversation to start messaging.
                </Typography>
              ) : messages.length === 0 ? (
                <Typography sx={{ color: "var(--muted)" }}>
                  No messages yet. Send the first one below.
                </Typography>
              ) : (
              messages.map((message) =>
                message.type === "request" ? (
                  <RequestMessageBubble
                    key={message.id}
                    message={message}
                    mine={message.senderOrgId === currentOrgId}
                    viewerRole={viewerRole}
                    onHold={() => handleHoldRequest(message.id, message.requestId)}
                    onDone={() => handleDoneRequest(message.id, message.requestId)}
                    onCancel={() => handleCancelRequest(message.id, message.requestId)}
                  />
                ) : message.type === "match_offer" ? (
                  <MatchOfferMessageBubble
                    key={message.id}
                    message={message}
                    mine={message.senderOrgId === currentOrgId}
                    canRequest={message.senderOrgId !== currentOrgId}
                    submitting={requestingMatchMessageId === message.id}
                    onRequestNow={() => handleRequestFromMatch(message)}
                  />
                ) : (
                  <Box
                    key={message.id}
                    sx={{
                      maxWidth: "min(520px, 100%)",
                      width: "fit-content",
                      minWidth: 0,
                      flexShrink: 0,
                      alignSelf:
                        message.senderOrgId === currentOrgId ? "flex-end" : "flex-start",
                      bgcolor:
                        message.senderOrgId === currentOrgId ? "var(--accent)" : "white",
                      color:
                        message.senderOrgId === currentOrgId ? "white" : "var(--foreground)",
                      border:
                        message.senderOrgId === currentOrgId ? "none" : "1px solid var(--border)",
                      borderRadius: "22px",
                      px: 1.5,
                      py: 1.2,
                      boxShadow: "var(--shadow-soft)",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>{message.text}</Typography>
                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: "0.78rem",
                        opacity: 0.7,
                      }}
                    >
                      {formatTime(message.createdAt)}
                    </Typography>
                  </Box>
                )
              )
              )}
            </Stack>

            <Box
              sx={{
                p: 2,
                borderTop: "1px solid var(--border)",
                bgcolor: "white",
              }}
            >
              <Stack direction="row" spacing={1.25}>
                <TextField
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  sx={{
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      minHeight: 54,
                      borderRadius: "18px",
                      bgcolor: "#fbfbf9",
                      "& fieldset": {
                        borderColor: "var(--border)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(40, 199, 167, 0.4)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--accent-strong)",
                        borderWidth: "2px",
                      },
                    },
                  }}
                />

                <Button
                  onClick={() => void handleSend()}
                  disabled={!selectedThread || !draft.trim()}
                  startIcon={<SendRoundedIcon />}
                  sx={{
                    minWidth: 120,
                    borderRadius: 999,
                    bgcolor: "var(--accent)",
                    color: "white",
                    fontWeight: 800,
                    textTransform: "none",
                    flexShrink: 0,
                    "& .MuiButton-startIcon": {
                      color: "white",
                    },
                    "&:hover": {
                      bgcolor: "var(--accent-strong)",
                      color: "white",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#eef2f1",
                      color: "#92a19d",
                    },
                  }}
                >
                  Send
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}