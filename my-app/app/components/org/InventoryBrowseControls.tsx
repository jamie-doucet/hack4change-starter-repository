"use client";

import {
  Checkbox,
  FormControl,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import type { InventoryKind, ItemCategory, ItemUrgency } from "./types";

type Props = {
  kind: InventoryKind;
  search: string;
  categoryFilter: ItemCategory[];
  urgencyFilter: "all" | ItemUrgency;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: ItemCategory[]) => void;
  onUrgencyFilterChange: (value: "all" | ItemUrgency) => void;
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

export default function InventoryBrowseControls({
  kind,
  search,
  categoryFilter,
  urgencyFilter,
  onSearchChange,
  onCategoryFilterChange,
  onUrgencyFilterChange,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", xl: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", xl: "center" }}
      sx={{ mt: 2 }}
    >
      {kind === "asking" && (
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
              onUrgencyFilterChange(e.target.value as "all" | ItemUrgency)
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
      )}

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
            onCategoryFilterChange(e.target.value as ItemCategory[])
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
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={`Search ${kind === "asking" ? "wishlist" : "offering"} items`}
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
  );
}