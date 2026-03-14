"use client";

import type {
  ChatMessage,
  ChatRequestLine,
  ChatRole,
  ChatState,
  ChatThread,
} from "./chatTypes";

const STORAGE_KEY = "org-chat-demo-v1";
const CHANNEL_NAME = "org-chat-demo-channel";

let channel: BroadcastChannel | null = null;
const localListeners = new Set<() => void>();

function ensureChannel() {
  if (typeof window === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

function notifyLocalListeners() {
  for (const listener of localListeners) {
    listener();
  }
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyState(): ChatState {
  return { threads: [] };
}

function sortThreads(threads: ChatThread[]) {
  return [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
}

function writeState(next: ChatState) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyLocalListeners();
  ensureChannel()?.postMessage({ type: "sync" });
}

export function readChatState(): ChatState {
  if (typeof window === "undefined") return emptyState();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyState();

  try {
    const parsed = JSON.parse(raw) as ChatState;
    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
    };
  } catch {
    return emptyState();
  }
}

export function subscribeChatState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  localListeners.add(callback);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  const bc = ensureChannel();
  const handleChannel = () => callback();

  window.addEventListener("storage", handleStorage);
  bc?.addEventListener("message", handleChannel);

  return () => {
    localListeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
    bc?.removeEventListener("message", handleChannel);
  };
}

export function updateRequestMessageStatus(args: {
  threadId: string;
  messageId: string;
  status: "held" | "completed" | "cancelled";
}) {
  updateThread(args.threadId, (thread) => {
    const target = thread.messages.find(
      (message) => message.id === args.messageId && message.type === "request"
    );

    if (!target || target.type !== "request") {
      return thread;
    }

    if (target.requestStatus === args.status) {
      return thread;
    }

    const now = Date.now();

    let automatedMessage: ChatMessage | null = null;

    if (args.status === "held") {
      automatedMessage = {
        id: makeId(),
        senderRole: "org",
        type: "text",
        automated: true,
        text: "Automatic reply: Your request has been accepted and placed on hold. Please collect it within 48 hours or it may be released.",
        createdAt: now,
      };
    } else if (args.status === "cancelled") {
      automatedMessage = {
        id: makeId(),
        senderRole: "org",
        type: "text",
        automated: true,
        text: "Automatic reply: This request has been cancelled.",
        createdAt: now,
      };
    }

    return {
      ...thread,
      updatedAt: now,
      unreadForMemberOrg:
        args.status === "held" || args.status === "cancelled"
          ? thread.unreadForMemberOrg + 1
          : thread.unreadForMemberOrg,
      messages: [
        ...thread.messages.map((message) => {
          if (message.id !== args.messageId || message.type !== "request") {
            return message;
          }

          return {
            ...message,
            requestStatus: args.status,
          };
        }),
        ...(automatedMessage ? [automatedMessage] : []),
      ],
    };
  });
}

function updateThread(
  threadId: string,
  updater: (thread: ChatThread) => ChatThread
) {
  const state = readChatState();

  const nextThreads = state.threads.map((thread) =>
    thread.id === threadId ? updater(thread) : thread
  );

  writeState({
    threads: sortThreads(nextThreads),
  });
}

function findThreadByParticipants(args: {
  orgLabel: string;
  memberOrgLabel: string;
}) {
  const state = readChatState();

  return state.threads.find(
    (thread) =>
      thread.orgLabel === args.orgLabel &&
      thread.memberOrgLabel === args.memberOrgLabel
  );
}

export function openConversationThread(args: {
  orgLabel: string;
  memberOrgLabel: string;
  createdBy: ChatRole;
  subject?: string;
  openingText?: string;
}) {
  const existing = findThreadByParticipants({
    orgLabel: args.orgLabel,
    memberOrgLabel: args.memberOrgLabel,
  });

  if (existing) {
    if (args.openingText?.trim()) {
      sendTextMessage({
        threadId: existing.id,
        senderRole: args.createdBy,
        text: args.openingText,
      });
    }

    return existing.id;
  }

  const now = Date.now();

  const initialMessages: ChatMessage[] = args.openingText?.trim()
    ? [
        {
          id: makeId(),
          senderRole: args.createdBy,
          type: "text",
          text: args.openingText.trim(),
          createdAt: now,
        },
      ]
    : [];

  const nextThread: ChatThread = {
    id: makeId(),
    subject: args.subject?.trim() || "Conversation",
    orgLabel: args.orgLabel,
    memberOrgLabel: args.memberOrgLabel,
    createdAt: now,
    updatedAt: now,
    unreadForOrg:
      args.createdBy === "member_org" && initialMessages.length > 0 ? 1 : 0,
    unreadForMemberOrg:
      args.createdBy === "org" && initialMessages.length > 0 ? 1 : 0,
    messages: initialMessages,
  };

  const state = readChatState();

  writeState({
    threads: sortThreads([nextThread, ...state.threads]),
  });

  return nextThread.id;
}

export function appendRequestMessage(args: {
  orgLabel: string;
  memberOrgLabel: string;
  createdBy: ChatRole;
  requestLines: ChatRequestLine[];
}) {
  const existingThreadId = openConversationThread({
    orgLabel: args.orgLabel,
    memberOrgLabel: args.memberOrgLabel,
    createdBy: args.createdBy,
    subject: "Conversation",
  });

  updateThread(existingThreadId, (thread) => {
    const now = Date.now();
    const expiresAt = now + 48 * 60 * 60 * 1000;

    return {
      ...thread,
      updatedAt: now,
      unreadForOrg:
        args.createdBy === "member_org"
          ? thread.unreadForOrg + 1
          : thread.unreadForOrg,
      unreadForMemberOrg:
        args.createdBy === "member_org"
          ? thread.unreadForMemberOrg + 1
          : thread.unreadForMemberOrg,
      messages: [
        ...thread.messages,
        {
          id: makeId(),
          senderRole: args.createdBy,
          type: "request",
          text: `${args.memberOrgLabel} sent a request.`,
          createdAt: now,
          requestLines: args.requestLines,
          requestStatus: "pending",
          expiresAt,
        },
        {
          id: makeId(),
          senderRole: "org",
          type: "text",
          automated: true,
          text: "Automatic reply: This is only a request and nothing has been confirmed yet. You will receive another message if it is accepted or cancelled.",
          createdAt: now + 1,
        },
      ],
    };
  });

  return existingThreadId;
}

export function sendTextMessage(args: {
  threadId: string;
  senderRole: ChatRole;
  text: string;
}) {
  const cleanText = args.text.trim();
  if (!cleanText) return;

  updateThread(args.threadId, (thread) => {
    const now = Date.now();

    return {
      ...thread,
      updatedAt: now,
      unreadForOrg:
        args.senderRole === "member_org"
          ? thread.unreadForOrg + 1
          : thread.unreadForOrg,
      unreadForMemberOrg:
        args.senderRole === "org"
          ? thread.unreadForMemberOrg + 1
          : thread.unreadForMemberOrg,
      messages: [
        ...thread.messages,
        {
          id: makeId(),
          senderRole: args.senderRole,
          type: "text",
          text: cleanText,
          createdAt: now,
        },
      ],
    };
  });
}

export function markThreadRead(threadId: string, viewerRole: ChatRole) {
  updateThread(threadId, (thread) => ({
    ...thread,
    unreadForOrg: viewerRole === "org" ? 0 : thread.unreadForOrg,
    unreadForMemberOrg:
      viewerRole === "member_org" ? 0 : thread.unreadForMemberOrg,
  }));
}

export function getPeerLabel(thread: ChatThread, viewerRole: ChatRole) {
  return viewerRole === "org" ? thread.memberOrgLabel : thread.orgLabel;
}

export function getUnreadCount(thread: ChatThread, viewerRole: ChatRole) {
  return viewerRole === "org" ? thread.unreadForOrg : thread.unreadForMemberOrg;
}