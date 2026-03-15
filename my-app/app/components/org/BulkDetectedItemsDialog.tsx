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
  Chip,
  TextField,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { InventoryKind, ItemCategory, ItemUrgency } from "./types";
import InventoryItemFields from "./InventoryItemFields";
import { defaultImageForCategory } from "./askingItemFormConfig";

export { defaultImageForCategory } from "./askingItemFormConfig";

export type InventoryDraftAction = "add" | "delete";

export type InventoryDraftItem = {
  tempId: string;
  sourceId?: string;
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
  action: InventoryDraftAction;
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

function formatExpiration(value?: string) {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${monthNames[Number(month) - 1] ?? month} ${Number(day)}, ${year}`;
}

export default function BulkDetectedItemsDialog({
  open,
  kind,
  action,
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
              {action === "add" ? "Review detected items" : "Review items to delete"}
            </Typography>
          </Box>

          {action === "add" && (
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
          )}
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

              {action === "delete" ? (
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {kind === "offering" && (
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 88,
                          height: 88,
                          borderRadius: "18px",
                          objectFit: "cover",
                          border: "1px solid var(--border)",
                          bgcolor: "var(--accent-soft)",
                        }}
                      />
                    )}

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.05rem",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.name}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mt: 1 }}
                      >
                        <Chip
                          label={item.category}
                          sx={{
                            borderRadius: 999,
                            bgcolor: "white",
                            border: "1px solid var(--border)",
                            textTransform: "capitalize",
                            fontWeight: 700,
                          }}
                        />

                        {item.expiration && (
                          <Chip
                            label={`Expires ${formatExpiration(item.expiration)}`}
                            sx={{
                              borderRadius: 999,
                              bgcolor: "#fff8e8",
                              color: "#8a5a00",
                              border: "1px solid rgba(255, 193, 7, 0.24)",
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  <Box sx={{ width: "100%", maxWidth: 220 }}>
                    <TextField
                      label="Quantity to remove"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.tempId, {
                          quantity: e.target.value,
                        })
                      }
                      fullWidth
                      inputProps={{
                        min: 1,
                        step: 1,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
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
                          paddingTop: "16px",
                          paddingBottom: "16px",
                          paddingLeft: "14px",
                          paddingRight: "14px",
                        },
                      }}
                    />
                  </Box>
                </Stack>
              ) : (
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
              )}
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
                No items found.
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
          {action === "add" && (
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
          )}

          <Button
            variant="contained"
            onClick={() => onConfirm(items)}
            sx={{
              borderRadius: 999,
              px: 2.4,
              bgcolor: action === "delete" ? "#d32f2f" : "var(--accent)",
              color: "white",
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
              "&:hover": {
                bgcolor: action === "delete" ? "#b71c1c" : "var(--accent-strong)",
                color: "white",
              },
            }}
          >
            {action === "add" ? "Save" : "Delete matched items"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}