"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useRouter } from "next/navigation";
import AggregatedResourceCard from "@/app/components/home/AggregatedResourceCard";
import AggregatedItemOverlay from "@/app/components/home/AggregatedItemOverlay";
import NetworkOrgCarousel from "@/app/components/home/NetworkOrgCarousel";
import { subscribeAllOrgs } from "@/app/lib/firestore/orgs";
import { subscribeActiveListingsByKind } from "@/app/lib/firestore/listings";
import type { AskingItem, OrgProfile } from "@/app/components/org/types";
import type { ListingDoc, OrgDoc } from "@/app/lib/firestore/types";
import { openOrCreateThread } from "./lib/firestore/messages";

type BrowseMode = "asking" | "offering";
type NetworkOrg = OrgProfile;

type AggregateSource = {
  orgId: string;
  orgName: string;
  location: string;
  quantity: number;
  itemId: string;
  expiration?: string;
  urgency?: AskingItem["urgency"];
};

type AggregateItem = {
  key: string;
  name: string;
  category: string;
  image: string;
  tags: string[];
  totalQuantity: number;
  sourceCount: number;
  sources: AggregateSource[];
};

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80";

const orgs: NetworkOrg[] = [
  {
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
    ],
  },
  {
    id: "river-outreach",
    name: "River Outreach Centre",
    bio: "Neighbourhood outreach, food support, and emergency essentials.",
    phoneNumber: "(506) 555-0129",
    address: "89 River Road, Moncton, NB E1A 2B3",
    location: "Moncton, NB",
    bannerImage:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80",
    avatarImage: "",
    askingItems: [
      {
        id: "a3",
        name: "Granola Bars",
        category: "food",
        urgency: "high",
        quantity: 50,
        image: "",
      },
      {
        id: "a4",
        name: "Blankets",
        category: "supplies",
        urgency: "low",
        quantity: 6,
        image: "",
      },
    ],
    offeringItems: [
      {
        id: "o3",
        name: "Winter Coats",
        category: "clothing",
        expiration: undefined,
        quantity: 7,
        image: "https://placehold.co/120x120?text=Coat",
      },
      {
        id: "o4",
        name: "Toothbrushes",
        category: "hygiene",
        expiration: "2026-05-03",
        quantity: 30,
        image: "https://placehold.co/120x120?text=Brush",
      },
    ],
  },
];

const itemCatalog: Record<string, { image: string; tags: string[] }> = {
  "winter coats": {
    image: "https://placehold.co/320x220?text=Winter+Coats",
    tags: ["warm clothing", "cold weather", "essential"],
  },
  toothbrushes: {
    image: "https://placehold.co/320x220?text=Toothbrushes",
    tags: ["hygiene", "kits", "daily essentials"],
  },
  blankets: {
    image: "https://placehold.co/320x220?text=Blankets",
    tags: ["warmth", "shelter support", "comfort"],
  },
  "granola bars": {
    image: "https://placehold.co/320x220?text=Granola+Bars",
    tags: ["food", "ready to eat", "outreach"],
  },
  "bottled water": {
    image: "https://placehold.co/320x220?text=Water",
    tags: ["hydration", "food", "distribution"],
  },
};

function getCatalog(name: string, category: string) {
  const key = name.trim().toLowerCase();
  const fallbackImage = `https://placehold.co/320x220?text=${encodeURIComponent(name)}`;

  return (
    itemCatalog[key] ?? {
      image: fallbackImage,
      tags: [category],
    }
  );
}

