"use client";

import ChatWorkspace from "@/app/components/chat/ChatWorkspace";
import { DEMO_NAZ_ORG } from "@/app/lib/demoContext";

export default function MemberOrgMessagesPage() {
  return (
    <ChatWorkspace
      viewerRole="member_org"
      title="Messages"
      currentOrgId={DEMO_NAZ_ORG.id}
      currentOrgName={DEMO_NAZ_ORG.name}
    />
  );
}