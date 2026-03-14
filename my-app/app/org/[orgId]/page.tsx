"use client";

import { useRef, useState } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import OrgProfileHeader from "@/app/components/org/OrgProfileHeader";
import InventorySection from "@/app/components/org/InventorySection";
import InventoryItemDialog from "@/app/components/org/InventoryItemDialog";
import BulkDetectedItemsDialog, {
  type InventoryDraftItem,
  defaultImageForCategory,
  makeBlankScannedDraft,
  makeScannedDraftFromDetection,
} from "@/app/components/org/BulkDetectedItemsDialog";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import type {
  AskingItem,
  InventoryItem,
  InventoryKind,
  OfferingItem,
  OrgProfile,
} from "@/app/components/org/types";

const initialOrg: OrgProfile = {
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
      id: "1",
      name: "Winter Coats",
      category: "clothing",
      urgency: "high",
      quantity: 12,
      image: "",
    },
    {
      id: "2",
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
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function OrgPage() {
  const [org, setOrg] = useState<OrgProfile>(initialOrg);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [dialogKind, setDialogKind] = useState<InventoryKind>("asking");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanKind, setScanKind] = useState<InventoryKind>("offering");
  const [scannedItems, setScannedItems] = useState<InventoryDraftItem[]>([]);

  const [scanAction, setScanAction] = useState<"add" | "delete">("add");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSaveItem = (item: InventoryItem) => {
    setOrg((prev) => {
      if (dialogKind === "asking") {
        const nextItem = item as AskingItem;
        const exists = prev.askingItems.some((value) => value.id === nextItem.id);

        return {
          ...prev,
          askingItems: exists
            ? prev.askingItems.map((value) =>
                value.id === nextItem.id ? nextItem : value
              )
            : [nextItem, ...prev.askingItems],
        };
      }

      const nextItem = item as OfferingItem;
      const exists = prev.offeringItems.some((value) => value.id === nextItem.id);

      return {
        ...prev,
        offeringItems: exists
          ? prev.offeringItems.map((value) =>
              value.id === nextItem.id ? nextItem : value
            )
          : [nextItem, ...prev.offeringItems],
      };
    });

    handleCloseDialog();
  };

  const handleDeleteMany = (kind: InventoryKind, ids: string[]) => {
    setOrg((prev) => {
      if (kind === "asking") {
        return {
          ...prev,
          askingItems: prev.askingItems.filter((item) => !ids.includes(item.id)),
        };
      }

      return {
        ...prev,
        offeringItems: prev.offeringItems.filter((item) => !ids.includes(item.id)),
      };
    });
  };

  const handleOpenCameraScan = (
    kind: InventoryKind,
    action: "add" | "delete"
  ) => {
    if (scanLoading || kind !== "offering") return;
    setScanKind(kind);
    setScanAction(action);
    fileInputRef.current?.click();
  };

  const handleCameraFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setScanLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      if (scanAction === "add") {
        const response = await fetch("/api/vision-items", {
          method: "POST",
          body: formData,
        });

        const raw = await response.text();
        let data: any;
        try {
          data = JSON.parse(raw);
        } catch {
          console.error("add route raw response:", raw);
          throw new Error(raw || "Add route did not return JSON.");
        }

        if (!response.ok) {
          throw new Error(data?.error || "Failed to scan image.");
        }

        const detected = Array.isArray(data?.items) ? data.items : [];

        const nextDrafts =
          detected.length > 0
            ? detected.map((item: { quantity: number; name: string }) =>
                makeScannedDraftFromDetection(scanKind, item)
              )
            : [makeBlankScannedDraft(scanKind)];

        setScannedItems(nextDrafts);
        setScanDialogOpen(true);
        return;
      }

      formData.append(
        "items",
        JSON.stringify(
          org.offeringItems.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            expiration: item.expiration,
          }))
        )
      );

      const response = await fetch("/api/vision-delete-items", {
        method: "POST",
        body: formData,
      });

      const raw = await response.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("delete route raw response:", raw);
        throw new Error(raw || "Delete route did not return JSON.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to compare image.");
      }

      const matchedItems = Array.isArray(data?.matched_items)
        ? data.matched_items
        : [];

      const nextDrafts =
        matchedItems.length > 0
          ? matchedItems
              .map((match: { id: string; quantity_found: number }) => {
                const source = org.offeringItems.find((item) => item.id === match.id);
                if (!source) return null;

                return {
                  tempId: makeId(),
                  sourceId: source.id,
                  name: source.name,
                  quantity: String(Math.max(1, match.quantity_found || 1)),
                  category: source.category,
                  urgency: "medium" as const,
                  expiration: source.expiration ?? "",
                  image: source.image,
                };
              })
              .filter(Boolean) as InventoryDraftItem[]
          : [];

      setScannedItems(nextDrafts);
      setScanDialogOpen(true);
    } catch (error) {
      console.error(error);
      window.alert("Could not process that image.");
    } finally {
      setScanLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCloseScanDialog = () => {
    setScanDialogOpen(false);
    setScannedItems([]);
  };

  const handleConfirmScannedItems = (items: InventoryDraftItem[]) => {
    if (scanAction === "delete") {
      const deleteMap = new Map<string, number>();

      for (const item of items) {
        if (!item.sourceId) continue;

        const parsed = Number.parseInt(item.quantity, 10);
        const quantityToRemove =
          Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

        deleteMap.set(item.sourceId, quantityToRemove);
      }

      if (deleteMap.size === 0) {
        handleCloseScanDialog();
        return;
      }

      setOrg((prev) => ({
        ...prev,
        offeringItems: prev.offeringItems
          .map((item) => {
            const quantityToRemove = deleteMap.get(item.id);
            if (!quantityToRemove) return item;

            const remaining = item.quantity - quantityToRemove;

            if (remaining <= 0) {
              return null;
            }

            return {
              ...item,
              quantity: remaining,
            };
          })
          .filter((item): item is OfferingItem => item !== null),
      }));

      handleCloseScanDialog();
      return;
    }

    const valid = items.filter((item) => item.name.trim());

    if (valid.length === 0) return;

    setOrg((prev) => {
      const finalized: OfferingItem[] = valid.map((item) => {
        const parsedQuantity = Number.parseInt(item.quantity, 10);

        return {
          id: makeId(),
          name: item.name.trim(),
          category: item.category,
          expiration: item.expiration || undefined,
          quantity:
            Number.isFinite(parsedQuantity) && parsedQuantity > 0
              ? parsedQuantity
              : 1,
          image: item.image || defaultImageForCategory(item.category),
        };
      });

      return {
        ...prev,
        offeringItems: [...finalized, ...prev.offeringItems],
      };
    });

    handleCloseScanDialog();
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
            <OrgProfileHeader
              org={org}
              onBioChange={(value) =>
                setOrg((prev) => ({
                  ...prev,
                  bio: value,
                }))
              }
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
            description={`These items are currently in need at ${org.id}. Anyone interested in making a donation may view them, and you will be notified when another organisation is offering them. Add items to the wishlist with + icon, and remove them when no longer needed by clicking the trash icon. You can also search for something specific, look for only items in a certain category, and sort by urgency if you'd like. Click on any existing item to change something about it.`}
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
            description={`${org.id} has an over-abundance of these items, and is ready to share them with other organisation members. When you have too much of something, update this list with the + button, OR take a picture of everything at once to update automatically. When things get picked up or used, remove them from the list by clicking the trash icon, where you can choose to use the camera again.`}
            items={org.offeringItems}
            onAddManual={() => handleOpenAdd("offering")}
            onAddCamera={() => handleOpenCameraScan("offering", "add")}
            onDeleteManual={() => {}}
            onDeleteMany={(ids) => handleDeleteMany("offering", ids)}
            onDeleteCamera={() => handleOpenCameraScan("offering", "delete")}
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

      <BulkDetectedItemsDialog
        open={scanDialogOpen}
        kind={scanKind}
        action={scanAction}
        items={scannedItems}
        onClose={handleCloseScanDialog}
        onChange={setScannedItems}
        onConfirm={handleConfirmScannedItems}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleCameraFileChange}
      />
    </Box>
  );
}