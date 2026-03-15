import { Suspense } from "react";
import ChatWorkspace from "@/app/components/chat/ChatWorkspace";
import { DEMO_ORG } from "@/app/lib/demoContext";

function OrgMessagesPageContent() {
  return (
    <ChatWorkspace
      viewerRole="org"
      title="Messages"
      currentOrgId={DEMO_ORG.id}
      currentOrgName={DEMO_ORG.name}
    />
  );
}

export default function OrgMessagesPage() {
  return (
    <Suspense fallback={null}>
      <OrgMessagesPageContent />
    </Suspense>
  );
}