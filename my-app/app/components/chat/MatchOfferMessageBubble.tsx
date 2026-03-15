"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import type { ChatMessage } from "@/app/lib/chat/chatTypes";

type Props = {
  message: ChatMessage;
  mine: boolean;
  canRequest: boolean;
  submitting: boolean;
  onRequestNow: () => void;
};

export default function MatchOfferMessageBubble({
  message,
  mine,
  canRequest,
  submitting,
  onRequestNow,
}: Props) {
  const offer = message.matchOffer;
  if (!offer) return null;

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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--accent-strong)",
            }}
          >
            Possible match
          </Typography>

          <Chip
            size="small"
            label={offer.actionTaken ? "Requested" : "Available"}
            sx={{
              borderRadius: 999,
              bgcolor: "white",
              fontWeight: 800,
            }}
          />
        </Stack>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Typography sx={{ color: "var(--muted)", fontSize: "0.92rem", mb: 1.2 }}>
          {message.text}
        </Typography>

        <Box
          sx={{
            p: 1.1,
            borderRadius: "16px",
            border: "1px solid var(--border)",
            bgcolor: "#fafaf8",
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>{offer.itemName}</Typography>
          <Typography sx={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Available quantity: {offer.availableQuantity}
          </Typography>
        </Box>

        {canRequest && !offer.actionTaken && (
          <Button
            onClick={onRequestNow}
            disabled={submitting}
            sx={{
              mt: 1.5,
              borderRadius: 999,
              px: 2.3,
              py: 1.05,
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
            {submitting ? "Sending..." : "Request item"}
          </Button>
        )}
      </Box>
    </Box>
  );
}