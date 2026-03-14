"use client";

import { useMemo, useState } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import OrgProfileHeader from "@/app/components/org/OrgProfileHeader";
import InventoryBrowseControls from "@/app/components/org/InventoryBrowseControls";
import WishlistPreviewCard from "@/app/components/org/WishlistPreviewCard";
import type { ItemCategory, ItemUrgency, OrgProfile } from "@/app/components/org/types";

const viewedOrg: OrgProfile = {
  id: "humanity-project",
  name: "The Humanity Project",
  bio: "Helping the Moncton community with essentials, outreach support, and day-to-day resources for people who need them most.",
  phoneNumber: "(506) 555-0187",
  address: "123 Main Street, Moncton, NB E1C 1A1",
  location: "Moncton, NB",
  bannerImage:
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80",
  avatarImage: "",
  askingItems: [
    {
      id: "a1",
      name: "Winter Coats",
      category: "clothing",
      urgency: "high",
      quantity: 12,
      image: "",
    },
    {
      id: "a2",
      name: "Toothbrushes",
      category: "hygiene",
      urgency: "medium",
      quantity: 40,
      image: "",
    },
    {
      id: "a3",
      name: "Granola Bars",
      category: "food",
      urgency: "low",
      quantity: 60,
      image: "",
    },
  ],
  offeringItems: [],
};

export default function UserOrgPage() {
  const [wishlistSearch, setWishlistSearch] = useState("");
  const [wishlistCategoryFilter, setWishlistCategoryFilter] = useState<ItemCategory[]>([]);
  const [wishlistUrgencyFilter, setWishlistUrgencyFilter] =
    useState<"all" | ItemUrgency>("all");

  const filteredWishlist = useMemo(() => {
    const urgencyRank: Record<ItemUrgency, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    let next = [...viewedOrg.askingItems];
    const normalizedSearch = wishlistSearch.trim().toLowerCase();

    if (normalizedSearch) {
      next = next.filter((item) => {
        const haystack = [
          item.name,
          item.category,
          String(item.quantity),
          item.urgency,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      });
    }

    if (wishlistUrgencyFilter !== "all") {
      next = next.filter((item) => item.urgency === wishlistUrgencyFilter);
    }

    if (wishlistCategoryFilter.length > 0) {
      next = next.filter((item) =>
        wishlistCategoryFilter.includes(item.category)
      );
    }

    return next.sort(
      (a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]
    );
  }, [wishlistSearch, wishlistUrgencyFilter, wishlistCategoryFilter]);

  return (
    <Box className="org-page-bg" sx={{ py: { xs: 0, md: 2.5 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
              px: { xs: 0.5, md: 0 },
            }}
          >
            <Box>
              <Typography
                sx={{
                  m: 0,
                  color: "var(--accent-strong)",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  fontWeight: 800,
                }}
              >
                Organization dashboard
              </Typography>

              <Typography
                sx={{
                  m: 0,
                  fontSize: "clamp(2rem, 6vw, 3.2rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  fontWeight: 800,
                }}
              >
                Member organisation profile
              </Typography>
            </Box>

            <Button
              startIcon={<ChatBubbleOutlineRoundedIcon />}
              sx={{
                borderRadius: 999,
                px: 2.2,
                py: 1.1,
                bgcolor: "var(--accent)",
                color: "white",
                fontWeight: 800,
                textTransform: "none",
                "& .MuiButton-startIcon": {
                  color: "white",
                },
                "&:hover": {
                  bgcolor: "var(--accent-strong)",
                  color: "white",
                },
              }}
            >
              Message
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 0,
              overflow: "hidden",
              borderRadius: "28px",
              border: "1px solid var(--border)",
              bgcolor: "rgba(255,255,255,0.96)",
              boxShadow: "var(--shadow)",
            }}
          >
            <OrgProfileHeader org={viewedOrg} onBioChange={() => {}} />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: "28px",
              border: "1px solid var(--border)",
              bgcolor: "var(--surface)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.05em",
                lineHeight: 0.95,
                fontSize: { xs: "2rem", md: "2.6rem" },
              }}
            >
              Wishlist
            </Typography>

            <Typography
              sx={{
                mt: 1.1,
                color: "var(--muted)",
                fontSize: "0.98rem",
                lineHeight: 1.6,
                maxWidth: 980,
              }}
            >
              These items are currently in need at {viewedOrg.id}. This section is read-only here, so users can quickly see what the organisation is currently looking for.
            </Typography>

            <InventoryBrowseControls
              kind="asking"
              search={wishlistSearch}
              categoryFilter={wishlistCategoryFilter}
              urgencyFilter={wishlistUrgencyFilter}
              onSearchChange={setWishlistSearch}
              onCategoryFilterChange={setWishlistCategoryFilter}
              onUrgencyFilterChange={setWishlistUrgencyFilter}
            />

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {filteredWishlist.map((item) => (
                <WishlistPreviewCard key={item.id} item={item} />
              ))}

              {filteredWishlist.length === 0 && (
                <Typography sx={{ color: "var(--muted)", px: 0.5 }}>
                  No wishlist items match the current filters.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}