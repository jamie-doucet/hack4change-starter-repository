"use client";

import {
  Box,
  Card,
  CardActionArea,
  Checkbox,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { AskingItem, ItemUrgency } from "./types";

type Props = {
  item: AskingItem;
  deleteMode: boolean;
  checked: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onClick: (item: AskingItem) => void;
};

function urgencyColor(
  urgency: ItemUrgency
): "success" | "warning" | "error" {
  if (urgency === "low") return "success";
  if (urgency === "medium") return "warning";
  return "error";
}

function urgencyLabel(urgency: ItemUrgency) {
  if (urgency === "high") return "Needed now";
  if (urgency === "medium") return "Needed soon";
  return "Low urgency";
}

export default function AskingItemCard({
  item,
  deleteMode,
  checked,
  onCheck,
  onClick,
}: Props) {
  const content = (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        gap: 2,
        p: 2,
      }}
    >
      {deleteMode && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            checked={checked}
            onChange={(e) => onCheck(item.id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              color: "rgba(0,0,0,0.28)",
              "&.Mui-checked": {
                color: "var(--accent-strong)",
              },
            }}
          />
        </Box>
      )}

      <Box
        component="img"
        src={item.image}
        alt={item.name}
        sx={{
          width: 96,
          minWidth: 96,
          height: 96,
          borderRadius: "20px",
          objectFit: "cover",
          bgcolor: "var(--accent-soft)",
          border: "1px solid rgba(49, 237, 199, 0.22)",
        }}
      />

      <Stack spacing={1.2} sx={{ minWidth: 0, flex: 1, justifyContent: "center" }}>
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
              fontWeight: 600,
            }}
          />
          <Chip
            size="small"
            label={urgencyLabel(item.urgency)}
            color={urgencyColor(item.urgency)}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
            }}
          />
          <Chip
            size="small"
            label={`Qty ${item.quantity}`}
            sx={{
              borderRadius: 999,
              bgcolor: "var(--accent-soft)",
              color: "#0f7f6c",
              border: "1px solid rgba(49, 237, 199, 0.28)",
              fontWeight: 700,
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <Card
      sx={{
        borderRadius: "24px",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
        bgcolor: "var(--surface)",
        overflow: "hidden",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        "&:hover": {
          transform: deleteMode ? "none" : "translateY(-1px)",
          borderColor: "rgba(49, 237, 199, 0.4)",
          boxShadow: "var(--shadow-soft)",
        },
      }}
    >
      {deleteMode ? (
        <Box>{content}</Box>
      ) : (
        <CardActionArea onClick={() => onClick(item)}>{content}</CardActionArea>
      )}
    </Card>
  );
}