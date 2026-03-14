"use client";

import { useEffect, useState, forwardRef } from "react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  Slide,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import type { AskingItem, ItemCategory, ItemUrgency } from "./types";
import AskingItemFields from "./AskingItemFields";
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
  item: AskingItem | null;
  onClose: () => void;
  onSave: (item: AskingItem) => void;
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeQuantity(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export default function AskingItemDialog({
  open,
  mode,
  item,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("food");
  const [urgency, setUrgency] = useState<ItemUrgency>("medium");
  const [quantity, setQuantity] = useState("1");
  const [image, setImage] = useState(defaultImageForCategory("food"));

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setUrgency(item.urgency);
      setQuantity(String(item.quantity));
      setImage(item.image);
    } else {
      setName("");
      setCategory("food");
      setUrgency("medium");
      setQuantity("1");
      setImage(defaultImageForCategory("food"));
    }
  }, [item, open]);

  const handleCategoryChange = (nextCategory: ItemCategory) => {
    setCategory(nextCategory);

    if (!item && image.startsWith("https://placehold.co/120x120?text=")) {
      setImage(defaultImageForCategory(nextCategory));
    }
  };

  const handleSave = () => {
    const next: AskingItem = {
      id: item?.id ?? makeId(),
      name: name.trim(),
      category,
      urgency,
      quantity: normalizeQuantity(quantity),
      image: image || defaultImageForCategory(category),
    };

    if (!next.name) return;
    onSave(next);
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
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
            sx={{
              borderRadius: 999,
              px: 2.2,
              bgcolor: "var(--accent)",
              color: "#08352d",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "var(--accent-strong)",
              },
            }}
          >
            Save
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
                Asking inventory
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.04em" }}>
                {mode === "add" ? "Create a new request item" : "Update request item"}
              </Typography>
            </Box>

            <AskingItemFields
              name={name}
              quantity={quantity}
              category={category}
              urgency={urgency}
              image={image}
              showImageField
              onNameChange={setName}
              onQuantityChange={setQuantity}
              onImageChange={setImage}
              onCategoryChange={handleCategoryChange}
              onUrgencyChange={setUrgency}
            />
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}