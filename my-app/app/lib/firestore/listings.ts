import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { normalizeItemKey } from "./helpers";
import type {
  ItemCategory,
  ItemUrgency,
  ListingDoc,
  ListingKind,
  ListingStatus,
} from "./types";

type CreateListingInput = {
  orgId: string;
  orgNameSnapshot: string;
  kind: ListingKind;
  name: string;
  category: ItemCategory;
  quantity: number;
  imageUrl?: string;
  urgency?: ItemUrgency;
  expiration?: string;
  status?: ListingStatus;
};

export async function createListing(input: CreateListingInput) {
  const ref = await addDoc(collection(db, "listings"), {
    orgId: input.orgId,
    orgNameSnapshot: input.orgNameSnapshot,
    kind: input.kind,
    itemKey: normalizeItemKey(input.name),
    name: input.name.trim(),
    category: input.category,
    quantity: input.quantity,
    imageUrl: input.imageUrl ?? "",
    urgency: input.kind === "asking" ? input.urgency ?? "medium" : null,
    expiration: input.kind === "offering" ? input.expiration ?? null : null,
    status: input.status ?? "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateListing(
  listingId: string,
  patch: Partial<Omit<ListingDoc, "id" | "createdAt" | "updatedAt">>
) {
  const ref = doc(db, "listings", listingId);

  const payload: Record<string, unknown> = {
    ...patch,
    updatedAt: serverTimestamp(),
  };

  if (typeof patch.name === "string") {
    payload.itemKey = normalizeItemKey(patch.name);
    payload.name = patch.name.trim();
  }

  await updateDoc(ref, payload);
}

export async function deleteListing(listingId: string) {
  await deleteDoc(doc(db, "listings", listingId));
}

export function subscribeOrgListings(
  orgId: string,
  kind: ListingKind,
  callback: (items: ListingDoc[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "listings"),
    where("orgId", "==", orgId),
    where("kind", "==", kind),
    where("status", "==", "active"),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ListingDoc, "id">),
      }))
    );
  });
}

export function subscribeActiveListingsByKind(
  kind: ListingKind,
  callback: (items: ListingDoc[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "listings"),
    where("kind", "==", kind),
    where("status", "==", "active"),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ListingDoc, "id">),
        }))
      );
    },
    (error: any) => {
      console.error("subscribeActiveListingsByKind failed");
      console.error("kind:", kind);
      console.error("code:", error?.code);
      console.error("message:", error?.message);
      console.error(error);
    }
  );
}