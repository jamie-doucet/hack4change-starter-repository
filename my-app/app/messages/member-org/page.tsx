"use client";

import ChatWorkspace from "@/app/components/chat/ChatWorkspace";
import { DEMO_MEMBER_ORG } from "@/app/lib/demoContext";

export default function MemberOrgMessagesPage() {
  return (
    <ChatWorkspace
      viewerRole="member_org"
      title="Messages"
      currentOrgId={DEMO_MEMBER_ORG.id}
      currentOrgName={DEMO_MEMBER_ORG.name}
    />
  );
}