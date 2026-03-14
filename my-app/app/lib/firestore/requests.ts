import {
    getDoc, getDocs,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  runTransaction,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import type {
  ListingDoc,
  RequestDoc,
  RequestLineDoc,
  RequestStatus,
} from "./types";

type CreateRequestInput = {
  fromOrgId: string;
  fromOrgNameSnapshot: string;
  toOrgId: string;
  toOrgNameSnapshot: string;
  lines: Array<{
    listingId: string;
    itemKey: string;
    nameSnapshot: string;
    categorySnapshot: RequestLineDoc["categorySnapshot"];
    imageUrlSnapshot?: string;
    expirationSnapshot?: string;
    urgencySnapshot?: RequestLineDoc["urgencySnapshot"];
    quantityRequested: number;
  }>;
  expiresAt: string;
};

export async function createRequest(input: CreateRequestInput) {
  const requestsRef = collection(db, "requests");
  const requestRef = doc(requestsRef);

  const batch = writeBatch(db);

  batch.set(requestRef, {
    fromOrgId: input.fromOrgId,
    fromOrgNameSnapshot: input.fromOrgNameSnapshot,
    toOrgId: input.toOrgId,
    toOrgNameSnapshot: input.toOrgNameSnapshot,
    status: "pending",
    expiresAt: input.expiresAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  for (const line of input.lines) {
    const lineRef = doc(collection(requestRef, "lines"));
    batch.set(lineRef, {
      listingId: line.listingId,
      itemKey: line.itemKey,
      nameSnapshot: line.nameSnapshot,
      categorySnapshot: line.categorySnapshot,
      imageUrlSnapshot: line.imageUrlSnapshot ?? "",
      expirationSnapshot: line.expirationSnapshot ?? null,
      urgencySnapshot: line.urgencySnapshot ?? null,
      quantityRequested: line.quantityRequested,
      quantityHeld: 0,
      quantityCompleted: 0,
      status: "pending",
    });
  }

  await batch.commit();
  return requestRef.id;
}

export async function getRequestById(requestId: string): Promise<RequestDoc | null> {
  const snap = await getDoc(doc(db, "requests", requestId));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Omit<RequestDoc, "id">),
  };
}

export async function getRequestLinesOnce(
  requestId: string
): Promise<RequestLineDoc[]> {
  const snap = await getDocs(collection(db, "requests", requestId, "lines"));

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<RequestLineDoc, "id">),
  }));
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
) {
  await updateDoc(doc(db, "requests", requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeRequestsForOrg(
  orgId: string,
  direction: "incoming" | "outgoing",
  callback: (items: RequestDoc[]) => void
): Unsubscribe {
  const field = direction === "incoming" ? "toOrgId" : "fromOrgId";

  const q = query(
    collection(db, "requests"),
    (undefined as any)
  );

  if (direction === "incoming") {
    const incomingQuery = query(
      collection(db, "requests"),
      where("toOrgId", "==", orgId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(incomingQuery, (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<RequestDoc, "id">),
        }))
      );
    });
  }

  const outgoingQuery = query(
    collection(db, "requests"),
    where("fromOrgId", "==", orgId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(outgoingQuery, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<RequestDoc, "id">),
      }))
    );
  });
}

export function subscribeRequestLines(
  requestId: string,
  callback: (lines: RequestLineDoc[]) => void
): Unsubscribe {
  const q = query(collection(db, "requests", requestId, "lines"));

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<RequestLineDoc, "id">),
      }))
    );
  });
}

export async function holdRequestInventory(
  request: RequestDoc,
  lines: RequestLineDoc[]
) {
  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, "requests", request.id);
    const requestSnap = await transaction.get(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Request not found.");
    }

    const currentRequest = requestSnap.data() as Omit<RequestDoc, "id">;
    if (currentRequest.status !== "pending") {
      throw new Error("Only pending requests can be held.");
    }

    for (const line of lines) {
      if (line.status !== "pending") continue;

      const listingRef = doc(db, "listings", line.listingId);
      const listingSnap = await transaction.get(listingRef);

      if (!listingSnap.exists()) {
        throw new Error(`Listing missing for ${line.nameSnapshot}.`);
      }

      const listing = listingSnap.data() as Omit<ListingDoc, "id">;

      if (listing.kind !== "offering") {
        throw new Error(`Listing ${line.nameSnapshot} is not an offering.`);
      }

      if (listing.quantity < line.quantityRequested) {
        throw new Error(
          `Not enough quantity for ${line.nameSnapshot}. Available: ${listing.quantity}.`
        );
      }

      const remaining = listing.quantity - line.quantityRequested;

      if (remaining > 0) {
        transaction.update(listingRef, {
          quantity: remaining,
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.delete(listingRef);
      }

      const lineRef = doc(db, "requests", request.id, "lines", line.id);
      transaction.update(lineRef, {
        status: "held",
        quantityHeld: line.quantityRequested,
      });
    }

    transaction.update(requestRef, {
      status: "held",
      updatedAt: serverTimestamp(),
    });
  });
}

export async function cancelHeldRequest(
  request: RequestDoc,
  lines: RequestLineDoc[]
) {
  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, "requests", request.id);
    const requestSnap = await transaction.get(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Request not found.");
    }

    const currentRequest = requestSnap.data() as Omit<RequestDoc, "id">;
    if (currentRequest.status !== "held") {
      throw new Error("Only held requests can be cancelled.");
    }

    for (const line of lines) {
      const heldQty = line.quantityHeld ?? 0;
      if (line.status !== "held" || heldQty <= 0) continue;

      const listingRef = doc(db, "listings", line.listingId);
      const listingSnap = await transaction.get(listingRef);

      if (listingSnap.exists()) {
        const listing = listingSnap.data() as Omit<ListingDoc, "id">;

        transaction.update(listingRef, {
          quantity: listing.quantity + heldQty,
          status: "active",
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(listingRef, {
          orgId: request.toOrgId,
          orgNameSnapshot: request.toOrgNameSnapshot,
          kind: "offering",
          itemKey: line.itemKey,
          name: line.nameSnapshot,
          category: line.categorySnapshot,
          quantity: heldQty,
          imageUrl: line.imageUrlSnapshot ?? "",
          urgency: null,
          expiration: line.expirationSnapshot ?? null,
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      const lineRef = doc(db, "requests", request.id, "lines", line.id);
      transaction.update(lineRef, {
        status: "cancelled",
      });
    }

    transaction.update(requestRef, {
      status: "cancelled",
      updatedAt: serverTimestamp(),
    });
  });
}

export async function completeHeldRequest(
  request: RequestDoc,
  lines: RequestLineDoc[]
) {
  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, "requests", request.id);
    const requestSnap = await transaction.get(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Request not found.");
    }

    const currentRequest = requestSnap.data() as Omit<RequestDoc, "id">;
    if (currentRequest.status !== "held") {
      throw new Error("Only held requests can be completed.");
    }

    for (const line of lines) {
      if (line.status !== "held") continue;

      const lineRef = doc(db, "requests", request.id, "lines", line.id);
      transaction.update(lineRef, {
        status: "completed",
        quantityCompleted: line.quantityHeld ?? line.quantityRequested,
      });
    }

    transaction.update(requestRef, {
      status: "completed",
      updatedAt: serverTimestamp(),
    });
  });
}