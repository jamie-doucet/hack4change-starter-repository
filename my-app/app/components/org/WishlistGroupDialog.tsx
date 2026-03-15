"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ItemCategory } from "@/app/components/org/types";
import type {
  WishlistGroupDoc,
  WishlistGroupItem,
} from "@/app/lib/firestore/wishlistGroups";

type DraftRow = {
  tempId: string;
  name: string;
  quantity: string;
  category: ItemCategory;
};

type Props = {
  open: boolean;
  groups: WishlistGroupDoc[];
  onClose: () => void;
  onSaveGroup: (input: {
    id?: string;
    name: string;
    items: WishlistGroupItem[];
  }) => Promise<void>;
  onAddToWishlist: (input: {
    items: WishlistGroupItem[];
    groupCount: number;
  }) => Promise<void>;
};

const CATEGORY_OPTIONS: ItemCategory[] = [
  "food",
  "clothing",
  "hygiene",
  "supplies",
];

const singleFieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 58,
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
  "& .MuiInputLabel-root": {
    top: "50%",
    transform: "translate(14px, -50%) scale(1)",
    color: "var(--muted)",
  },
  "& .MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(14px, -9px) scale(0.75)",
  },
  "& .MuiOutlinedInput-input": {
    paddingTop: "16px",
    paddingBottom: "16px",
    paddingLeft: "14px",
    paddingRight: "14px",
  },
} as const;

const singleSelectSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 58,
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
  "& .MuiInputLabel-root": {
    top: "50%",
    transform: "translate(14px, -50%) scale(1)",
    color: "var(--muted)",
  },
  "& .MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(14px, -9px) scale(0.75)",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    minHeight: "unset !important",
    paddingTop: "16px",
    paddingBottom: "16px",
    paddingLeft: "14px",
    paddingRight: "14px",
  },
} as const;

function makeTempId() {
  return Math.random().toString(36).slice(2, 10);
}

function makeBlankRow(): DraftRow {
  return {
    tempId: makeTempId(),
    name: "",
    quantity: "1",
    category: "supplies",
  };
}

