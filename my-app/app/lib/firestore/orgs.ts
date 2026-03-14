import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import type { OrgDoc } from "./types";

export async function upsertOrg(input: Omit<OrgDoc, "createdAt" | "updatedAt">) {
  const ref = doc(db, "orgs", input.id);

  await setDoc(
    ref,
    {
      ...input,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeOrg(
  orgId: string,
  callback: (org: OrgDoc | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "orgs", orgId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }

    callback({
      id: snap.id,
      ...(snap.data() as Omit<OrgDoc, "id">),
    });
  });
}

export function subscribeAllOrgs(
  callback: (orgs: OrgDoc[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, "orgs"), (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<OrgDoc, "id">),
      }))
    );
  });
}