function aggregateItems(mode: BrowseMode, allOrgs: NetworkOrg[]): AggregateItem[] {
  const map = new Map<string, AggregateItem>();

  for (const org of allOrgs) {
    const items = mode === "asking" ? org.askingItems : org.offeringItems;

    for (const item of items) {
      const key = `${item.name.trim().toLowerCase()}__${item.category}`;

      if (!map.has(key)) {
        const meta = getCatalog(item.name, item.category);

        map.set(key, {
          key,
          name: item.name,
          category: item.category,
          image: mode === "offering" ? item.image || meta.image : meta.image,
          tags: meta.tags,
          totalQuantity: 0,
          sourceCount: 0,
          sources: [],
        });
      }

      const entry = map.get(key)!;
      entry.totalQuantity += item.quantity;
      entry.sourceCount += 1;
      entry.sources.push({
        orgId: org.id,
        orgName: org.name,
        location: org.location,
        quantity: item.quantity,
        itemId: item.id,
        expiration: "expiration" in item ? item.expiration : undefined,
        urgency: "urgency" in item ? item.urgency : undefined,
      });
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function aggregateFirestoreItems(
  mode: BrowseMode,
  listings: ListingDoc[],
  orgDocs: OrgDoc[]
): AggregateItem[] {
  const orgMap = new Map(orgDocs.map((org) => [org.id, org]));
  const map = new Map<string, AggregateItem>();

  for (const listing of listings) {
    const key = `${listing.name.trim().toLowerCase()}__${listing.category}`;
    const meta = getCatalog(listing.name, listing.category);
    const org = orgMap.get(listing.orgId);

    if (!map.has(key)) {
      map.set(key, {
        key,
        name: listing.name,
        category: listing.category,
        image: mode === "offering" ? listing.imageUrl || meta.image : meta.image,
        tags: meta.tags,
        totalQuantity: 0,
        sourceCount: 0,
        sources: [],
      });
    }

    const entry = map.get(key)!;
    entry.totalQuantity += listing.quantity;
    entry.sourceCount += 1;
    entry.sources.push({
      orgId: listing.orgId,
      orgName: org?.name || listing.orgNameSnapshot || listing.orgId,
      location: org?.location || "",
      quantity: listing.quantity,
      itemId: listing.id,
      expiration: listing.expiration || undefined,
      urgency: listing.urgency || undefined,
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function mergeAggregates(
  filler: AggregateItem[],
  real: AggregateItem[]
): AggregateItem[] {
  const map = new Map<string, AggregateItem>();

  for (const item of filler) {
    map.set(item.key, {
      ...item,
      sources: [...item.sources],
    });
  }

  for (const item of real) {
    const existing = map.get(item.key);

    if (!existing) {
      map.set(item.key, {
        ...item,
        sources: [...item.sources],
      });
      continue;
    }

    const sourceMap = new Map(
      existing.sources.map((source) => [`${source.orgId}__${source.itemId}`, source])
    );

    for (const source of item.sources) {
      sourceMap.set(`${source.orgId}__${source.itemId}`, source);
    }

    map.set(item.key, {
      ...existing,
      image: existing.image || item.image,
      tags: Array.from(new Set([...existing.tags, ...item.tags])),
      totalQuantity: Array.from(sourceMap.values()).reduce(
        (sum, source) => sum + source.quantity,
        0
      ),
      sourceCount: sourceMap.size,
      sources: Array.from(sourceMap.values()),
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<BrowseMode>("offering");
  const [selectedKey, setSelectedKey] = useState("");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [requestSelection, setRequestSelection] = useState<{
    orgId: string;
    itemId: string;
    quantity: number;
  } | null>(null);

  const [realOrgs, setRealOrgs] = useState<OrgDoc[]>([]);
  const [realAskingListings, setRealAskingListings] = useState<ListingDoc[]>([]);
  const [realOfferingListings, setRealOfferingListings] = useState<ListingDoc[]>([]);

  useEffect(() => {
    const unsubOrgs = subscribeAllOrgs(setRealOrgs);
    const unsubAsking = subscribeActiveListingsByKind("asking", setRealAskingListings);
    const unsubOffering = subscribeActiveListingsByKind("offering", setRealOfferingListings);

    return () => {
      unsubOrgs();
      unsubAsking();
      unsubOffering();
    };
  }, []);

  const fillerAskingItems = useMemo(() => aggregateItems("asking", orgs), []);
  const fillerOfferingItems = useMemo(() => aggregateItems("offering", orgs), []);

  const realAskingItems = useMemo(
    () => aggregateFirestoreItems("asking", realAskingListings, realOrgs),
    [realAskingListings, realOrgs]
  );

  const realOfferingItems = useMemo(
    () => aggregateFirestoreItems("offering", realOfferingListings, realOrgs),
    [realOfferingListings, realOrgs]
  );

  const askingItems = useMemo(
    () => mergeAggregates(fillerAskingItems, realAskingItems),
    [fillerAskingItems, realAskingItems]
  );

  const offeringItems = useMemo(
    () => mergeAggregates(fillerOfferingItems, realOfferingItems),
    [fillerOfferingItems, realOfferingItems]
  );

  const aggregates = mode === "asking" ? offeringItems : askingItems;

  const filteredAggregates = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return aggregates;

    return aggregates.filter((item) => {
      const haystack = [
        item.name,
        item.category,
        item.tags.join(" "),
        ...item.sources.map((source) => source.orgName),
        ...item.sources.map((source) => source.location),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [aggregates, search]);

  const networkOrgCards = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        location: string;
        bio: string;
        bannerImage: string;
      }
    >();

    for (const org of orgs) {
      map.set(org.id, {
        id: org.id,
        name: org.name,
        location: org.location,
        bio: org.bio,
        bannerImage: org.bannerImage,
      });
    }

    for (const org of realOrgs) {
      map.set(org.id, {
        id: org.id,
        name: org.name || org.id,
        location: org.location || "",
        bio: org.bio || "",
        bannerImage: org.bannerImageUrl || FALLBACK_BANNER,
      });
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [realOrgs]);

  useEffect(() => {
    if (!filteredAggregates.some((item) => item.key === selectedKey)) {
      setSelectedKey(filteredAggregates[0]?.key ?? "");
    }
  }, [filteredAggregates, selectedKey]);

  useEffect(() => {
    setRequestSelection(null);
    setOverlayOpen(false);
  }, [mode]);

  const selectedItem =
    filteredAggregates.find((item) => item.key === selectedKey) ?? null;

  const overlayMode = mode === "asking" ? "offering" : "asking";

  const handleSourceQuantityChange = (
    orgId: string,
    itemId: string,
    max: number,
    next: number
  ) => {
    const safeNext = Math.max(0, Math.min(max, next));

    if (safeNext <= 0) {
      setRequestSelection((prev) => {
        if (!prev) return null;
        if (prev.orgId !== orgId || prev.itemId !== itemId) return prev;
        return null;
      });
      return;
    }

    setRequestSelection({
      orgId,
      itemId,
      quantity: safeNext,
    });
  };

  const handleRequest = () => {
    if (!requestSelection) return;

    router.push(
      `/org/${requestSelection.orgId}/member-org?prefillItem=${encodeURIComponent(
        requestSelection.itemId
      )}&prefillQty=${requestSelection.quantity}`
    );
  };

  const handleMessageOrg = async (source: AggregateSource) => {
    const threadId = await openOrCreateThread({
      currentOrgId: "neighbouring-organisation",
      currentOrgName: "Neighbouring organisation",
      otherOrgId: source.orgId,
      otherOrgName: source.orgName,
      subject: "Conversation",
    });

    router.push(`/messages/member-org?thread=${threadId}`);
  };

  return (
    <Box className="org-page-bg" sx={{ minHeight: "100vh", py: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box sx={{ px: { xs: 0.5, md: 0 } }}>
            <Typography
              sx={{
                color: "var(--accent-strong)",
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: 800,
              }}
            >
              GMHSC network
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.05em",
                fontWeight: 800,
              }}
            >
              Welcome to GMHSC resource sharing
            </Typography>

            <Typography
              sx={{
                mt: 1.2,
                color: "var(--muted)",
                fontSize: "1rem",
                maxWidth: 920,
                lineHeight: 1.65,
              }}
            >
              Browse what organisations are currently asking for and what they are
              offering across the network. Select an item to view every participating
              location in one place.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                onClick={() => setMode("asking")}
                sx={{
                  borderRadius: 999,
                  px: 2.2,
                  py: 1.05,
                  bgcolor: mode === "asking" ? "var(--accent)" : "white",
                  color: mode === "asking" ? "white" : "var(--foreground)",
                  border:
                    mode === "asking"
                      ? "1px solid transparent"
                      : "1px solid var(--border)",
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor:
                      mode === "asking" ? "var(--accent-strong)" : "#f7f7f4",
                    color: mode === "asking" ? "white" : "var(--foreground)",
                  },
                }}
              >
                I’m asking
              </Button>

              <Button
                onClick={() => setMode("offering")}
                sx={{
                  borderRadius: 999,
                  px: 2.2,
                  py: 1.05,
                  bgcolor: mode === "offering" ? "var(--accent)" : "white",
                  color: mode === "offering" ? "white" : "var(--foreground)",
                  border:
                    mode === "offering"
                      ? "1px solid transparent"
                      : "1px solid var(--border)",
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor:
                      mode === "offering" ? "var(--accent-strong)" : "#f7f7f4",
                    color: mode === "offering" ? "white" : "var(--foreground)",
                  },
                }}
              >
                I’m offering
              </Button>
            </Stack>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: "28px",
              border: "1px solid var(--border)",
              bgcolor: "var(--surface)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Typography
              sx={{
                px: 0.5,
                pb: 1.2,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontSize: "1.18rem",
              }}
            >
              {mode === "asking" ? "Network offerings" : "Network wishlist"}
            </Typography>

            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${mode === "asking" ? "offerings" : "wishlist"}`}
              fullWidth
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  minHeight: 54,
                  borderRadius: "18px",
                  bgcolor: "white",
                  "& fieldset": {
                    borderColor: "var(--border)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(40, 199, 167, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--accent-strong)",
                    borderWidth: "2px",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  paddingTop: "15px",
                  paddingBottom: "15px",
                  paddingLeft: "4px",
                  paddingRight: "14px",
                  fontSize: "0.96rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5, mr: 0.5 }}>
                    <SearchRoundedIcon sx={{ color: "var(--accent-strong)" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box
            sx={{
              maxHeight: { xs: 420, md: 560 },
              overflowY: "auto",
              px: 1,
              py: 1,
              mx: -0.5,
              my: -0.5,
              "&::-webkit-scrollbar": {
                width: 10,
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
            <Stack spacing={1.25}>
              {filteredAggregates.map((item) => (
                <AggregatedResourceCard
                  key={item.key}
                  item={item}
                  active={item.key === selectedKey && overlayOpen}
                  showImage={mode === "asking"}
                  onClick={() => {
                    setSelectedKey(item.key);
                    setOverlayOpen(true);
                  }}
                />
              ))}

              {filteredAggregates.length === 0 && (
                <Typography sx={{ color: "var(--muted)", px: 0.5, py: 1 }}>
                  No items match your search.
                </Typography>
              )}
            </Stack>
          </Box>
          </Paper>

          <Box sx={{ mt: 0.5 }}>
            <NetworkOrgCarousel orgs={networkOrgCards} />
          </Box>
        </Stack>
      </Container>

      <AggregatedItemOverlay
        open={overlayOpen}
        mode={overlayMode}
        item={selectedItem}
        requestSelection={requestSelection}
        showImage={mode === "asking"}
        onClose={() => setOverlayOpen(false)}
        onSourceQuantityChange={handleSourceQuantityChange}
        onRequest={handleRequest}
        onMessageOrg={handleMessageOrg}
      />
    </Box>
  );
}