import { Suspense } from "react";
import ChatWorkspace from "@/app/components/chat/ChatWorkspace";
import { DEMO_NAZ_ORG } from "@/app/lib/demoContext";

function MessagesPageContent() {
  return (
    <ChatWorkspace
      viewerRole="member_org"
      title="Messages"
      currentOrgId={DEMO_NAZ_ORG.id}
      currentOrgName={DEMO_NAZ_ORG.name}
    />
  );
}

export default function MemberOrgMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPageContent />
    </Suspense>
  );
}