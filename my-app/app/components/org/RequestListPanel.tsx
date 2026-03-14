"use client";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import type { OfferingItem } from "./types";

type SelectedRequestItem = {
  item: OfferingItem;
  quantity: number;
};

type Props = {
  orgName: string;
  items: SelectedRequestItem[];
  onSubmit: () => void;
};

export default function RequestListPanel({ orgName, items, onSubmit }: Props) {
  const totalLines = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box
      sx={{
        position: { md: "sticky" },
        top: { md: 24 },
        borderRadius: "24px",
        border: "1px solid var(--border)",
        bgcolor: "white",
        boxShadow: "var(--shadow-soft)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Request list
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "var(--muted)",
            fontSize: "0.95rem",
            lineHeight: 1.55,
          }}
        >
          Review the items your organisation wants to request from {orgName}.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "var(--border)" }} />

      <Box sx={{ p: 2 }}>
        {items.length === 0 ? (
          <Typography sx={{ color: "var(--muted)" }}>
            No items selected yet.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {items.map(({ item, quantity }) => (
              <Box
                key={item.id}
                sx={{
                  p: 1.25,
                  borderRadius: "18px",
                  bgcolor: "#fafaf8",
                  border: "1px solid var(--border)",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {item.name}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    color: "var(--muted)",
                    fontSize: "0.92rem",
                    textTransform: "capitalize",
                  }}
                >
                  {item.category} · Requesting {quantity}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Divider sx={{ borderColor: "var(--border)" }} />

      <Box sx={{ p: 2 }}>
        <Stack spacing={0.8}>
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ color: "var(--muted)" }}>Item types</Typography>
            <Typography sx={{ fontWeight: 800 }}>{totalLines}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ color: "var(--muted)" }}>Total units</Typography>
            <Typography sx={{ fontWeight: 800 }}>{totalUnits}</Typography>
          </Stack>
        </Stack>

        <Button
          fullWidth
          disabled={items.length === 0}
          onClick={onSubmit}
          sx={{
            mt: 2,
            borderRadius: 999,
            py: 1.2,
            bgcolor: "var(--accent)",
            color: "#08352d",
            fontWeight: 800,
            textTransform: "none",
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
          Send request
        </Button>
      </Box>
    </Box>
  );
}