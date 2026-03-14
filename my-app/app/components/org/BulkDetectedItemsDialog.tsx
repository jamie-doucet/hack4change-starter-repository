"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { InventoryKind, ItemCategory, ItemUrgency } from "./types";
import InventoryItemFields from "./InventoryItemFields";
import { defaultImageForCategory } from "./askingItemFormConfig";

export { defaultImageForCategory } from "./askingItemFormConfig";

export type InventoryDraftItem = {
  tempId: string;
  name: string;
  quantity: string;
  category: ItemCategory;
  urgency: ItemUrgency;
  expiration: string;
  image: string;
};

type Props = {
  open: boolean;
  kind: InventoryKind;
  items: InventoryDraftItem[];
  onClose: () => void;
  onChange: (items: InventoryDraftItem[]) => void;
  onConfirm: (items: InventoryDraftItem[]) => void;
};

function makeTempId() {
  return Math.random().toString(36).slice(2, 10);
}

export function makeBlankScannedDraft(kind: InventoryKind): InventoryDraftItem {
  return {
    tempId: makeTempId(),
    name: "",
    quantity: "1",
    category: "supplies",
    urgency: "medium",
    expiration: "",
    image: defaultImageForCategory("supplies"),
  };
}

export function makeScannedDraftFromDetection(
  kind: InventoryKind,
  input: {
    quantity: number;
    name: string;
  }
): InventoryDraftItem {
  const cleanName = input.name.trim();

  return {
    tempId: makeTempId(),
    name: cleanName,
    quantity: String(Math.max(1, Math.round(input.quantity || 1))),
    category: "supplies",
    urgency: "medium",
    expiration: "",
    image: defaultImageForCategory("supplies"),
  };
}

export default function BulkDetectedItemsDialog({
  open,
  kind,
  items,
  onClose,
  onChange,
  onConfirm,
}: Props) {
  const updateItem = (
    tempId: string,
    patch: Partial<InventoryDraftItem>
  ) => {
    onChange(
      items.map((item) =>
        item.tempId === tempId ? { ...item, ...patch } : item
      )
    );
  };

  const removeItem = (tempId: string) => {
    onChange(items.filter((item) => item.tempId !== tempId));
  };

  const addBlankItem = () => {
    onChange([...items, makeBlankScannedDraft(kind)]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: "28px" },
          bgcolor: "var(--background)",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(40, 199, 167, 0.08), transparent 28%)",
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 1.5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "var(--accent-strong)",
                fontWeight: 800,
                letterSpacing: "0.14em",
              }}
            >
              Camera scan
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              Review detected {kind} items
            </Typography>

            <Typography sx={{ mt: 1, color: "var(--muted)" }}>
              Edit names, quantities, images, categories, or remove anything before saving.
            </Typography>
          </Box>

          <Button
            onClick={addBlankItem}
            startIcon={<AddIcon />}
            sx={{
              alignSelf: { xs: "stretch", sm: "auto" },
              borderRadius: 999,
              px: 2,
              bgcolor: "white",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Add row
          </Button>
        </Stack>
      </DialogTitle>

      <Divider sx={{ borderColor: "var(--border)" }} />

      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={1.5}>
          {items.map((item, index) => (
            <Box
              key={item.tempId}
              sx={{
                p: 2,
                borderRadius: "24px",
                bgcolor: "white",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ mb: 1.5 }}
              >
                <Typography sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Item {index + 1}
                </Typography>

                <IconButton
                  onClick={() => removeItem(item.tempId)}
                  sx={{
                    border: "1px solid var(--border)",
                    bgcolor: "white",
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>

              <InventoryItemFields
                kind={kind}
                name={item.name}
                quantity={item.quantity}
                category={item.category}
                urgency={item.urgency}
                expiration={item.expiration}
                image={item.image}
                showImageField
                compactQuantity
                onNameChange={(value) => updateItem(item.tempId, { name: value })}
                onQuantityChange={(value) =>
                  updateItem(item.tempId, { quantity: value })
                }
                onImageChange={(value) =>
                  updateItem(item.tempId, { image: value })
                }
                onCategoryChange={(value) =>
                  updateItem(item.tempId, {
                    category: value,
                    image:
                      item.image.startsWith("https://placehold.co/120x120?text=")
                        ? defaultImageForCategory(value)
                        : item.image,
                  })
                }
                onUrgencyChange={(value) =>
                  updateItem(item.tempId, { urgency: value })
                }
                onExpirationChange={(value) =>
                  updateItem(item.tempId, { expiration: value })
                }
              />
            </Box>
          ))}

          {items.length === 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: "24px",
                bgcolor: "white",
                border: "1px solid var(--border)",
              }}
            >
              <Typography sx={{ color: "var(--muted)" }}>
                No detected items yet.
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider sx={{ borderColor: "var(--border)" }} />

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 999,
            px: 2,
            color: "var(--foreground)",
          }}
        >
          Cancel
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            onClick={addBlankItem}
            sx={{
              borderRadius: 999,
              px: 2,
              bgcolor: "white",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Add item
          </Button>

          <Button
            variant="contained"
            onClick={() => onConfirm(items)}
            sx={{
              borderRadius: 999,
              px: 2.4,
              bgcolor: "var(--accent)",
              color: "#08352d",
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "var(--accent-strong)",
                color: "white",
              },
            }}
          >
            Save detected items
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}