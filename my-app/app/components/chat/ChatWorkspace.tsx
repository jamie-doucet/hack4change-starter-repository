"use client";

import { useEffect, useMemo, useState } from "react";
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
  getPeerLabel,
  markThreadRead,
  readChatState,
  sendTextMessage,
  subscribeChatState,
} from "@/app/lib/chat/chatStore";
import type { ChatRole, ChatThread } from "@/app/lib/chat/chatTypes";
import { updateRequestMessageStatus } from "@/app/lib/chat/chatStore";

type Props = {
  viewerRole: ChatRole;
  title: string;
};

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function lastMessagePreview(thread: ChatThread) {
  const last = thread.messages[thread.messages.length - 1];
  if (!last) return "No messages yet.";
  return last.text;
}

export default function ChatWorkspace({
  viewerRole,
  title,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const sync = () => {
      setThreads(readChatState().threads);
    };

    sync();
    return subscribeChatState(sync);
  }, []);

  useEffect(() => {
    const requestedThread = searchParams.get("thread");

    if (requestedThread && threads.some((thread) => thread.id === requestedThread)) {
      setSelectedThreadId(requestedThread);
      return;
    }

    if (!requestedThread && !selectedThreadId && threads.length > 0) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, searchParams, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;

    markThreadRead(selectedThreadId, viewerRole);
    router.replace(`${pathname}?thread=${selectedThreadId}`);
  }, [selectedThreadId, viewerRole, pathname, router]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );

  const handleSend = () => {
    if (!selectedThreadId || !draft.trim()) return;

    sendTextMessage({
      threadId: selectedThreadId,
      senderRole: viewerRole,
      text: draft,
    });

    setDraft("");
  };

  return (
    <Box
      className="org-page-bg"
      sx={{
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
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
                Conversations update live between open tabs.
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
                threads.map((thread) => {
                  return (
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
                            {getPeerLabel(thread, viewerRole)}
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
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography
                          sx={{
                            color: "var(--muted)",
                            fontSize: "0.8rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatTime(thread.updatedAt)}
                        </Typography>
                      </Stack>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid var(--border)",
                bgcolor: "white",
                flexShrink: 0,
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
                    {getPeerLabel(selectedThread, viewerRole)}
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
              spacing={1.25}
              sx={{
                p: 2,
                minHeight: 0,
                flex: 1,
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
              ) : selectedThread.messages.length === 0 ? (
                <Typography sx={{ color: "var(--muted)" }}>
                  No messages yet. Send the first one below.
                </Typography>
              ) : (
                selectedThread.messages.map((message) =>
                  message.type === "request" ? (
                  <RequestMessageBubble
                    key={message.id}
                    message={message}
                    mine={message.senderRole === viewerRole}
                    viewerRole={viewerRole}
                    onHold={() =>
                      updateRequestMessageStatus({
                        threadId: selectedThread.id,
                        messageId: message.id,
                        status: "held",
                      })
                    }
                    onDone={() =>
                      updateRequestMessageStatus({
                        threadId: selectedThread.id,
                        messageId: message.id,
                        status: "completed",
                      })
                    }
                    onCancel={() =>
                      updateRequestMessageStatus({
                        threadId: selectedThread.id,
                        messageId: message.id,
                        status: "cancelled",
                      })
                    }
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
                        message.senderRole === viewerRole
                          ? "flex-end"
                          : "flex-start",
                      bgcolor:
                        message.senderRole === viewerRole
                          ? "var(--accent)"
                          : "white",
                      color:
                        message.senderRole === viewerRole
                          ? "white"
                          : "var(--foreground)",
                      border:
                        message.senderRole === viewerRole
                          ? "none"
                          : "1px solid var(--border)",
                      borderRadius: "22px",
                      px: 1.5,
                      py: 1.2,
                      boxShadow: "var(--shadow-soft)",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {message.text}
                      </Typography>
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
                flexShrink: 0,
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
                      handleSend();
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
                  onClick={handleSend}
                  disabled={!selectedThread || !draft.trim()}
                  startIcon={<SendRoundedIcon />}
                  sx={{
                    minWidth: 120,
                    borderRadius: 999,
                    bgcolor: "var(--accent)",
                    color: "#08352d",
                    fontWeight: 800,
                    textTransform: "none",
                    flexShrink: 0,
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