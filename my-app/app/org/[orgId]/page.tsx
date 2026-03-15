"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Backdrop,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

import OrgProfileHeader from "@/app/components/org/OrgProfileHeader";
import InventorySection from "@/app/components/org/InventorySection";
import InventoryItemDialog from "@/app/components/org/InventoryItemDialog";
import BulkDetectedItemsDialog, {
  makeScannedDraftFromDetection,
  type InventoryDraftAction,
  type InventoryDraftItem,
} from "@/app/components/org/BulkDetectedItemsDialog";
import WishlistGroupDialog from "@/app/components/org/WishlistGroupDialog";

import { notifyMatchingRequesters } from "@/app/lib/firestore/matches";
import { normalizeItemKey } from "@/app/lib/firestore/helpers";

import { DEMO_ORG } from "@/app/lib/demoContext";
import { subscribeOrg, upsertOrg } from "@/app/lib/firestore/orgs";
import {
  createListing,
  deleteListing,
  subscribeOrgListings,
  updateListing,
} from "@/app/lib/firestore/listings";
import {
  saveWishlistGroup,
  subscribeWishlistGroups,
  type WishlistGroupDoc,
  type WishlistGroupItem,
} from "@/app/lib/firestore/wishlistGroups";
import {
  listingToAskingItem,
  listingToOfferingItem,
  orgDocToProfile,
} from "@/app/lib/firestore/orgPageMappers";

import type {
  AskingItem,
  InventoryItem,
  InventoryKind,
  OfferingItem,
  OrgProfile,
} from "@/app/components/org/types";
import type { ListingDoc, OrgDoc } from "@/app/lib/firestore/types";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80";

