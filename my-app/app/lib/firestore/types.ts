export type ListingKind = "asking" | "offering";
export type ListingStatus = "active" | "held" | "fulfilled" | "cancelled" | "archived";
export type ItemCategory = "food" | "clothing" | "hygiene" | "supplies";
export type ItemUrgency = "low" | "medium" | "high";
export type RequestStatus = "pending" | "held" | "completed" | "cancelled" | "expired";

export type OrgDoc = {
  id: string;
  name: string;
  bio: string;
  phoneNumber: string;
  address: string;
  location: string;
  bannerImageUrl: string;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ListingDoc = {
  id: string;
  orgId: string;
  orgNameSnapshot: string;
  kind: ListingKind;
  itemKey: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  imageUrl: string;
  urgency?: ItemUrgency;
  expiration?: string;
  status: ListingStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type RequestDoc = {
  id: string;
  fromOrgId: string;
  fromOrgNameSnapshot: string;
  toOrgId: string;
  toOrgNameSnapshot: string;
  status: RequestStatus;
  expiresAt: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type RequestLineDoc = {
  id: string;
  listingId: string;
  itemKey: string;
  nameSnapshot: string;
  categorySnapshot: ItemCategory;
  imageUrlSnapshot?: string;
  expirationSnapshot?: string;
  urgencySnapshot?: ItemUrgency;
  quantityRequested: number;
  quantityHeld?: number;
  quantityCompleted?: number;
  status: RequestStatus;
};