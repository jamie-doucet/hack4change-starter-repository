"use client";

import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type Props = {
  value: number;
  max: number;
  onChange: (next: number) => void;
};

export default function RequestQuantityControl({
  value,
  max,
  onChange,
}: Props) {
  const handleDecrease = () => {
    onChange(Math.max(0, value - 1));
  };

  const handleIncrease = () => {
    onChange(Math.min(max, value + 1));
  };

  const active = value > 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        p: 0.5,
        borderRadius: 999,
        border: "1px solid",
        borderColor: active ? "rgba(40, 199, 167, 0.36)" : "var(--border)",
        bgcolor: active ? "var(--accent-soft)" : "white",
        transition: "0.18s ease",
      }}
    >
      <IconButton
        size="small"
        onClick={handleDecrease}
        disabled={value === 0}
        sx={{
          width: 34,
          height: 34,
          bgcolor: "white",
          border: "1px solid var(--border)",
          "&:hover": {
            bgcolor: "#f7f7f4",
          },
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>

      <Typography
        sx={{
          minWidth: 26,
          textAlign: "center",
          fontWeight: 800,
          color: active ? "var(--accent-strong)" : "var(--foreground)",
        }}
      >
        {value}
      </Typography>

      <IconButton
        size="small"
        onClick={handleIncrease}
        disabled={value >= max}
        sx={{
          width: 34,
          height: 34,
          bgcolor: active ? "var(--accent)" : "white",
          color: active ? "#08352d" : "var(--foreground)",
          border: active ? "none" : "1px solid var(--border)",
          "&:hover": {
            bgcolor: active ? "var(--accent-strong)" : "#f7f7f4",
            color: active ? "white" : "var(--foreground)",
          },
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}