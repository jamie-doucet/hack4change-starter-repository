"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import OrgProfileHeader from "@/app/components/org/OrgProfileHeader";
import OfferingRequestCard from "@/app/components/org/OfferingRequestCard";
import RequestListPanel from "@/app/components/org/RequestListPanel";
import InventoryBrowseControls from "@/app/components/org/InventoryBrowseControls";
import WishlistPreviewCard from "@/app/components/org/WishlistPreviewCard";
import type {
  AskingItem,
  ItemCategory,
  ItemUrgency,
  OfferingItem,
  OrgProfile,
} from "@/app/components/org/types";

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
  offeringItems: [
    {
      id: "o1",
      name: "Bottled Water",
      category: "food",
      expiration: "2026-04-10",
      quantity: 24,
      image: "https://placehold.co/120x120?text=Water",
    },
    {
      id: "o2",
      name: "Blankets",
      category: "supplies",
      quantity: 8,
      image: "https://placehold.co/120x120?text=Blanket",
    },
    {
      id: "o3",
      name: "Socks",
      category: "clothing",
      quantity: 36,
      image: "https://placehold.co/120x120?text=Socks",
    },
  ],
};

function urgencyColor(urgency: AskingItem["urgency"]) {
  if (urgency === "low") return "#2e7d32";
  if (urgency === "medium") return "#b26a00";
  return "#c62828";
}

export default function MemberOrgOfferingsPage() {
  const [requestedQuantities, setRequestedQuantities] = useState<Record<string, number>>({});

  const [offeringSearch, setOfferingSearch] = useState("");
  const [offeringCategoryFilter, setOfferingCategoryFilter] = useState<ItemCategory[]>([]);

  const [wishlistSearch, setWishlistSearch] = useState("");
  const [wishlistCategoryFilter, setWishlistCategoryFilter] = useState<ItemCategory[]>([]);
  const [wishlistUrgencyFilter, setWishlistUrgencyFilter] = useState<"all" | ItemUrgency>("all");

  const handleQuantityChange = (itemId: string, next: number) => {
    setRequestedQuantities((prev) => {
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }

      return {
        ...prev,
        [itemId]: next,
      };
    });
  };

  const filteredOfferings = useMemo(() => {
    let next = [...viewedOrg.offeringItems];
    const normalizedSearch = offeringSearch.trim().toLowerCase();

    if (normalizedSearch) {
      next = next.filter((item) => {
        const haystack = [
          item.name,
          item.category,
          String(item.quantity),
          item.expiration ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      });
    }

    if (offeringCategoryFilter.length > 0) {
      next = next.filter((item) =>
        offeringCategoryFilter.includes(item.category)
      );
    }

    return next;
  }, [offeringSearch, offeringCategoryFilter]);

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

  const selectedItems = useMemo(() => {
    return viewedOrg.offeringItems
      .map((item) => ({
        item,
        quantity: requestedQuantities[item.id] ?? 0,
      }))
      .filter((entry) => entry.quantity > 0);
  }, [requestedQuantities]);

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

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
              alignItems: "start",
            }}
          >
            <Stack spacing={3}>
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
                  Offerings
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
                  {viewedOrg.id} has an over-abundance of these items, and is ready to share them with other organisation members. Use the quantity controls to choose what your organisation would like to request, then review the request list before submitting it.
                </Typography>

                <InventoryBrowseControls
                  kind="offering"
                  search={offeringSearch}
                  categoryFilter={offeringCategoryFilter}
                  urgencyFilter="all"
                  onSearchChange={setOfferingSearch}
                  onCategoryFilterChange={setOfferingCategoryFilter}
                  onUrgencyFilterChange={() => {}}
                />

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {filteredOfferings.map((item: OfferingItem) => (
                    <OfferingRequestCard
                      key={item.id}
                      item={item}
                      selectedQuantity={requestedQuantities[item.id] ?? 0}
                      onSelectedQuantityChange={handleQuantityChange}
                    />
                  ))}

                  {filteredOfferings.length === 0 && (
                    <Typography sx={{ color: "var(--muted)", px: 0.5 }}>
                      No offerings match the current filters.
                    </Typography>
                  )}
                </Stack>
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
                  These items are currently in need at {viewedOrg.id}. This section is read-only here, so your organisation can quickly see what they are looking for right now.
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
                  {filteredWishlist.map((item: AskingItem) => (
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

            <RequestListPanel
              orgName={viewedOrg.name}
              items={selectedItems}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}