function parsePositiveInt(value: string, fallback = 1) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function OrgPage() {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();

  const currentOrgId =
    typeof params?.orgId === "string" && params.orgId.trim()
      ? params.orgId
      : DEMO_ORG.id;

  const [orgDoc, setOrgDoc] = useState<OrgDoc | null>(null);
  const [askingListings, setAskingListings] = useState<ListingDoc[]>([]);
  const [offeringListings, setOfferingListings] = useState<ListingDoc[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [dialogKind, setDialogKind] = useState<InventoryKind>("asking");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<InventoryDraftAction>("add");
  const [bulkItems, setBulkItems] = useState<InventoryDraftItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const [wishlistGroupDialogOpen, setWishlistGroupDialogOpen] = useState(false);
  const [wishlistGroups, setWishlistGroups] = useState<WishlistGroupDoc[]>([]);

  const bioSaveTimeoutRef = useRef<number | null>(null);
  const pendingCameraActionRef = useRef<InventoryDraftAction | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubOrg = subscribeOrg(currentOrgId, setOrgDoc);
    const unsubAsking = subscribeOrgListings(currentOrgId, "asking", setAskingListings);
    const unsubOffering = subscribeOrgListings(
      currentOrgId,
      "offering",
      setOfferingListings
    );
    const unsubWishlistGroups = subscribeWishlistGroups(
      currentOrgId,
      setWishlistGroups
    );

    return () => {
      unsubOrg();
      unsubAsking();
      unsubOffering();
      unsubWishlistGroups();

      if (bioSaveTimeoutRef.current) {
        window.clearTimeout(bioSaveTimeoutRef.current);
      }
    };
  }, [currentOrgId]);

  const org = useMemo<OrgProfile>(() => {
    if (!orgDoc) {
      return {
        id: currentOrgId,
        name: currentOrgId === DEMO_ORG.id ? DEMO_ORG.name : currentOrgId,
        bio: "",
        phoneNumber: "",
        address: "",
        location: "",
        bannerImage: FALLBACK_BANNER,
        avatarImage: "",
        askingItems: askingListings.map(listingToAskingItem),
        offeringItems: offeringListings.map(listingToOfferingItem),
      };
    }

    const mapped = orgDocToProfile(
      orgDoc,
      askingListings.map(listingToAskingItem),
      offeringListings.map(listingToOfferingItem)
    );

    return {
      ...mapped,
      bannerImage: mapped.bannerImage || FALLBACK_BANNER,
      avatarImage: mapped.avatarImage || "",
    };
  }, [currentOrgId, orgDoc, askingListings, offeringListings]);

  const handleOpenAdd = (kind: InventoryKind) => {
    setDialogMode("add");
    setDialogKind(kind);
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (kind: InventoryKind, item: InventoryItem) => {
    setDialogMode("edit");
    setDialogKind(kind);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSaveItem = async (item: InventoryItem) => {
    const currentOrgName = org.name || DEMO_ORG.name;

    if (dialogKind === "asking") {
      const askingItem = item as AskingItem;

      if (dialogMode === "edit") {
        await updateListing(askingItem.id, {
          name: askingItem.name,
          category: askingItem.category,
          quantity: askingItem.quantity,
          imageUrl: askingItem.image || undefined,
          urgency: askingItem.urgency,
        });
      } else {
        await createListing({
          orgId: currentOrgId,
          orgNameSnapshot: currentOrgName,
          kind: "asking",
          name: askingItem.name,
          category: askingItem.category,
          quantity: askingItem.quantity,
          imageUrl: askingItem.image || undefined,
          urgency: askingItem.urgency,
        });
      }

      handleCloseDialog();
      return;
    }

    const offeringItem = item as OfferingItem;

    if (dialogMode === "edit") {
      await updateListing(offeringItem.id, {
        name: offeringItem.name,
        category: offeringItem.category,
        quantity: offeringItem.quantity,
        imageUrl: offeringItem.image || undefined,
        expiration: offeringItem.expiration || undefined,
      });

      await notifyMatchingRequesters({
        offeringListingId: offeringItem.id,
        offeringOrgId: currentOrgId,
        offeringOrgName: currentOrgName,
        itemKey: normalizeItemKey(offeringItem.name),
        itemName: offeringItem.name,
        quantity: offeringItem.quantity,
      });
    } else {
      const newListingId = await createListing({
        orgId: currentOrgId,
        orgNameSnapshot: currentOrgName,
        kind: "offering",
        name: offeringItem.name,
        category: offeringItem.category,
        quantity: offeringItem.quantity,
        imageUrl: offeringItem.image || undefined,
        expiration: offeringItem.expiration || undefined,
      });

      await notifyMatchingRequesters({
        offeringListingId: newListingId,
        offeringOrgId: currentOrgId,
        offeringOrgName: currentOrgName,
        itemKey: normalizeItemKey(offeringItem.name),
        itemName: offeringItem.name,
        quantity: offeringItem.quantity,
      });
    }

    handleCloseDialog();
  };

  const handleDeleteMany = async (_kind: InventoryKind, ids: string[]) => {
    await Promise.all(ids.map((id) => deleteListing(id)));
  };

  const handleBioChange = (value: string) => {
    if (bioSaveTimeoutRef.current) {
      window.clearTimeout(bioSaveTimeoutRef.current);
    }

    bioSaveTimeoutRef.current = window.setTimeout(async () => {
      await upsertOrg({
        id: currentOrgId,
        name: org.name || DEMO_ORG.name,
        bio: value,
        phoneNumber: org.phoneNumber || "",
        address: org.address || "",
        location: org.location || "",
        bannerImageUrl: org.bannerImage || FALLBACK_BANNER,
        isActive: true,
      });
    }, 350);
  };

  const openCameraFlow = (action: InventoryDraftAction) => {
    pendingCameraActionRef.current = action;
    fileInputRef.current?.click();
  };

  const handleCameraFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    const action = pendingCameraActionRef.current;

    event.target.value = "";

    if (!file || !action) return;

    try {
      setIsScanning(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/vision-items", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        items?: Array<{ quantity: number; name: string }>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Scan failed.");
      }

      const detections = Array.isArray(data.items) ? data.items : [];

      if (action === "add") {
        const drafts = detections.map((detected) =>
          makeScannedDraftFromDetection("offering", detected)
        );

        setBulkAction("add");
        setBulkItems(drafts);
        setBulkDialogOpen(true);
        return;
      }

      const matchedDrafts: InventoryDraftItem[] = [];

      for (const detected of detections) {
        const match = org.offeringItems.find(
          (item) => normalizeItemKey(item.name) === normalizeItemKey(detected.name)
        );

        if (!match) continue;

        const maxQty = Number(match.quantity) || 1;
        const detectedQty = Math.max(1, Math.round(detected.quantity || 1));

        matchedDrafts.push({
          tempId: Math.random().toString(36).slice(2, 10),
          sourceId: match.id,
          name: match.name,
          quantity: String(Math.min(maxQty, detectedQty)),
          category: match.category,
          urgency: "medium",
          expiration:
            "expiration" in match && typeof match.expiration === "string"
              ? match.expiration
              : "",
          image: match.image || "",
        });
      }

      setBulkAction("delete");
      setBulkItems(matchedDrafts);
      setBulkDialogOpen(true);
    } catch (error) {
      console.error(error);
      window.alert("Could not scan items from that image.");
    } finally {
      setIsScanning(false);
      pendingCameraActionRef.current = null;
    }
  };

  const handleConfirmBulkItems = async (items: InventoryDraftItem[]) => {
    const currentOrgName = org.name || DEMO_ORG.name;

    try {
      if (bulkAction === "add") {
        for (const item of items) {
          const name = item.name.trim();
          if (!name) continue;

          const quantity = parsePositiveInt(item.quantity, 1);

          const newListingId = await createListing({
            orgId: currentOrgId,
            orgNameSnapshot: currentOrgName,
            kind: "offering",
            name,
            category: item.category,
            quantity,
            imageUrl: item.image || undefined,
            expiration: item.expiration || undefined,
          });

          await notifyMatchingRequesters({
            offeringListingId: newListingId,
            offeringOrgId: currentOrgId,
            offeringOrgName: currentOrgName,
            itemKey: normalizeItemKey(name),
            itemName: name,
            quantity,
          });
        }
      } else {
        for (const item of items) {
          if (!item.sourceId) continue;

          const existing = org.offeringItems.find(
            (offeringItem) => offeringItem.id === item.sourceId
          );
          if (!existing) continue;

          const removeQty = parsePositiveInt(item.quantity, 1);
          const nextQty = Math.max(0, Number(existing.quantity) - removeQty);

          if (nextQty > 0) {
            await updateListing(existing.id, {
              quantity: nextQty,
            });
          } else {
            await deleteListing(existing.id);
          }
        }
      }

      setBulkDialogOpen(false);
      setBulkItems([]);
    } catch (error) {
      console.error(error);
      window.alert(
        bulkAction === "add"
          ? "Could not save detected items."
          : "Could not delete matched items."
      );
    }
  };

  const handleSaveWishlistGroup = async (input: {
    id?: string;
    name: string;
    items: WishlistGroupItem[];
  }) => {
    await saveWishlistGroup(currentOrgId, input);
  };

  const handleAddWishlistGroup = async (input: {
    items: WishlistGroupItem[];
    groupCount: number;
  }) => {
    const currentOrgName = org.name || DEMO_ORG.name;
    const multiplier = Math.max(1, input.groupCount || 1);

    const merged = new Map<
      string,
      { name: string; quantity: number; category: WishlistGroupItem["category"] }
    >();

    for (const item of input.items) {
      const name = item.name.trim();
      if (!name) continue;

      const key = `${normalizeItemKey(name)}__${item.category}`;
      const quantity = Math.max(1, item.quantity) * multiplier;

      const existing = merged.get(key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        merged.set(key, {
          name,
          quantity,
          category: item.category,
        });
      }
    }

    for (const item of merged.values()) {
      const existingWishlistItem = org.askingItems.find(
        (askingItem) =>
          normalizeItemKey(askingItem.name) === normalizeItemKey(item.name) &&
          askingItem.category === item.category
      );

      if (existingWishlistItem) {
        await updateListing(existingWishlistItem.id, {
          name: existingWishlistItem.name,
          category: existingWishlistItem.category,
          quantity: Number(existingWishlistItem.quantity) + item.quantity,
          imageUrl: existingWishlistItem.image || undefined,
          urgency: existingWishlistItem.urgency || "medium",
        });
      } else {
        await createListing({
          orgId: currentOrgId,
          orgNameSnapshot: currentOrgName,
          kind: "asking",
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          urgency: "medium",
        });
      }
    }

    setWishlistGroupDialogOpen(false);
  };

  return (
    <Box className="org-page-bg" sx={{ py: { xs: 1.5, md: 2.5 } }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleCameraFileChange}
      />

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
                Member organisation profile
              </Typography>
            </Box>
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
            <OrgProfileHeader
              org={org}
              onBioChange={handleBioChange}
              onMessageClick={() => router.push("/messages/org")}
            />
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
            <InventorySection
              kind="asking"
              title="Wishlist"
              description={`These items are currently in need at ${org.id}. Anyone interested in making a donation may view them, and you will be notified when another organisation is offering them. Add items to the wishlist with the + icon, and remove them when no longer needed by clicking the trash icon. You can also search for something specific, look for only items in a certain category, and sort by urgency if you'd like. Click on any existing item to change something about it.`}
              items={org.askingItems}
              onAddManual={() => handleOpenAdd("asking")}
              onAddCamera={() => {}}
              onAddGroup={() => setWishlistGroupDialogOpen(true)}
              onDeleteManual={() => {}}
              onDeleteMany={(ids) => handleDeleteMany("asking", ids)}
              onDeleteCamera={() => {}}
              onEdit={(item) => handleOpenEdit("asking", item)}
            />
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
            <InventorySection
              kind="offering"
              title="Offerings"
              description={`${org.name} has an over-abundance of these items, and is ready to share them with other organisation members. When you have too much of something, update this list with the + button. You can choose to enter items manually (recommended for large amounts of the same thing) OR take a picture of everything that you want to add all at once to update the offerings list automatically. When things are no longer being offered (they get picked up or used), remove them from the list by clicking the trash icon, where you can choose to use the camera again.`}
              items={org.offeringItems}
              onAddManual={() => handleOpenAdd("offering")}
              onAddCamera={() => openCameraFlow("add")}
              onDeleteManual={() => {}}
              onDeleteMany={(ids) => handleDeleteMany("offering", ids)}
              onDeleteCamera={() => openCameraFlow("delete")}
              onEdit={(item) => handleOpenEdit("offering", item)}
            />
          </Paper>
        </Stack>
      </Container>

      <Backdrop
        open={isScanning}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 10,
          bgcolor: "rgba(10, 18, 16, 0.55)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Box
          sx={{
            width: "min(520px, calc(100vw - 32px))",
            borderRadius: "28px",
            border: "1px solid rgba(40, 199, 167, 0.22)",
            bgcolor: "rgba(255,255,255,0.98)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            p: { xs: 2.25, md: 3 },
          }}
        >
          <Stack spacing={1.5}>
            <Typography
              sx={{
                color: "var(--accent-strong)",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: 800,
              }}
            >
              Camera scan
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "1.2rem", md: "1.45rem" },
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "var(--foreground)",
              }}
            >
              Scanning image...
            </Typography>

            <Typography
              sx={{
                color: "var(--muted)",
                fontSize: "0.96rem",
                lineHeight: 1.7,
              }}
            >
              Please wait while we detect items from the photo.
            </Typography>

            <LinearProgress
              sx={{
                mt: 0.5,
                height: 12,
                borderRadius: 999,
                bgcolor: "rgba(40, 199, 167, 0.12)",
                overflow: "hidden",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, var(--accent), var(--accent-strong))",
                },
              }}
            />
          </Stack>
        </Box>
      </Backdrop>

      <InventoryItemDialog
        open={dialogOpen}
        mode={dialogMode}
        kind={dialogKind}
        orgName={org.name}
        item={editingItem}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
      />

      <BulkDetectedItemsDialog
        open={bulkDialogOpen}
        kind="offering"
        action={bulkAction}
        items={bulkItems}
        onClose={() => {
          if (isScanning) return;
          setBulkDialogOpen(false);
          setBulkItems([]);
        }}
        onChange={setBulkItems}
        onConfirm={handleConfirmBulkItems}
      />

      <WishlistGroupDialog
        open={wishlistGroupDialogOpen}
        groups={wishlistGroups}
        onClose={() => setWishlistGroupDialogOpen(false)}
        onSaveGroup={handleSaveWishlistGroup}
        onAddToWishlist={handleAddWishlistGroup}
      />
    </Box>
  );
}