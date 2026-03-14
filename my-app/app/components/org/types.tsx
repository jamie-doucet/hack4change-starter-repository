export type ItemCategory = "food" | "clothing" | "hygiene" | "supplies";
export type ItemUrgency = "low" | "medium" | "high";
export type InventoryKind = "asking" | "offering";

export type InventoryBaseItem = {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  image: string;
};

export type AskingItem = InventoryBaseItem & {
  urgency: ItemUrgency;
};

export type OfferingItem = InventoryBaseItem & {
  expiration?: string;
};

export type InventoryItem = AskingItem | OfferingItem;

export type OrgProfile = {
  id: string;
  name: string;
  bio: string;
  location: string;
  bannerImage: string;
  avatarImage: string;
  askingItems: AskingItem[];
  offeringItems: OfferingItem[];
};