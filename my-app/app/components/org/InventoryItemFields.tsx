"use client";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { InventoryKind, ItemCategory, ItemUrgency } from "./types";
import { itemCategories, itemUrgencies } from "./askingItemFormConfig";
import AskingItemImageField from "./AskingItemImageField";

type Props = {
  kind: InventoryKind;
  name: string;
  quantity: string;
  category: ItemCategory;
  urgency: ItemUrgency;
  expiration: string;
  image?: string;
  showNameField?: boolean;
  showImageField?: boolean;
  compactQuantity?: boolean;
  onNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onCategoryChange: (value: ItemCategory) => void;
  onUrgencyChange: (value: ItemUrgency) => void;
  onExpirationChange: (value: string) => void;
  onImageChange?: (value: string) => void;
};

const fieldSx = {
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
};

const roomyInputSx = {
  minHeight: 56,
  "& input": {
    paddingTop: "16px",
    paddingBottom: "16px",
    paddingLeft: "14px",
    paddingRight: "14px",
  },
};

export default function InventoryItemFields({
  kind,
  name,
  quantity,
  category,
  urgency,
  expiration,
  image = "",
  showNameField = true,
  showImageField = false,
  compactQuantity = false,
  onNameChange,
  onQuantityChange,
  onCategoryChange,
  onUrgencyChange,
  onExpirationChange,
  onImageChange,
}: Props) {
  return (
    <Stack spacing={2.25}>
      {showImageField && onImageChange && (
        <Box sx={{ width: "100%", maxWidth: 620 }}>
          <AskingItemImageField image={image} onImageChange={onImageChange} />
        </Box>
      )}

      {showNameField && (
        <Box sx={{ width: "100%", maxWidth: 460 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            fullWidth
            sx={fieldSx}
            InputProps={{
              sx: roomyInputSx,
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          maxWidth: compactQuantity ? 180 : 220,
        }}
      >
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          fullWidth
          sx={fieldSx}
          inputProps={{
            min: 1,
            step: 1,
          }}
          InputProps={{
            sx: roomyInputSx,
          }}
        />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 360 }}>
        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => onCategoryChange(e.target.value as ItemCategory)}
          >
            {itemCategories.map((value) => (
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
      </Box>

      <Box sx={{ width: "100%", maxWidth: 360 }}>
        {kind === "asking" ? (
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Urgency</InputLabel>
            <Select
              value={urgency}
              label="Urgency"
              onChange={(e) => onUrgencyChange(e.target.value as ItemUrgency)}
            >
              {itemUrgencies.map((value) => (
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
        ) : (
          <TextField
            label="Expiration (optional)"
            type="date"
            value={expiration}
            onChange={(e) => onExpirationChange(e.target.value)}
            fullWidth
            sx={fieldSx}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: roomyInputSx,
            }}
          />
        )}
      </Box>
    </Stack>
  );
}