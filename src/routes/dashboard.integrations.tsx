import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { integrations as initial, type Integration } from "../lib/mock-data";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "../lib/onboarding";
import { Badge, EmptyState, Modal, PageHeader, StatusBadge } from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/integrations")({
  head: () => ({ meta: [{ title: "Integrations — FieldWorkz OS" }] }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const [list, setList] = useState<Integration[]>(initial);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<Integration | null>(null);

  function connect(id: string) {
    setConnecting(id);
    setTimeout(() => {
      setList((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: "connected", account: `relief-hq.${id}.example`, errorMessage: undefined }
            : i,
        ),
      );
      setConnecting(null);
    }, 1500);
  }
  function disconnect(id: string) {
    setList((prev) => prev.map((i) => (i.id === id ? { ...i, status: "not_connected", account: undefined } : i)));
    setConfirmDisconnect(null);
  }

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect FieldWorkz OS to the survey platforms your organization already uses."
      />

      {list.length === 0 ? (
        <EmptyState title="No integrations available" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((i) => (
            <div key={i.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
                    {i.mark}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.detail}</p>
                  </div>
                </div>
                <StatusBadge status={i.status === "not_connected" ? "not connected" : i.status} />
              </div>

              {i.status === "connected" && (
                <>
                  <p className="mt-4 text-xs text-muted-foreground">Connected as</p>
                  <p className="text-sm text-foreground">{i.account}</p>
                  <div className="mt-3">
                    <Badge tone="muted">Used in {i.projectsUsing} projects</Badge>
                  </div>
                </>
              )}
              {i.status === "error" && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {i.errorMessage}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                {i.status === "connected" ? (
                  <button
                    className={btnSecondary}
                    onClick={() => setConfirmDisconnect(i)}
                  >
                    Disconnect
                  </button>
                ) : connecting === i.id ? (
                  <button className={btnPrimary} disabled>
                    <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Connecting…
                  </button>
                ) : (
                  <button className={btnPrimary} onClick={() => connect(i.id)}>
                    {i.status === "error" ? "Reconnect" : "Connect"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={confirmDisconnect !== null}
        onClose={() => setConfirmDisconnect(null)}
        title="Disconnect integration"
        footer={
          <>
            <button className={btnSecondary} onClick={() => setConfirmDisconnect(null)}>Cancel</button>
            <button
              className={btnPrimary}
              onClick={() => confirmDisconnect && disconnect(confirmDisconnect.id)}
            >
              Disconnect anyway
            </button>
          </>
        }
      >
        {confirmDisconnect && (
          <div className="space-y-3 text-sm">
            <p className="text-foreground">
              {confirmDisconnect.name} is currently used by {confirmDisconnect.projectsUsing} project
              {confirmDisconnect.projectsUsing === 1 ? "" : "s"}.
            </p>
            <p className="text-muted-foreground">
              Submissions on those projects will stop syncing until you reconnect. Collector assignments
              and past submissions are kept.
            </p>
            <div>
              <label className={labelCls}>Type the platform name to confirm</label>
              <input className={inputCls} placeholder={confirmDisconnect.name} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
