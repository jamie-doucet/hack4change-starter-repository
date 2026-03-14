"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import {
  AppBar,
  Alert,
  Box,
  Button,
  Dialog,
  IconButton,
  InputBase,
  Slide,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { TransitionProps } from "@mui/material/transitions";
import type {
  AskingItem,
  InventoryItem,
  InventoryKind,
  ItemCategory,
  ItemUrgency,
  OfferingItem,
} from "./types";
import InventoryItemFields from "./InventoryItemFields";
import { defaultImageForCategory } from "./askingItemFormConfig";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<unknown> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  open: boolean;
  mode: "add" | "edit";
  kind: InventoryKind;
  orgName: string;
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (item: InventoryItem) => Promise<void> | void;
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeQuantity(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export default function InventoryItemDialog({
  open,
  mode,
  kind,
  orgName,
  item,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("food");
  const [urgency, setUrgency] = useState<ItemUrgency>("medium");
  const [expiration, setExpiration] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [image, setImage] = useState(defaultImageForCategory("food"));
  const [editingTitle, setEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(String(item.quantity));
      setImage(item.image);

      if (kind === "asking" && "urgency" in item) {
        setUrgency(item.urgency);
        setExpiration("");
      } else if (kind === "offering" && "expiration" in item) {
        setExpiration(item.expiration ?? "");
        setUrgency("medium");
      }
    } else {
      setName("");
      setCategory("food");
      setUrgency("medium");
      setExpiration("");
      setQuantity("1");
      setImage(defaultImageForCategory("food"));
    }

    setEditingTitle(false);
    setSaving(false);
    setErrorText("");
  }, [item, open, kind]);

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  const handleCategoryChange = (nextCategory: ItemCategory) => {
    setCategory(nextCategory);

    if (!item && image.startsWith("https://placehold.co/120x120?text=")) {
      setImage(defaultImageForCategory(nextCategory));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorText("Please enter an item name.");
      return;
    }

    setSaving(true);
    setErrorText("");

    try {
      if (kind === "asking") {
        const next: AskingItem = {
          id: item?.id ?? makeId(),
          name: trimmedName,
          category,
          urgency,
          quantity: normalizeQuantity(quantity),
          image: image || defaultImageForCategory(category),
        };

        await onSave(next);
      } else {
        const next: OfferingItem = {
          id: item?.id ?? makeId(),
          name: trimmedName,
          category,
          expiration: expiration || undefined,
          quantity: normalizeQuantity(quantity),
          image: image || defaultImageForCategory(category),
        };

        await onSave(next);
      }
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      setErrorText("Could not save this item. Check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  const dialogEyebrow =
    kind === "asking"
      ? `${orgName} is asking for`
      : `${orgName} is offering`;

  const titleText =
    name.trim() ||
    (kind === "asking" ? "Untitled request item" : "Untitled offering item");

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={saving ? undefined : onClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: "var(--background)",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(49, 237, 199, 0.1), transparent 25%)",
        },
      }}
    >
      <AppBar
        elevation={0}
        sx={{
          position: "sticky",
          bgcolor: "rgba(255,255,255,0.84)",
          color: "var(--foreground)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Button
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "var(--foreground)",
              borderRadius: 999,
              px: 2,
            }}
          >
            Cancel
          </Button>

          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
            {mode === "add" ? "Add item" : "Edit item"}
          </Typography>

          <Button
            onClick={handleSave}
            disabled={saving}
            sx={{
              borderRadius: 999,
              px: 2.2,
              bgcolor: "var(--accent)",
              color: "#08352d",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "var(--accent-strong)",
              },
              "&.Mui-disabled": {
                bgcolor: "#d7efe8",
                color: "#6c847d",
              },
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 760, mx: "auto", width: "100%", p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.92)",
            border: "1px solid var(--border)",
            borderRadius: "28px",
            boxShadow: "var(--shadow)",
            p: { xs: 2, md: 3 },
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "var(--accent-strong)",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                }}
              >
                {dialogEyebrow}
              </Typography>

              {mode === "edit" ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mt: 0.25 }}
                >
                  {editingTitle ? (
                    <InputBase
                      inputRef={titleInputRef}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      sx={{
                        fontSize: "2.125rem",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.05,
                        color: "var(--foreground)",
                        px: 0,
                        py: 0,
                        minWidth: 0,
                        flex: 1,
                      }}
                    />
                  ) : (
                    <Typography
                      variant="h4"
                      onClick={() => setEditingTitle(true)}
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.05,
                        cursor: "text",
                      }}
                    >
                      {titleText}
                    </Typography>
                  )}

                  <IconButton
                    onClick={() => setEditingTitle(true)}
                    disabled={saving}
                    sx={{
                      border: "1px solid var(--border)",
                      bgcolor: "white",
                    }}
                  >
                    <EditOutlinedIcon />
                  </IconButton>
                </Stack>
              ) : (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, letterSpacing: "-0.04em" }}
                >
                  {kind === "asking" ? "Create a new request item" : "Create a new offering item"}
                </Typography>
              )}
            </Box>

            {errorText && <Alert severity="error">{errorText}</Alert>}

            <InventoryItemFields
              kind={kind}
              name={name}
              quantity={quantity}
              category={category}
              urgency={urgency}
              expiration={expiration}
              image={image}
              showNameField={mode !== "edit"}
              showImageField={kind === "offering"}
              onNameChange={setName}
              onQuantityChange={setQuantity}
              onImageChange={setImage}
              onCategoryChange={handleCategoryChange}
              onUrgencyChange={setUrgency}
              onExpirationChange={setExpiration}
            />
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}