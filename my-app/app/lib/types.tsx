export type ItemCategory = "food" | "clothing" | "hygiene" | "supplies";

export type NeededItem = {
  id: string;
  quantity: number;
  name: string;
  image: string;
  category: ItemCategory;
  barcode?: string | null;
  updatedAt?: number;
};

export type Org = {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  locationLabel: string;
  tags: string[];
  items: NeededItem[];
};

export type BarcodeCatalogItem = {
  barcode: string;
  name: string;
  category: ItemCategory;
  image: string;
  createdAt: number;
  updatedAt: number;
};