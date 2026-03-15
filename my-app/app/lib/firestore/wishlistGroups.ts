import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import type { ItemCategory } from "@/app/components/org/types";

export type WishlistGroupItem = {
  name: string;
  quantity: number;
  category: ItemCategory;
};

export type WishlistGroupDoc = {
  id: string;
  name: string;
  items: WishlistGroupItem[];
};

export function subscribeWishlistGroups(
  orgId: string,
  callback: (groups: WishlistGroupDoc[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "orgs", orgId, "wishlistGroups"),
    orderBy("name")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as {
          name?: string;
          items?: WishlistGroupItem[];
        };

        return {
          id: docSnap.id,
          name: data.name || "",
          items: Array.isArray(data.items) ? data.items : [],
        };
      })
    );
  });
}

export async function saveWishlistGroup(
  orgId: string,
  input: {
    id?: string;
    name: string;
    items: WishlistGroupItem[];
  }
) {
  const ref = input.id
    ? doc(db, "orgs", orgId, "wishlistGroups", input.id)
    : doc(collection(db, "orgs", orgId, "wishlistGroups"));

  await setDoc(
    ref,
    {
      name: input.name.trim(),
      items: input.items,
      updatedAt: serverTimestamp(),
      ...(input.id ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );

  return ref.id;
}