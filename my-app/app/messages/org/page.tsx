"use client";

import ChatWorkspace from "@/app/components/chat/ChatWorkspace";

export default function OrgMessagesPage() {
  return (
    <ChatWorkspace
      viewerRole="org"
      title="Organisation messages"
      defaultOrgLabel="The Humanity Project"
      defaultMemberOrgLabel="Neighbouring organisation"
    />
  );
}