export default function WishlistGroupDialog({
  open,
  groups,
  onClose,
  onSaveGroup,
  onAddToWishlist,
}: Props) {
  const [selection, setSelection] = useState("__new__");
  const [groupName, setGroupName] = useState("");
  const [groupCount, setGroupCount] = useState("1");
  const [rows, setRows] = useState<DraftRow[]>([makeBlankRow()]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedExistingGroup =
    selection !== "__new__" && selection !== "__auto__"
      ? groups.find((group) => group.id === selection) ?? null
      : null;

  useEffect(() => {
    if (!open) return;

    setSelection("__new__");
    setGroupName("");
    setGroupCount("1");
    setRows([makeBlankRow()]);
    setPrompt("");
    setIsGenerating(false);
    setIsSaving(false);
  }, [open]);

  const validItems = useMemo(() => {
    return rows
      .map((row) => ({
        name: row.name.trim(),
        quantity: Math.max(1, Number.parseInt(row.quantity || "1", 10) || 1),
        category: row.category,
      }))
      .filter((row) => row.name);
  }, [rows]);

  const handleSelectionChange = (value: string) => {
    setSelection(value);

    if (value === "__new__") {
      setGroupName("");
      setRows([makeBlankRow()]);
      return;
    }

    if (value === "__auto__") {
      setGroupName("");
      setRows([makeBlankRow()]);
      return;
    }

    const existing = groups.find((group) => group.id === value);
    if (!existing) return;

    setGroupName(existing.name);
    setRows(
      existing.items.length > 0
        ? existing.items.map((item) => ({
            tempId: makeTempId(),
            name: item.name,
            quantity: String(item.quantity),
            category: item.category,
          }))
        : [makeBlankRow()]
    );
  };

  const updateRow = (tempId: string, patch: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.tempId === tempId ? { ...row, ...patch } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, makeBlankRow()]);
  };

  const removeRow = (tempId: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.tempId !== tempId);
      return next.length > 0 ? next : [makeBlankRow()];
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);

      const response = await fetch("/api/generate-wishlist-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data = (await response.json()) as {
        items?: Array<{
          name: string;
          quantity: number;
          category: ItemCategory;
        }>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not generate group.");
      }

      const items = Array.isArray(data.items) ? data.items : [];

      setRows(
        items.length > 0
          ? items.map((item) => ({
              tempId: makeTempId(),
              name: item.name,
              quantity: String(item.quantity),
              category: item.category,
            }))
          : [makeBlankRow()]
      );

      if (!groupName.trim()) {
        setGroupName("Generated group");
      }
    } catch (error) {
      console.error(error);
      window.alert("Could not auto-generate wishlist items.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim() || validItems.length === 0) return;

    try {
      setIsSaving(true);

      await onSaveGroup({
        id: selectedExistingGroup?.id,
        name: groupName.trim(),
        items: validItems,
      });
    } catch (error) {
      console.error(error);
      window.alert("Could not save group.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (validItems.length === 0) return;

    try {
      setIsSaving(true);

      await onAddToWishlist({
        items: validItems,
        groupCount: Math.max(1, Number.parseInt(groupCount || "1", 10) || 1),
      });

      onClose();
    } catch (error) {
      console.error(error);
      window.alert("Could not add group items to wishlist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving || isGenerating ? undefined : onClose}
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
        <Typography
          component="div"
          variant="overline"
          sx={{
            color: "var(--accent-strong)",
            fontWeight: 800,
            letterSpacing: "0.14em",
          }}
        >
          Wishlist
        </Typography>

        <Typography
          component="div"
          variant="h5"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Group add
        </Typography>

        <Typography component="div" sx={{ mt: 1, color: "var(--muted)" }}>
          Build a reusable wishlist group, load an existing one, or auto-generate
          one from a prompt.
        </Typography>
      </DialogTitle>

      <Divider sx={{ borderColor: "var(--border)" }} />

      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <FormControl fullWidth sx={singleSelectSx}>
            <InputLabel>Group</InputLabel>
            <Select
              value={selection}
              label="Group"
              onChange={(e) => handleSelectionChange(e.target.value)}
            >
              <MenuItem value="__new__">New group</MenuItem>
              <MenuItem value="__auto__">Auto generate</MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            sx={singleFieldSx}
          />

          {selection === "__auto__" && (
            <Stack spacing={1.25}>
              <TextField
                label="Describe what you want"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: a small office waiting room"
                multiline
                minRows={3}
                fullWidth
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
                }}
              />

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                sx={{
                  alignSelf: "flex-start",
                  borderRadius: 999,
                  px: 2.2,
                  bgcolor: "var(--accent)",
                  color: "white",
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "var(--accent-strong)",
                    color: "white",
                  },
                }}
              >
                {isGenerating ? "Generating..." : "Generate items"}
              </Button>
            </Stack>
          )}

          <Stack spacing={1.25}>
            {rows.map((row, index) => (
              <Box
                key={row.tempId}
                sx={{
                  p: 1.5,
                  borderRadius: "20px",
                  bgcolor: "white",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography sx={{ fontWeight: 800 }}>
                      Row {index + 1}
                    </Typography>

                    <IconButton
                      onClick={() => removeRow(row.tempId)}
                      sx={{
                        border: "1px solid var(--border)",
                        bgcolor: "white",
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>

                  <TextField
                    label="Name"
                    value={row.name}
                    onChange={(e) => updateRow(row.tempId, { name: e.target.value })}
                    fullWidth
                    sx={singleFieldSx}
                  />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(row.tempId, { quantity: e.target.value })
                      }
                      fullWidth
                      inputProps={{ min: 1, step: 1 }}
                      sx={singleFieldSx}
                    />

                    <FormControl fullWidth sx={singleSelectSx}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={row.category}
                        label="Category"
                        onChange={(e) =>
                          updateRow(row.tempId, {
                            category: e.target.value as ItemCategory,
                          })
                        }
                      >
                        {CATEGORY_OPTIONS.map((category) => (
                          <MenuItem
                            key={category}
                            value={category}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
              </Box>
            ))}

            <Button
              onClick={addRow}
              startIcon={<AddIcon />}
              sx={{
                alignSelf: "flex-start",
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

          <TextField
            label="Number of groups to add"
            type="number"
            value={groupCount}
            onChange={(e) => setGroupCount(e.target.value)}
            fullWidth
            inputProps={{ min: 1, step: 1 }}
            sx={singleFieldSx}
          />
        </Stack>
      </DialogContent>

      <Divider sx={{ borderColor: "var(--border)" }} />

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          disabled={isSaving || isGenerating}
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
            onClick={handleSaveGroup}
            disabled={
              !groupName.trim() ||
              validItems.length === 0 ||
              isSaving ||
              isGenerating
            }
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
            Save group
          </Button>

          <Button
            variant="contained"
            onClick={handleAddToWishlist}
            disabled={validItems.length === 0 || isSaving || isGenerating}
            sx={{
              borderRadius: 999,
              px: 2.4,
              bgcolor: "var(--accent)",
              color: "white",
              textTransform: "none",
              fontWeight: 800,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "var(--accent-strong)",
                color: "white",
              },
            }}
          >
            Add to wishlist
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}