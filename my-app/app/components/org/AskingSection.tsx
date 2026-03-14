"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import type { AskingItem, ItemCategory, ItemUrgency } from "./types";
import AskingItemCard from "./AskingItemCard";

type Props = {
  items: AskingItem[];
  onAdd: () => void;
  onEdit: (item: AskingItem) => void;
  onDeleteMany: (ids: string[]) => void;
  onOpenCameraScan: () => void;
  scanLoading: boolean;
};

const categoryOptions: ItemCategory[] = [
  "food",
  "clothing",
  "hygiene",
  "supplies",
];

const urgencyOptions: Array<"all" | ItemUrgency> = [
  "all",
  "high",
  "medium",
  "low",
];

const urgencyRank: Record<ItemUrgency, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function previewLabel(urgency: ItemUrgency) {
  if (urgency === "high") return "High";
  if (urgency === "medium") return "Medium";
  return "Low";
}

export default function AskingSection({
  items,
  onAdd,
  onEdit,
  onDeleteMany,
  onOpenCameraScan,
  scanLoading,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | ItemUrgency>("all");
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const previewItems = useMemo(() => {
    return [...items]
      .sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency])
      .slice(0, 3);
  }, [items]);

  const filteredItems = useMemo(() => {
    let next = [...items];
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      next = next.filter((item) => {
        const haystack = [
          item.name,
          item.category,
          item.urgency,
          String(item.quantity),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      });
    }

    if (urgencyFilter !== "all") {
      next = next.filter((item) => item.urgency === urgencyFilter);
    }

    if (categoryFilter.length > 0) {
      next = next.filter((item) => categoryFilter.includes(item.category));
    }

    return next.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);
  }, [items, search, urgencyFilter, categoryFilter]);

  const handleToggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
    setSelectedIds([]);
  };

  const handleCheck = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((value) => value !== id)
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    onDeleteMany(selectedIds);
    setSelectedIds([]);
    setDeleteMode(false);
  };

  const handleToggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleExpanded();
    }
  };

  return (
    <Box
      sx={{
        borderRadius: "28px",
        overflow: "hidden",
        bgcolor: "transparent",
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        onClick={handleToggleExpanded}
        onKeyDown={handleHeaderKeyDown}
        sx={{
          px: { xs: 1, md: 1.5 },
          pt: 0.5,
          pb: expanded ? 0.5 : 1.25,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="overline"
            sx={{
              color: "var(--accent-strong)",
              fontWeight: 800,
              letterSpacing: "0.14em",
            }}
          >
            Current needs
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
            sx={{ mt: 0.25, pr: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 0.98,
              }}
            >
              Asking
            </Typography>

            <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} alignItems="center">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                sx={{
                  bgcolor: "var(--accent)",
                  color: "#08352d",
                  borderRadius: 999,
                  width: { xs: 42, sm: 46 },
                  height: { xs: 42, sm: 46 },
                  "&:hover": {
                    bgcolor: "var(--accent-strong)",
                    color: "white",
                  },
                }}
              >
                <AddIcon />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCameraScan();
                }}
                disabled={scanLoading}
                sx={{
                  bgcolor: "white",
                  color: "var(--accent-strong)",
                  borderRadius: 999,
                  width: { xs: 42, sm: 46 },
                  height: { xs: 42, sm: 46 },
                  border: "1px solid rgba(40, 199, 167, 0.24)",
                  "&:hover": {
                    bgcolor: "var(--accent-soft)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "white",
                  },
                }}
              >
                {scanLoading ? (
                  <CircularProgress size={20} sx={{ color: "var(--accent-strong)" }} />
                ) : (
                  <PhotoCameraRoundedIcon />
                )}
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDeleteMode();
                }}
                sx={{
                  bgcolor: deleteMode ? "#fff1f1" : "white",
                  color: deleteMode ? "#d32f2f" : "var(--foreground)",
                  borderRadius: 999,
                  width: { xs: 42, sm: 46 },
                  height: { xs: 42, sm: 46 },
                  border: "1px solid var(--border)",
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpanded();
                }}
                sx={{
                  bgcolor: "var(--accent-soft)",
                  border: "1px solid rgba(40, 199, 167, 0.24)",
                  color: "var(--accent-strong)",
                  borderRadius: 999,
                  width: 38,
                  height: 38,
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Stack>
          </Stack>

          {!expanded && (
            <>
              <Typography
                sx={{
                  mt: 1,
                  color: "var(--muted)",
                  fontSize: "0.96rem",
                }}
              >
                A quick preview of the most urgent requested items.
              </Typography>

              <Box
                sx={{
                  mt: 1.5,
                  display: "grid",
                  gap: 1.25,
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(3, minmax(0, 1fr))",
                  },
                  pr: { md: 1 },
                }}
              >
                {previewItems.length > 0 ? (
                  previewItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        p: 1.25,
                        borderRadius: "20px",
                        bgcolor: "white",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 54,
                          height: 54,
                          minWidth: 54,
                          borderRadius: "16px",
                          objectFit: "cover",
                          bgcolor: "var(--accent-soft)",
                          border: "1px solid rgba(40, 199, 167, 0.18)",
                        }}
                      />

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.96rem",
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                          }}
                          noWrap
                        >
                          {item.name}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.35,
                            color: "var(--muted)",
                            fontSize: "0.86rem",
                            textTransform: "capitalize",
                          }}
                          noWrap
                        >
                          {item.category} · Qty {item.quantity} · {previewLabel(item.urgency)}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "20px",
                      bgcolor: "white",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Typography sx={{ color: "var(--muted)" }}>
                      No items yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 0 }}>
          <Box sx={{ p: { xs: 1.5, md: 2 } }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", xl: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", xl: "center" }}
              >
                <FormControl
                  sx={{
                    minWidth: { xs: "100%", md: 200 },
                    "& .MuiOutlinedInput-root": {
                      minHeight: 54,
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
                      paddingTop: "15px",
                      paddingBottom: "15px",
                    },
                  }}
                >
                  <InputLabel>Urgency</InputLabel>
                  <Select
                    value={urgencyFilter}
                    label="Urgency"
                    onChange={(e) =>
                      setUrgencyFilter(e.target.value as "all" | ItemUrgency)
                    }
                  >
                    {urgencyOptions.map((value) => (
                      <MenuItem
                        key={value}
                        value={value}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  sx={{
                    minWidth: { xs: "100%", md: 240 },
                    "& .MuiOutlinedInput-root": {
                      minHeight: 54,
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
                      paddingTop: "15px",
                      paddingBottom: "15px",
                    },
                  }}
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    multiple
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(e.target.value as ItemCategory[])
                    }
                    input={<OutlinedInput label="Category" />}
                    renderValue={(selected) =>
                      selected.length === 0 ? "All" : selected.join(", ")
                    }
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem
                        key={category}
                        value={category}
                        sx={{ textTransform: "capitalize" }}
                      >
                        <Checkbox
                          checked={categoryFilter.includes(category)}
                          sx={{
                            color: "rgba(0,0,0,0.28)",
                            "&.Mui-checked": {
                              color: "var(--accent-strong)",
                            },
                          }}
                        />
                        <ListItemText primary={category} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search requested items"
                  fullWidth
                  sx={{
                    maxWidth: { xl: 380 },
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
              </Stack>

              {deleteMode && (
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    sx={{
                      borderRadius: 999,
                      px: 2.2,
                      boxShadow: "none",
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    Delete selected
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: "var(--border)" }} />

          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              pt: 1.5,
              maxHeight: 520,
              overflowY: "auto",
            }}
          >
            <Stack spacing={1.5}>
              {filteredItems.map((item) => (
                <AskingItemCard
                  key={item.id}
                  item={item}
                  deleteMode={deleteMode}
                  checked={selectedIds.includes(item.id)}
                  onCheck={handleCheck}
                  onClick={onEdit}
                />
              ))}

              {filteredItems.length === 0 && (
                <Typography sx={{ color: "var(--muted)", px: 0.5 }}>
                  No items match the current filters.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}