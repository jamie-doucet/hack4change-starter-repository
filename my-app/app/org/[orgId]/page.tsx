"use client";

import { useMemo, useRef, useState } from "react";
import { Box, Container, Paper, Stack, Typography, Chip } from "@mui/material";
import OrgProfileHeader from "@/app/components/org/OrgProfileHeader";
import InventorySection from "@/app/components/org/InventorySection";
import InventoryItemDialog from "@/app/components/org/InventoryItemDialog";
import BulkDetectedItemsDialog, {
  type InventoryDraftItem,
  defaultImageForCategory,
  makeBlankScannedDraft,
  makeScannedDraftFromDetection,
} from "@/app/components/org/BulkDetectedItemsDialog";
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
  location: "Moncton, NB",
  bannerImage:
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80",
  avatarImage: "https://placehold.co/200x200?text=Org",
  askingItems: [
    {
      id: "1",
      name: "Winter Coats",
      category: "clothing",
      urgency: "high",
      quantity: 12,
      image: "https://placehold.co/120x120?text=Coat",
    },
    {
      id: "2",
      name: "Toothbrushes",
      category: "hygiene",
      urgency: "medium",
      quantity: 40,
      image: "https://placehold.co/120x120?text=Brush",
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
  const [scanKind, setScanKind] = useState<InventoryKind>("asking");
  const [scannedItems, setScannedItems] = useState<InventoryDraftItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalItemTypes = useMemo(
    () => org.askingItems.length + org.offeringItems.length,
    [org.askingItems, org.offeringItems]
  );

  const totalUnits = useMemo(
    () =>
      [...org.askingItems, ...org.offeringItems].reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [org.askingItems, org.offeringItems]
  );

  const askingHighPriority = useMemo(
    () =>
      org.askingItems
        .filter((item) => item.urgency === "high")
        .reduce((sum, item) => sum + item.quantity, 0),
    [org.askingItems]
  );

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

  const handleOpenCameraScan = (kind: InventoryKind) => {
    if (scanLoading) return;
    setScanKind(kind);
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

      const response = await fetch("/api/vision-items", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

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
    } catch (error) {
      console.error(error);
      window.alert("Could not scan that image.");
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
    const valid = items.filter((item) => item.name.trim());

    if (valid.length === 0) return;

    setOrg((prev) => {
      if (scanKind === "asking") {
        const finalized: AskingItem[] = valid.map((item) => {
          const parsedQuantity = Number.parseInt(item.quantity, 10);

          return {
            id: makeId(),
            name: item.name.trim(),
            category: item.category,
            urgency: item.urgency,
            quantity:
              Number.isFinite(parsedQuantity) && parsedQuantity > 0
                ? parsedQuantity
                : 1,
            image: item.image || defaultImageForCategory(item.category),
          };
        });

        return {
          ...prev,
          askingItems: [...finalized, ...prev.askingItems],
        };
      }

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
    <Box className="org-page-bg" sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
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
                Community inventory
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`${totalItemTypes} total item types`}
                sx={{
                  borderRadius: 999,
                  bgcolor: "white",
                  border: "1px solid var(--border)",
                  fontWeight: 700,
                }}
              />
              <Chip
                label={`${totalUnits} total units`}
                sx={{
                  borderRadius: 999,
                  bgcolor: "var(--accent-soft)",
                  color: "#0f7f6c",
                  border: "1px solid rgba(49, 237, 199, 0.28)",
                  fontWeight: 700,
                }}
              />
              <Chip
                label={`${askingHighPriority} high priority needs`}
                sx={{
                  borderRadius: 999,
                  bgcolor: "white",
                  border: "1px solid var(--border)",
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: "28px",
              border: "1px solid var(--border)",
              bgcolor: "rgba(255,255,255,0.92)",
              boxShadow: "var(--shadow)",
              backdropFilter: "blur(10px)",
            }}
          >
            <OrgProfileHeader org={org} />
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
              items={org.askingItems}
              onAdd={() => handleOpenAdd("asking")}
              onEdit={(item) => handleOpenEdit("asking", item)}
              onDeleteMany={(ids) => handleDeleteMany("asking", ids)}
              onOpenCameraScan={() => handleOpenCameraScan("asking")}
              scanLoading={scanLoading && scanKind === "asking"}
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
              items={org.offeringItems}
              onAdd={() => handleOpenAdd("offering")}
              onEdit={(item) => handleOpenEdit("offering", item)}
              onDeleteMany={(ids) => handleDeleteMany("offering", ids)}
              onOpenCameraScan={() => handleOpenCameraScan("offering")}
              scanLoading={scanLoading && scanKind === "offering"}
            />
          </Paper>
        </Stack>
      </Container>

      <InventoryItemDialog
        open={dialogOpen}
        mode={dialogMode}
        kind={dialogKind}
        item={editingItem}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
      />

      <BulkDetectedItemsDialog
        open={scanDialogOpen}
        kind={scanKind}
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