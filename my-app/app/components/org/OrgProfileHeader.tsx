"use client";

import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import type { OrgProfile } from "./types";

type Props = {
  org: OrgProfile;
};

export default function OrgProfileHeader({ org }: Props) {
  return (
    <Box>
      <Box
        sx={{
          height: { xs: 210, md: 270 },
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          backgroundImage: `url(${org.bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mb: 3,
          border: "1px solid var(--border)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.12))",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 18,
            left: 18,
            zIndex: 1,
            px: 1.6,
            py: 0.8,
            borderRadius: 999,
            bgcolor: "rgba(243,255,252,0.94)",
            color: "#0f7f6c",
            border: "1px solid rgba(49, 237, 199, 0.28)",
            fontSize: "0.82rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Community support
        </Box>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{
          mt: { xs: -7, sm: -6, md: -6 },
          px: { xs: 1, sm: 2 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Avatar
          src={org.avatarImage}
          alt={org.name}
          sx={{
            width: 104,
            height: 104,
            border: "5px solid white",
            boxShadow: "var(--shadow-soft)",
            bgcolor: "var(--accent-soft)",
            color: "var(--foreground)",
            fontWeight: 800,
            fontSize: "2rem",
          }}
        >
          {org.name[0]}
        </Avatar>

        <Box
          sx={{
            pt: { xs: 0.5, sm: 4.5, md: 6 },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
              fontSize: { xs: "2rem", md: "3rem" },
              color: "#15211d",
            }}
          >
            {org.name}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "var(--muted)",
              mt: 1,
              maxWidth: 760,
              fontSize: "1rem",
            }}
          >
            {org.bio}
          </Typography>

          <Chip
            icon={<PlaceOutlinedIcon />}
            label={org.location}
            sx={{
              mt: 1.75,
              borderRadius: 999,
              bgcolor: "var(--accent-soft)",
              color: "var(--accent-strong)",
              border: "1px solid rgba(40, 199, 167, 0.24)",
              fontWeight: 700,
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}