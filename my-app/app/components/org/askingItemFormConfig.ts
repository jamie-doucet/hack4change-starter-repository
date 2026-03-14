import type { ItemCategory, ItemUrgency } from "./types";

export const itemCategories: ItemCategory[] = [
  "food",
  "clothing",
  "hygiene",
  "supplies",
];

export const itemUrgencies: ItemUrgency[] = ["low", "medium", "high"];

export function defaultImageForCategory(category: ItemCategory) {
  switch (category) {
    case "food":
      return "https://placehold.co/120x120?text=Food";
    case "clothing":
      return "https://placehold.co/120x120?text=Clothes";
    case "hygiene":
      return "https://placehold.co/120x120?text=Hygiene";
    case "supplies":
      return "https://placehold.co/120x120?text=Supplies";
    default:
      return "https://placehold.co/120x120?text=Item";
  }
}