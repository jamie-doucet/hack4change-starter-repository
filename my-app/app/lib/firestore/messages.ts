import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import type {
  ChatMessage,
  ChatRequestLine,
  ChatRequestStatus,
  ChatRole,
  ChatThread,
} from "@/app/lib/chat/chatTypes";

function toMillis(value: any): number {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return 0;
}

export function makeParticipantKey(a: string, b: string) {
  return [a, b].sort().join("__");
}

export async function openOrCreateThread(args: {
  currentOrgId: string;
  currentOrgName: string;
  otherOrgId: string;
  otherOrgName: string;
  subject?: string;
}) {
  const participantKey = makeParticipantKey(args.currentOrgId, args.otherOrgId);
  const ref = doc(db, "threads", participantKey);

  await setDoc(
    ref,
    {
      participantKey,
      orgIds: [args.currentOrgId, args.otherOrgId].sort(),
      orgNames: {
        [args.currentOrgId]: args.currentOrgName,
        [args.otherOrgId]: args.otherOrgName,
      },
      subject: args.subject ?? "Conversation",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return participantKey;
}

export function subscribeThreadsForOrg(
  orgId: string,
  callback: (threads: ChatThread[]) => void
): Unsubscribe {
  const q = query(collection(db, "threads"), where("orgIds", "array-contains", orgId));

  return onSnapshot(
    q,
    (snapshot) => {
      const threads = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ChatThread, "id">),
        }))
        .sort(
          (a, b) =>
            toMillis(b.updatedAt || b.lastMessageAt || b.createdAt) -
            toMillis(a.updatedAt || a.lastMessageAt || a.createdAt)
        );

      callback(threads);
    },
    (error) => {
      console.error("subscribeThreadsForOrg failed", { orgId, error });
    }
  );
}

export function subscribeMessages(
  threadId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "threads", threadId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ChatMessage, "id">),
        }))
      );
    },
    (error) => {
      console.error("subscribeMessages failed", { threadId, error });
    }
  );
}

export async function sendTextMessage(args: {
  threadId: string;
  senderRole: ChatRole;
  senderOrgId: string;
  senderOrgName: string;
  text: string;
}) {
  const trimmed = args.text.trim();
  if (!trimmed) return;

  await addDoc(collection(db, "threads", args.threadId, "messages"), {
    senderRole: args.senderRole,
    senderOrgId: args.senderOrgId,
    senderOrgName: args.senderOrgName,
    type: "text",
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "threads", args.threadId), {
    lastMessageText: trimmed,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function sendSystemMessage(args: {
  threadId: string;
  senderOrgId: string;
  senderOrgName: string;
  text: string;
  requestId?: string;
}) {
  await addDoc(collection(db, "threads", args.threadId, "messages"), {
    senderRole: "org",
    senderOrgId: args.senderOrgId,
    senderOrgName: args.senderOrgName,
    type: "system",
    text: args.text,
    automated: true,
    requestId: args.requestId ?? null,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "threads", args.threadId), {
    lastMessageText: args.text,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function appendRequestMessage(args: {
  threadId: string;
  senderRole: ChatRole;
  senderOrgId: string;
  senderOrgName: string;
  requestId: string;
  text: string;
  expiresAt: string;
  requestLines: ChatRequestLine[];
}) {
  await addDoc(collection(db, "threads", args.threadId, "messages"), {
    senderRole: args.senderRole,
    senderOrgId: args.senderOrgId,
    senderOrgName: args.senderOrgName,
    type: "request",
    text: args.text,
    requestId: args.requestId,
    requestLines: args.requestLines,
    requestStatus: "pending",
    expiresAt: args.expiresAt,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "threads", args.threadId), {
    requestId: args.requestId,
    lastMessageText: args.text,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateRequestMessageStatus(args: {
  threadId: string;
  messageId: string;
  status: ChatRequestStatus;
}) {
  await updateDoc(doc(db, "threads", args.threadId, "messages", args.messageId), {
    requestStatus: args.status,
  });
}