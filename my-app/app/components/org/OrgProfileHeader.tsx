"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { OrgProfile } from "./types";

type Props = {
  org: OrgProfile;
  onBioChange: (value: string) => void;
};

export default function OrgProfileHeader({ org, onBioChange }: Props) {
  const [bioDraft, setBioDraft] = useState(org.bio);
  const [editingBio, setEditingBio] = useState(false);
  const bioInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setBioDraft(org.bio);
  }, [org.bio]);

  useEffect(() => {
    if (editingBio) {
      bioInputRef.current?.focus();
    }
  }, [editingBio]);

  const handleSaveBio = () => {
    onBioChange(bioDraft.trim() || org.bio);
    setEditingBio(false);
  };

  return (
    <Box>
      <Box
        sx={{
          height: { xs: 220, md: 300 },
          position: "relative",
          backgroundImage: `url(${org.bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.08) 45%, rgba(255,255,255,0.92) 88%, rgba(255,255,255,1) 100%)",
          }}
        />
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pb: { xs: 2.5, md: 3 },
          mt: { xs: -3, md: -4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 1.5 }}
          >
            <Chip
              icon={<CallOutlinedIcon />}
              label={org.phoneNumber}
              sx={{
                borderRadius: 999,
                bgcolor: "white",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                fontWeight: 700,
              }}
            />

            <Chip
              icon={<PlaceOutlinedIcon />}
              label={org.address}
              sx={{
                borderRadius: 999,
                bgcolor: "var(--accent-soft)",
                color: "var(--accent-strong)",
                border: "1px solid rgba(40, 199, 167, 0.24)",
                fontWeight: 700,
                maxWidth: "100%",
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                },
              }}
            />
          </Stack>

          <Box sx={{ mt: 1.5, maxWidth: 900 }}>
            {editingBio ? (
              <Box
                sx={{
                  border: "1px solid var(--border)",
                  borderRadius: "18px",
                  bgcolor: "white",
                  px: 1.5,
                  py: 1.25,
                  maxWidth: 760,
                }}
              >
                <InputBase
                  inputRef={bioInputRef}
                  multiline
                  fullWidth
                  minRows={3}
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  sx={{
                    width: "100%",
                    color: "var(--foreground)",
                    fontSize: "1rem",
                    lineHeight: 1.5,
                  }}
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                    onClick={() => {
                      setBioDraft(org.bio);
                      setEditingBio(false);
                    }}
                    sx={{
                      borderRadius: 999,
                      color: "var(--foreground)",
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleSaveBio}
                    sx={{
                      borderRadius: 999,
                      bgcolor: "var(--accent)",
                      color: "#08352d",
                      fontWeight: 800,
                      "&:hover": {
                        bgcolor: "var(--accent-strong)",
                        color: "white",
                      },
                    }}
                  >
                    Save bio
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{ maxWidth: 900 }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "var(--muted)",
                    fontSize: "1rem",
                    flex: 1,
                  }}
                >
                  {org.bio}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => setEditingBio(true)}
                  sx={{
                    mt: "-2px",
                    border: "1px solid var(--border)",
                    bgcolor: "white",
                    flexShrink: 0,
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}