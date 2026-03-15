"use client";

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

type Props = {
  item: {
    key: string;
    name: string;
    category: string;
    image: string;
    tags: string[];
    totalQuantity: number;
    sourceCount: number;
  };
  active: boolean;
  showImage?: boolean;
  onClick: () => void;
};

export default function AggregatedResourceCard({
  item,
  active,
  showImage = true,
  onClick,
}: Props) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: showImage ? 1.5 : 2,
        borderRadius: "24px",
        border: "1px solid",
        borderColor: active ? "rgba(40, 199, 167, 0.34)" : "var(--border)",
        bgcolor: active ? "#f7fffc" : "white",
        boxShadow: active ? "0 8px 22px rgba(0,0,0,0.07)" : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "0.18s ease",
      }}
    >
      <Stack direction="row" spacing={showImage ? 1.5 : 0} alignItems="center">
        {showImage && (
          <Box
            component="img"
            src={item.image}
            alt={item.name}
            sx={{
              width: 82,
              height: 82,
              minWidth: 82,
              borderRadius: "18px",
              objectFit: "cover",
              bgcolor: "var(--accent-soft)",
              border: "1px solid rgba(49, 237, 199, 0.22)",
            }}
          />
        )}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              fontSize: "1.04rem",
            }}
          >
            {item.name}
          </Typography>

          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
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
              label={`Qty ${item.totalQuantity}`}
              sx={{
                borderRadius: 999,
                bgcolor: "var(--accent-soft)",
                color: "var(--accent-strong)",
                border: "1px solid rgba(40, 199, 167, 0.24)",
                fontWeight: 700,
              }}
            />

            <Chip
              size="small"
              label={`${item.sourceCount} places`}
              sx={{
                borderRadius: 999,
                bgcolor: "#fafaf8",
                border: "1px solid var(--border)",
                fontWeight: 700,
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}