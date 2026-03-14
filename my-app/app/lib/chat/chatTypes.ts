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

export type ChatMessage = {
  id: string;
  senderRole: ChatRole;
  type: "text" | "request";
  text: string;
  createdAt: number;
  automated?: boolean;
  requestLines?: ChatRequestLine[];
  requestStatus?: ChatRequestStatus;
  expiresAt?: number;
};

export type ChatThread = {
  id: string;
  subject: string;
  orgLabel: string;
  memberOrgLabel: string;
  createdAt: number;
  updatedAt: number;
  unreadForOrg: number;
  unreadForMemberOrg: number;
  messages: ChatMessage[];
};

export type ChatState = {
  threads: ChatThread[];
};