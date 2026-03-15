export type ChatRole = "org" | "member_org";

export type ChatRequestStatus =
  | "pending"
  | "held"
  | "completed"
  | "cancelled";

export type ChatRequestLine = {
  itemName: string;
  quantity: number;
};

export type ChatMatchOffer = {
  matchId: string;
  offeringListingId: string;
  offeringOrgId: string;
  offeringOrgName: string;
  itemKey: string;
  itemName: string;
  category: "food" | "clothing" | "hygiene" | "supplies";
  imageUrl?: string | null;
  expiration?: string | null;
  availableQuantity: number;
  actionTaken?: boolean;
};

export type ChatThread = {
  id: string;
  participantKey: string;
  orgIds: string[];
  orgNames: Record<string, string>;
  subject: string;
  requestId?: string;
  lastMessageText?: string;
  lastMessageAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ChatMessage = {
  id: string;
  senderRole: ChatRole;
  senderOrgId: string;
  senderOrgName: string;
  type: "text" | "request" | "system" | "match_offer";
  text: string;
  createdAt?: unknown;
  automated?: boolean;
  requestId?: string;
  requestLines?: ChatRequestLine[];
  requestStatus?: ChatRequestStatus;
  expiresAt?: string;
  matchOffer?: ChatMatchOffer;
};