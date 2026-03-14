"use client";

import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import type { OfferingItem } from "./types";
import RequestQuantityControl from "./RequestQuantityControl";

type Props = {
  item: OfferingItem;
  selectedQuantity: number;
  onSelectedQuantityChange: (itemId: string, next: number) => void;
};

function formatExpiration(value?: string) {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${monthNames[Number(month) - 1] ?? month} ${Number(day)}, ${year}`;
}

export default function OfferingRequestCard({
  item,
  selectedQuantity,
  onSelectedQuantityChange,
}: Props) {
  const active = selectedQuantity > 0;

  return (
    <Card
      sx={{
        borderRadius: "24px",
        border: "1px solid",
        borderColor: active ? "rgba(40, 199, 167, 0.34)" : "var(--border)",
        boxShadow: active ? "var(--shadow)" : "var(--shadow-soft)",
        bgcolor: active ? "#f7fffc" : "white",
        overflow: "hidden",
        transition: "0.18s ease",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "96px minmax(0, 1fr) auto" },
          gap: 2,
          alignItems: "center",
          p: 2,
        }}
      >
        <Box
          component="img"
          src={item.image}
          alt={item.name}
          sx={{
            width: { xs: "100%", md: 96 },
            height: { xs: 180, md: 96 },
            borderRadius: "20px",
            objectFit: "cover",
            bgcolor: "var(--accent-soft)",
            border: "1px solid rgba(49, 237, 199, 0.22)",
          }}
        />

        <Stack spacing={1.1} sx={{ minWidth: 0 }}>
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
              label={`Available ${item.quantity}`}
              sx={{
                borderRadius: 999,
                bgcolor: "var(--accent-soft)",
                color: "var(--accent-strong)",
                border: "1px solid rgba(40, 199, 167, 0.24)",
                fontWeight: 700,
              }}
            />

            {item.expiration && (
              <Chip
                size="small"
                label={`Expires ${formatExpiration(item.expiration)}`}
                sx={{
                  borderRadius: 999,
                  bgcolor: "#fff8e8",
                  color: "#8a5a00",
                  border: "1px solid rgba(255, 193, 7, 0.24)",
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>

          {active && (
            <Typography
              sx={{
                color: "var(--accent-strong)",
                fontWeight: 700,
                fontSize: "0.92rem",
              }}
            >
              Added to request list
            </Typography>
          )}
        </Stack>

        <Box sx={{ justifySelf: { xs: "start", md: "end" } }}>
          <RequestQuantityControl
            value={selectedQuantity}
            max={item.quantity}
            onChange={(next) => onSelectedQuantityChange(item.id, next)}
          />
        </Box>
      </Box>
    </Card>
  );
}