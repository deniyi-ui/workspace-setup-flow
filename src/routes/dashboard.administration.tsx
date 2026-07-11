import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { admins as initialAdmins, type Admin } from "../lib/mock-data";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "../lib/onboarding";
import {
  DataTable,
  Modal,
  PageHeader,
  StatusBadge,
  type Column,
} from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/administration")({
  head: () => ({ meta: [{ title: "Administration — FieldWorkz OS" }] }),
  component: AdminPage,
});

interface Invite { id: string; email: string; role: "owner" | "admin" }

function AdminPage() {
  const [rows] = useState<Admin[]>(initialAdmins);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([
    { id: crypto.randomUUID(), email: "", role: "admin" },
  ]);

  function updateInvite(id: string, patch: Partial<Invite>) {
    setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function addRow() {
    setInvites((prev) => [...prev, { id: crypto.randomUUID(), email: "", role: "admin" }]);
  }
  function removeRow(id: string) {
    setInvites((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }
  function send() {
    setInviteOpen(false);
    setInvites([{ id: crypto.randomUUID(), email: "", role: "admin" }]);
  }

  const columns: Column<Admin>[] = [
    { key: "name", header: "Name", render: (a) => <span className="font-medium">{a.name}</span> },
    { key: "email", header: "Email", render: (a) => <span className="text-muted-foreground">{a.email}</span> },
    { key: "role", header: "Role", render: (a) => <span className="capitalize">{a.role}</span> },
    { key: "added", header: "Added", render: (a) => <span className="text-muted-foreground">{a.addedOn}</span> },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions",
      header: "",
      render: () => (
        <div className="flex justify-end gap-3 text-xs">
          <button className="text-muted-foreground hover:text-foreground">Change role</button>
          <button className="text-red-700 hover:underline">Remove</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Administration"
        description="Manage who can access and configure your FieldWorkz workspace."
        action={<button className={btnPrimary} onClick={() => setInviteOpen(true)}>Invite admin</button>}
      />

      <section>
        <h2 className="mb-3 text-sm font-medium text-foreground">Admins</h2>
        <DataTable columns={columns} rows={rows} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-foreground">Roles and permissions</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Capability</th>
                <th className="px-4 py-2.5">Owner</th>
                <th className="px-4 py-2.5">Admin</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Manage integrations", true, true],
                ["Create and edit projects", true, true],
                ["Review and approve submissions", true, true],
                ["Bulk upload collectors", true, true],
                ["Send messages", true, true],
                ["Invite or remove admins", true, false],
                ["Transfer ownership", true, false],
                ["Delete the organization", true, false],
              ].map(([cap, owner, admin], i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-foreground">{cap as string}</td>
                  <td className="px-4 py-2.5">{owner ? <span className="text-primary">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-2.5">{admin ? <span className="text-primary">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Role definitions are fixed in this version. Custom roles are on the roadmap.
        </p>
      </section>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite admins"
        size="lg"
        footer={
          <>
            <button className={btnSecondary} onClick={() => setInviteOpen(false)}>Cancel</button>
            <button
              className={btnPrimary}
              onClick={send}
              disabled={invites.every((i) => !i.email.trim())}
            >
              Send invites
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {invites.map((inv, i) => (
            <div key={inv.id} className="grid grid-cols-[1fr_160px_auto] items-end gap-3">
              <div>
                {i === 0 && <label className={labelCls}>Email</label>}
                <input
                  className={inputCls}
                  value={inv.email}
                  onChange={(e) => updateInvite(inv.id, { email: e.target.value })}
                  placeholder="colleague@relief-hq.org"
                />
              </div>
              <div>
                {i === 0 && <label className={labelCls}>Role</label>}
                <select
                  className={inputCls}
                  value={inv.role}
                  onChange={(e) => updateInvite(inv.id, { role: e.target.value as Invite["role"] })}
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <button
                onClick={() => removeRow(inv.id)}
                aria-label="Remove"
                className="mb-1.5 rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={invites.length === 1}
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={addRow}
            className="text-sm font-medium text-accent-foreground hover:opacity-80"
          >
            + Add another
          </button>
        </div>
      </Modal>
    </>
  );
}
