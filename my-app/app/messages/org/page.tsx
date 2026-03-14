"use client";

import ChatWorkspace from "@/app/components/chat/ChatWorkspace";
import { DEMO_ORG } from "@/app/lib/demoContext";

export default function OrgMessagesPage() {
  return (
    <ChatWorkspace
      viewerRole="org"
      title="Messages"
      currentOrgId={DEMO_ORG.id}
      currentOrgName={DEMO_ORG.name}
    />
  );
}