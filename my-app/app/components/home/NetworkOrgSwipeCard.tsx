"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

type Props = {
  org: {
    id: string;
    name: string;
    location: string;
    bio: string;
    bannerImage: string;
  };
  onClick: () => void;
};

export default function NetworkOrgSwipeCard({ org, onClick }: Props) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        minWidth: { xs: 280, sm: 320, md: 340 },
        maxWidth: { xs: 280, sm: 320, md: 340 },
        borderRadius: "26px",
        overflow: "hidden",
        border: "1px solid var(--border)",
        bgcolor: "white",
        boxShadow: "var(--shadow-soft)",
        cursor: "pointer",
        scrollSnapAlign: "start",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "var(--shadow)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 190,
          overflow: "hidden",
          bgcolor: "var(--accent-soft)",
        }}
      >
        <Box
          component="img"
          src={org.bannerImage}
          alt={org.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.32), rgba(0,0,0,0.02))",
          }}
        />
      </Box>

      <Stack spacing={1.1} sx={{ p: 1.75 }}>
        <Typography
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.02,
            fontSize: "1.1rem",
          }}
        >
          {org.name}
        </Typography>

        <Typography
          sx={{
            color: "var(--accent-strong)",
            fontSize: "0.86rem",
            fontWeight: 700,
          }}
        >
          {org.location || "Location not provided"}
        </Typography>

        <Typography
          sx={{
            color: "var(--muted)",
            fontSize: "0.94rem",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "4.45em",
          }}
        >
          {org.bio || "No organisation description available yet."}
        </Typography>
      </Stack>
    </Paper>
  );
}