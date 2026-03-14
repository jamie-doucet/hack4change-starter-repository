"use client";

import { Chip, Paper, Stack, Typography } from "@mui/material";
import type { AskingItem } from "./types";

function urgencyColor(urgency: AskingItem["urgency"]) {
  if (urgency === "low") return "#2e7d32";
  if (urgency === "medium") return "#b26a00";
  return "#c62828";
}

type Props = {
  item: AskingItem;
};

export default function WishlistPreviewCard({ item }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "24px",
        border: "1px solid var(--border)",
        bgcolor: "white",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <Stack spacing={1.1}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          {item.name}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={item.category}
            sx={{
              borderRadius: 999,
              bgcolor: "white",
              border: "1px solid var(--border)",
              textTransform: "capitalize",
              fontWeight: 700,
            }}
          />

          <Chip
            size="small"
            label={item.urgency}
            sx={{
              borderRadius: 999,
              bgcolor: "white",
              color: urgencyColor(item.urgency),
              border: `1px solid ${urgencyColor(item.urgency)}22`,
              textTransform: "capitalize",
              fontWeight: 700,
            }}
          />

          <Chip
            size="small"
            label={`Needed ${item.quantity}`}
            sx={{
              borderRadius: 999,
              bgcolor: "var(--accent-soft)",
              color: "var(--accent-strong)",
              border: "1px solid rgba(40, 199, 167, 0.24)",
              fontWeight: 700,
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}