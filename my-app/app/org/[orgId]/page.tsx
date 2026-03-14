"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

import OrgProfileHeader from "@/app/components/org/OrgProfileHeader";
import InventorySection from "@/app/components/org/InventorySection";
import InventoryItemDialog from "@/app/components/org/InventoryItemDialog";

import { DEMO_ORG } from "@/app/lib/demoContext";
import { subscribeOrg, upsertOrg } from "@/app/lib/firestore/orgs";
import {
  createListing,
  deleteListing,
  subscribeOrgListings,
  updateListing,
} from "@/app/lib/firestore/listings";
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

  const bioSaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubOrg = subscribeOrg(currentOrgId, setOrgDoc);
    const unsubAsking = subscribeOrgListings(currentOrgId, "asking", setAskingListings);
    const unsubOffering = subscribeOrgListings(
      currentOrgId,
      "offering",
      setOfferingListings
    );

    return () => {
      unsubOrg();
      unsubAsking();
      unsubOffering();

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
          imageUrl: askingItem.image,
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
          imageUrl: askingItem.image,
          urgency: askingItem.urgency,
        });
      }
    } else {
      const offeringItem = item as OfferingItem;

      if (dialogMode === "edit") {
        await updateListing(offeringItem.id, {
          name: offeringItem.name,
          category: offeringItem.category,
          quantity: offeringItem.quantity,
          imageUrl: offeringItem.image,
          expiration: offeringItem.expiration || undefined,
      });
      } else {
        await createListing({
          orgId: currentOrgId,
          orgNameSnapshot: currentOrgName,
          kind: "offering",
          name: offeringItem.name,
          category: offeringItem.category,
          quantity: offeringItem.quantity,
          imageUrl: offeringItem.image,
          expiration: offeringItem.expiration,
        });
      }
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

  const handleCameraNotImplemented = () => {
    window.alert("Camera sync is not wired to Firestore yet.");
  };

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
              onClick={() => router.push("/messages/org")}
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
            <OrgProfileHeader org={org} onBioChange={handleBioChange} />
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
              description={`${org.id} has an over-abundance of these items, and is ready to share them with other organisation members. When you have too much of something, update this list with the + button, or take a picture of everything at once to update automatically later. When things get picked up or used, remove them from the list by clicking the trash icon.`}
              items={org.offeringItems}
              onAddManual={() => handleOpenAdd("offering")}
              onAddCamera={handleCameraNotImplemented}
              onDeleteManual={() => {}}
              onDeleteMany={(ids) => handleDeleteMany("offering", ids)}
              onDeleteCamera={handleCameraNotImplemented}
              onEdit={(item) => handleOpenEdit("offering", item)}
            />
          </Paper>
        </Stack>
      </Container>

      <InventoryItemDialog
        open={dialogOpen}
        mode={dialogMode}
        kind={dialogKind}
        orgName={org.name}
        item={editingItem}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
      />
    </Box>
  );
}