"use client";

import { Box, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import NetworkOrgSwipeCard from "./NetworkOrgSwipeCard";

type OrgCard = {
  id: string;
  name: string;
  location: string;
  bio: string;
  bannerImage: string;
};

type Props = {
  orgs: OrgCard[];
};

export default function NetworkOrgCarousel({ orgs }: Props) {
  const router = useRouter();

  if (orgs.length === 0) return null;

  return (
    <Box>
      <Stack spacing={0.75} sx={{ px: { xs: 0.5, md: 0 } }}>
        <Typography
          sx={{
            color: "var(--accent-strong)",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontWeight: 800,
          }}
        >
          Member organisations
        </Typography>

        <Typography
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.04em",
            fontSize: { xs: "1.6rem", md: "2rem" },
            lineHeight: 1,
          }}
        >
          Browse organisations
        </Typography>

        <Typography
          sx={{
            color: "var(--muted)",
            fontSize: "0.96rem",
            lineHeight: 1.6,
            maxWidth: 860,
          }}
        >
          Swipe sideways to explore member organisations and open a profile.
        </Typography>
      </Stack>

      <Box
        sx={{
          mt: 1.75,
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          overflowY: "hidden",
          pb: 1,
          px: { xs: 0.5, md: 0 },
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            height: 10,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(40, 199, 167, 0.24)",
            borderRadius: 999,
          },
        }}
      >
        {orgs.map((org) => (
          <NetworkOrgSwipeCard
            key={org.id}
            org={org}
            onClick={() => router.push(`/org/${org.id}`)}
          />
        ))}
      </Box>
    </Box>
  );
}