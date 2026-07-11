import { createFileRoute } from "@tanstack/react-router";
import { collectors, orgMessages } from "../lib/mock-data";
import { PageHeader } from "../components/ui-kit";
import { ComposeAndLog } from "./dashboard.projects.$id";

export const Route = createFileRoute("/dashboard/messaging")({
  head: () => ({ meta: [{ title: "Messaging — FieldWorkz OS" }] }),
  component: MessagingPage,
});

function MessagingPage() {
  return (
    <>
      <PageHeader
        title="Messaging"
        description="Send updates to collectors across the whole organization or a filtered group."
      />
      <ComposeAndLog
        audienceLabel="All active collectors"
        defaultRecipientCount={collectors.filter((c) => c.status === "active").length}
        history={orgMessages}
      />
    </>
  );
}
