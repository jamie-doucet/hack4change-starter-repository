"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { ChatMessage, ChatRole } from "@/app/lib/chat/chatTypes";

type Props = {
  message: ChatMessage;
  mine: boolean;
  viewerRole: ChatRole;
  onHold: () => void;
  onDone: () => void;
  onCancel: () => void;
};

function formatExpiry(value?: string | number | Date | null) {
  if (!value) return "";

  const date =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusColor(status?: ChatMessage["requestStatus"]) {
  if (status === "held") return "#9a5b00";
  if (status === "completed") return "#2e7d32";
  if (status === "cancelled") return "#c62828";
  return "#0f7f6c";
}

function statusLabel(status?: ChatMessage["requestStatus"]) {
  if (status === "held") return "On hold";
  if (status === "completed") return "Done";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

export default function RequestMessageBubble({
  message,
  mine,
  viewerRole,
  onHold,
  onDone,
  onCancel,
}: Props) {
  const effectiveStatus = message.requestStatus ?? "pending";

  const canHold = !mine && effectiveStatus === "pending";
  const canResolve = !mine && effectiveStatus === "held";

  return (
    <Box
      sx={{
        maxWidth: "min(520px, 100%)",
        width: "fit-content",
        minWidth: 0,
        flexShrink: 0,
        alignSelf: mine ? "flex-end" : "flex-start",
        borderRadius: "22px",
        border: "1px solid rgba(40, 199, 167, 0.28)",
        bgcolor: mine ? "#f5fffb" : "white",
        boxShadow: "var(--shadow-soft)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.2,
          bgcolor: "var(--accent-soft)",
          borderBottom: "1px solid rgba(40, 199, 167, 0.2)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--accent-strong)",
            }}
          >
            Request summary
          </Typography>

          <Chip
            size="small"
            label={statusLabel(effectiveStatus)}
            sx={{
              borderRadius: 999,
              bgcolor: "white",
              color: statusColor(effectiveStatus),
              border: `1px solid ${statusColor(effectiveStatus)}22`,
              fontWeight: 800,
            }}
          />
        </Stack>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Typography
          sx={{
            color: "var(--muted)",
            fontSize: "0.92rem",
            mb: 1.2,
          }}
        >
          {message.text}
        </Typography>

        {message.expiresAt && effectiveStatus === "pending" && (
          <Typography
            sx={{
              color: "var(--muted)",
              fontSize: "0.88rem",
              mb: 1.2,
            }}
          >
            Expires {formatExpiry(message.expiresAt)}
          </Typography>
        )}

        <Stack spacing={1}>
          {message.requestLines?.map((line, index) => (
            <Box
              key={`${line.itemName}-${index}`}
              sx={{
                p: 1.1,
                borderRadius: "16px",
                border: "1px solid var(--border)",
                bgcolor: "#fafaf8",
              }}
            >
              <Typography sx={{ fontWeight: 800 }}>{line.itemName}</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Requested quantity: {line.quantity}
              </Typography>
            </Box>
          ))}
        </Stack>

        {(canHold || canResolve) && (
          <Stack
            direction="row"
            spacing={1.25}
            justifyContent="center"
            sx={{ mt: 1.75 }}
          >
            {canHold && (
              <Button
                onClick={onHold}
                sx={{
                  minWidth: 128,
                  minHeight: 46,
                  px: 2.5,
                  borderRadius: 999,
                  bgcolor: "var(--accent)",
                  color: "white",
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "var(--accent-strong)",
                    color: "white",
                  },
                }}
              >
                Hold
              </Button>
            )}

            {canResolve && (
              <>
                <Button
                  onClick={onDone}
                  sx={{
                    minWidth: 128,
                    minHeight: 46,
                    px: 2.5,
                    borderRadius: 999,
                    bgcolor: "var(--accent)",
                    color: "white",
                    fontWeight: 800,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "var(--accent-strong)",
                      color: "white",
                    },
                  }}
                >
                  Done
                </Button>

                <Button
                  onClick={onCancel}
                  sx={{
                    minWidth: 128,
                    minHeight: 46,
                    px: 2.5,
                    borderRadius: 999,
                    bgcolor: "#d32f2f",
                    color: "white",
                    fontWeight: 800,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#b71c1c",
                      color: "white",
                    },
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
