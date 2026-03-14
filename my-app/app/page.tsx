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
import { openConversationThread } from "@/app/lib/chat/chatStore";
import type { AskingItem, OrgProfile } from "@/app/components/org/types";

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
  description: string;
  tags: string[];
  totalQuantity: number;
  sourceCount: number;
  sources: AggregateSource[];
};

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

const itemCatalog: Record<
  string,
  { image: string; description: string; tags: string[] }
> = {
  "winter coats": {
    image: "https://placehold.co/320x220?text=Winter+Coats",
    description:
      "Warm outerwear useful during cold weather and outdoor outreach support.",
    tags: ["warm clothing", "cold weather", "essential"],
  },
  toothbrushes: {
    image: "https://placehold.co/320x220?text=Toothbrushes",
    description:
      "Basic hygiene supplies that can be distributed individually in kits or outreach packs.",
    tags: ["hygiene", "kits", "daily essentials"],
  },
  blankets: {
    image: "https://placehold.co/320x220?text=Blankets",
    description:
      "Useful for warmth, emergency sleeping support, and cold-weather assistance.",
    tags: ["warmth", "shelter support", "comfort"],
  },
  "granola bars": {
    image: "https://placehold.co/320x220?text=Granola+Bars",
    description:
      "Simple ready-to-eat food that works well for quick distribution and outreach.",
    tags: ["food", "ready to eat", "outreach"],
  },
  "bottled water": {
    image: "https://placehold.co/320x220?text=Water",
    description:
      "Packaged drinking water suitable for quick distribution and emergency support.",
    tags: ["hydration", "food", "distribution"],
  },
};

function getCatalog(name: string, category: string) {
  const key = name.trim().toLowerCase();
  const fallbackImage = `https://placehold.co/320x220?text=${encodeURIComponent(name)}`;

  return (
    itemCatalog[key] ?? {
      image: fallbackImage,
      description: `${name} currently shared across member organisations.`,
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
          description: meta.description,
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

  const askingItems = useMemo(() => aggregateItems("asking", orgs), []);
  const offeringItems = useMemo(() => aggregateItems("offering", orgs), []);

  const aggregates = mode === "asking" ? offeringItems : askingItems;

  const filteredAggregates = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return aggregates;

    return aggregates.filter((item) => {
      const haystack = [
        item.name,
        item.category,
        item.description,
        item.tags.join(" "),
        ...item.sources.map((source) => source.orgName),
        ...item.sources.map((source) => source.location),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [aggregates, search]);

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

  const handleMessageOrg = (source: AggregateSource) => {
    const threadId = openConversationThread({
      orgLabel: source.orgName,
      memberOrgLabel: "Neighbouring organisation",
      createdBy: "member_org",
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

            <Stack spacing={1.25}>
              {filteredAggregates.map((item) => (
                <AggregatedResourceCard
                  key={item.key}
                  item={item}
                  active={item.key === selectedKey && overlayOpen}
                  showImage={mode !== "asking"}
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
          </Paper>
        </Stack>
      </Container>
    <AggregatedItemOverlay
      open={overlayOpen}
      mode={overlayMode}
      item={selectedItem}
      requestSelection={requestSelection}
      showImage={mode !== "asking"}
      onClose={() => setOverlayOpen(false)}
      onSourceQuantityChange={handleSourceQuantityChange}
      onRequest={handleRequest}
      onMessageOrg={handleMessageOrg}
    />
    </Box>
  );
}