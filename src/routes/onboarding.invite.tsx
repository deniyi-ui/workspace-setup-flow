import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { btnGhost, btnPrimary, inputCls, saveOnboarding } from "../lib/onboarding";

export const Route = createFileRoute("/onboarding/invite")({
  head: () => ({
    meta: [
      { title: "Invite admins — FieldWorkz OS" },
      {
        name: "description",
        content: "Invite owners and admins to your FieldWorkz OS workspace.",
      },
    ],
  }),
  component: InviteStep,
});

interface InviteRow {
  id: number;
  email: string;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

let nextId = 3;

function InviteStep() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<InviteRow[]>([
    { id: 1, email: "" },
    { id: 2, email: "" },
  ]);

  const filled = rows.filter((r) => r.email.trim().length > 0);
  const allFilledValid = filled.length > 0 && filled.every((r) => isValidEmail(r.email));

  function update(id: number, patch: Partial<InviteRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));
  }

  function addRow() {
    setRows((rs) => [...rs, { id: nextId++, email: "" }]);
  }

  function sendInvites() {
    saveOnboarding({ invitesSent: filled.length });
    navigate({ to: "/onboarding/start" });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Invite admins</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Working solo for now? That's fine — you can invite people later.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Invited as admins — you can add reviewers or viewers later, once you have a project.
      </p>

      <div className="mt-10 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-start gap-2">
            <div className="flex-1">
              <input
                type="email"
                aria-label="Email address"
                className={inputCls + " mt-0"}
                value={row.email}
                onChange={(e) => update(row.id, { email: e.target.value })}
                placeholder="colleague@organization.org"
              />
            </div>
            <button
              onClick={() => remove(row.id)}
              aria-label="Remove invite"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              disabled={rows.length <= 1}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-3 text-sm font-medium text-accent-foreground transition-colors hover:opacity-80"
      >
        + Add another
      </button>

      <div className="mt-10 flex items-center gap-3">
        <button className={btnPrimary} onClick={sendInvites} disabled={!allFilledValid}>
          Send invites
        </button>
        <button className={btnGhost} onClick={() => navigate({ to: "/onboarding/start" })}>
          Skip for now, invite later
        </button>
      </div>
    </div>
  );
}
