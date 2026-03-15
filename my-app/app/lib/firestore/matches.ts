import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { openOrCreateThread, sendMatchOfferMessage } from "@/app/lib/firestore/messages";

type NotifyMatchingRequestersArgs = {
  offeringListingId: string;
  offeringOrgId: string;
  offeringOrgName: string;
  itemKey: string;
  itemName: string;
  quantity: number;
};

export async function notifyMatchingRequesters({
  offeringListingId,
  offeringOrgId,
  offeringOrgName,
  itemKey,
  itemName,
  quantity,
}: NotifyMatchingRequestersArgs) {
  const askingQuery = query(
    collection(db, "listings"),
    where("kind", "==", "asking"),
    where("status", "==", "active"),
    where("itemKey", "==", itemKey)
  );

  const snapshot = await getDocs(askingQuery);

  for (const askingDoc of snapshot.docs) {
    const asking = askingDoc.data() as {
    orgId: string;
    orgNameSnapshot?: string;
    name: string;
    category: "food" | "clothing" | "hygiene" | "supplies";
    };

    if (asking.orgId === offeringOrgId) continue;

    const matchId = `${offeringListingId}__${askingDoc.id}`;
    const matchRef = doc(db, "listingMatchNotifications", matchId);
    const existingMatch = await getDoc(matchRef);

    if (existingMatch.exists()) continue;

    const targetOrgName = asking.orgNameSnapshot || asking.orgId;

    const threadId = await openOrCreateThread({
      currentOrgId: offeringOrgId,
      currentOrgName: offeringOrgName,
      otherOrgId: asking.orgId,
      otherOrgName: targetOrgName,
      subject: "Possible match",
    });

    await sendMatchOfferMessage({
    threadId,
    senderOrgId: offeringOrgId,
    senderOrgName: offeringOrgName,
    matchOffer: {
        matchId,
        offeringListingId,
        offeringOrgId,
        offeringOrgName,
        itemKey,
        itemName,
        category: asking.category,
        imageUrl: "",
        expiration: null,
        availableQuantity: quantity,
    },
    });

    await setDoc(matchRef, {
      offeringListingId,
      askingListingId: askingDoc.id,
      offeringOrgId,
      askingOrgId: asking.orgId,
      threadId,
      itemKey,
      createdAt: serverTimestamp(),
    });
  }
}