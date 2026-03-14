"use client";

import type { BarcodeCatalogItem, NeededItem, Org } from "./types";
import { DEMO_ORGS } from "./demo-data";

const ORGS_STORAGE_KEY = "support-map-orgs";
const BARCODE_STORAGE_KEY = "support-map-barcode-catalog";

function loadOrgs(): Org[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ORGS_STORAGE_KEY);
  if (!raw) return DEMO_ORGS;

  try {
    return JSON.parse(raw) as Org[];
  } catch {
    return DEMO_ORGS;
  }
}

function saveOrgs(orgs: Org[]) {
  window.localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(orgs));
  window.dispatchEvent(new Event("orgs-updated"));
}

function loadBarcodeCatalog(): Record<string, BarcodeCatalogItem> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(BARCODE_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, BarcodeCatalogItem>;
  } catch {
    return {};
  }
}

function saveBarcodeCatalog(catalog: Record<string, BarcodeCatalogItem>) {
  window.localStorage.setItem(BARCODE_STORAGE_KEY, JSON.stringify(catalog));
  window.dispatchEvent(new Event("barcode-catalog-updated"));
}

export async function seedIfEmpty(): Promise<void> {
  if (typeof window === "undefined") return;

  const orgsRaw = window.localStorage.getItem(ORGS_STORAGE_KEY);
  if (!orgsRaw) {
    saveOrgs(DEMO_ORGS);
  }

  const barcodeRaw = window.localStorage.getItem(BARCODE_STORAGE_KEY);
  if (!barcodeRaw) {
    saveBarcodeCatalog({});
  }
}

export function subscribeToOrgs(callback: (orgs: Org[]) => void): () => void {
  const emit = () => callback(loadOrgs());

  emit();
  window.addEventListener("storage", emit);
  window.addEventListener("orgs-updated", emit);

  return () => {
    window.removeEventListener("storage", emit);
    window.removeEventListener("orgs-updated", emit);
  };
}

export async function lookupBarcode(
  barcode: string
): Promise<BarcodeCatalogItem | null> {
  const clean = barcode.trim();
  if (!clean) return null;

  const catalog = loadBarcodeCatalog();
  return catalog[clean] ?? null;
}

export async function saveBarcodeCatalogItem(
  item: Omit<BarcodeCatalogItem, "createdAt" | "updatedAt">
): Promise<void> {
  const cleanBarcode = item.barcode.trim();
  if (!cleanBarcode) return;

  const catalog = loadBarcodeCatalog();
  const existing = catalog[cleanBarcode];

  catalog[cleanBarcode] = {
    ...item,
    barcode: cleanBarcode,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  saveBarcodeCatalog(catalog);
}

export async function addOrUpdateOrgItem(
  orgId: string,
  incoming: Omit<NeededItem, "updatedAt"> & { quantity?: number }
): Promise<void> {
  const orgs = loadOrgs();
  const quantityToAdd = incoming.quantity ?? 1;

  const nextOrgs = orgs.map((org) => {
    if (org.id !== orgId) return org;

    const existingIndex = org.items.findIndex(
      (item) =>
        (!!incoming.barcode && item.barcode === incoming.barcode) ||
        item.name.trim().toLowerCase() === incoming.name.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      const nextItems = org.items.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: item.quantity + quantityToAdd,
              updatedAt: Date.now(),
            }
          : item
      );

      return { ...org, items: nextItems };
    }

    const nextItems: NeededItem[] = [
      ...org.items,
      {
        ...incoming,
        quantity: quantityToAdd,
        updatedAt: Date.now(),
      },
    ];

    return { ...org, items: nextItems };
  });

  saveOrgs(nextOrgs);
}