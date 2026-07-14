import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  admins as initialAdmins,
  projects as allProjects,
  type Admin,
  type AdminRole,
  type AdminScope,
} from "../lib/mock-data";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "../lib/onboarding";
import { DataTable, PageHeader, type Column } from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/administration")({
  head: () => ({ meta: [{ title: "Administration — FieldWorkz OS" }] }),
  component: AdminPage,
});

// ---------- Role badge ----------
const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  qc_reviewer: "QC Reviewer",
  viewer: "Viewer",
};

// Distinct colored badges per role (owner = accent blue, admin = neutral,
// QC reviewer = amber, viewer = muted).
const ROLE_BADGE: Record<AdminRole, string> = {
  owner: "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200",
  admin: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
  qc_reviewer: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
  viewer: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
};

function RoleBadge({ role }: { role: AdminRole }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[role]}`}>
      {ROLE_LABEL[role]}
    </span>
  );
}

function scopeLabel(scope: AdminScope): string {
  if (scope.type === "all") return "All projects";
  if (scope.projectIds.length === 0) return "No projects";
  const names = scope.projectIds
    .map((id) => allProjects.find((p) => p.id === id)?.name)
    .filter(Boolean) as string[];
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
}

// ---------- Roles/permissions matrix ----------
type RoleKey = "admin" | "qc" | "viewer";
type Cap = { label: string; admin: boolean; qc: boolean; viewer: boolean };
const INITIAL_CAPABILITIES: Cap[] = [
  { label: "Org profile and billing",               admin: false, qc: false, viewer: false },
  { label: "Invite or remove admins",               admin: true,  qc: false, viewer: false },
  { label: "Connect and manage integrations",       admin: true,  qc: false, viewer: false },
  { label: "Create and edit projects",              admin: true,  qc: false, viewer: false },
  { label: "Manage data collector repository",      admin: true,  qc: false, viewer: false },
  { label: "Assign collectors to projects",         admin: true,  qc: false, viewer: false },
  { label: "Review, approve or reject submissions", admin: true,  qc: true,  viewer: false },
  { label: "View submissions and analytics",        admin: true,  qc: true,  viewer: true  },
  { label: "Upload and manage training modules",    admin: true,  qc: false, viewer: false },
  { label: "Send messages to collectors",           admin: true,  qc: false, viewer: false },
  { label: "View org-wide reports",                 admin: true,  qc: true,  viewer: true  },
];

// ---------- Page ----------
type PanelMode = { kind: "closed" } | { kind: "invite" } | { kind: "manage"; admin: Admin };

function AdminPage() {
  const [rows, setRows] = useState<Admin[]>(initialAdmins);
  const [previewEmpty, setPreviewEmpty] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
  const [panel, setPanel] = useState<PanelMode>({ kind: "closed" });
  const [confirmRemove, setConfirmRemove] = useState<Admin | null>(null);
  const [capabilities, setCapabilities] = useState<Cap[]>(INITIAL_CAPABILITIES);
  const [permsEditing, setPermsEditing] = useState(false);
  const [permsDraft, setPermsDraft] = useState<Cap[]>(INITIAL_CAPABILITIES);

  function toggleDraft(idx: number, role: RoleKey) {
    setPermsDraft((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [role]: !c[role] } : c))
    );
  }

  const visibleRows = useMemo(() => {
    const base = previewEmpty ? rows.filter((r) => r.role === "owner") : rows;
    const q = search.trim().toLowerCase();
    return base.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (!q) return true;
      const scopeText = scopeLabel(r.scope).toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        ROLE_LABEL[r.role].toLowerCase().includes(q) ||
        scopeText.includes(q)
      );
    });
  }, [rows, previewEmpty, search, roleFilter]);

  const nonOwnerCount = visibleRows.filter((r) => r.role !== "owner").length;

  function upsertAdmin(a: Admin) {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === a.id);
      return exists ? prev.map((r) => (r.id === a.id ? a : r)) : [...prev, a];
    });
  }
  function removeAdmin(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const columns: Column<Admin>[] = [
    {
      key: "name",
      header: "Name",
      render: (a) => (
        <div>
          <div className="font-medium text-foreground">{a.name}</div>
          <div className="text-xs text-muted-foreground">{a.email}</div>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (a) => <RoleBadge role={a.role} /> },
    {
      key: "scope",
      header: "Project access",
      render: (a) => (
        <span
          className={
            a.scope.type === "all"
              ? "text-foreground"
              : "text-foreground"
          }
        >
          {scopeLabel(a.scope)}
        </span>
      ),
    },
    {
      key: "added",
      header: "Added",
      render: (a) => <span className="text-muted-foreground">{a.addedOn}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) =>
        a.role === "owner" ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <button
            className="text-xs font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            onClick={() => setPanel({ kind: "manage", admin: a })}
          >
            Manage
          </button>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Administration"
        description="Manage who can access FieldWorkz, what role they hold, and which projects they can see."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewEmpty((v) => !v)}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {previewEmpty ? "Show all admins" : "Preview empty state"}
            </button>
            <button className={btnPrimary} onClick={() => setPanel({ kind: "invite" })}>
              Invite admin
            </button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, role, or project"
          className="w-72 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as AdminRole | "all")}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="qc_reviewer">QC Reviewer</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {nonOwnerCount === 0 && !search && roleFilter === "all" ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium text-foreground">Only you have access so far</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            Invite teammates, external QC reviewers, or funders to give them role-based access to this workspace.
          </p>
          <div className="mt-5">
            <button className={btnPrimary} onClick={() => setPanel({ kind: "invite" })}>
              Invite the first admin
            </button>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} rows={visibleRows} />
      )}

      {/* Roles and permissions — editable */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-foreground">Roles and permissions</h2>
            <p className="text-xs text-muted-foreground">
              Adjust what each role can do. Owner always has full access. Custom roles aren't supported.
            </p>
          </div>
          {permsEditing ? (
            <div className="flex items-center gap-2">
              <button
                className={btnSecondary}
                onClick={() => {
                  setPermsDraft(capabilities);
                  setPermsEditing(false);
                }}
              >
                Cancel
              </button>
              <button
                className={btnSecondary}
                onClick={() => setPermsDraft(INITIAL_CAPABILITIES)}
              >
                Reset to defaults
              </button>
              <button
                className={btnPrimary}
                onClick={() => {
                  setCapabilities(permsDraft);
                  setPermsEditing(false);
                }}
              >
                Save changes
              </button>
            </div>
          ) : (
            <button
              className={btnSecondary}
              onClick={() => {
                setPermsDraft(capabilities);
                setPermsEditing(true);
              }}
            >
              Edit permissions
            </button>
          )}
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Capability</th>
                <th className="px-4 py-2.5"><RoleBadge role="owner" /></th>
                <th className="px-4 py-2.5"><RoleBadge role="admin" /></th>
                <th className="px-4 py-2.5"><RoleBadge role="qc_reviewer" /></th>
                <th className="px-4 py-2.5"><RoleBadge role="viewer" /></th>
              </tr>
            </thead>
            <tbody>
              {(permsEditing ? permsDraft : capabilities).map((c, idx) => (
                <tr key={c.label} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-foreground">{c.label}</td>
                  <Cell on={true} />
                  <EditableCell on={c.admin} editing={permsEditing} onToggle={() => toggleDraft(idx, "admin")} />
                  <EditableCell on={c.qc} editing={permsEditing} onToggle={() => toggleDraft(idx, "qc")} />
                  <EditableCell on={c.viewer} editing={permsEditing} onToggle={() => toggleDraft(idx, "viewer")} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Side panels */}
      {panel.kind === "invite" && (
        <InvitePanel
          onClose={() => setPanel({ kind: "closed" })}
          onSubmit={(payload) => {
            const id = crypto.randomUUID();
            upsertAdmin({
              id,
              name: payload.email.split("@")[0],
              email: payload.email,
              role: payload.role,
              scope: payload.scope,
              addedOn: new Date().toISOString().slice(0, 10),
              status: "invited",
            });
            setPanel({ kind: "closed" });
          }}
        />
      )}
      {panel.kind === "manage" && (
        <ManagePanel
          admin={panel.admin}
          onClose={() => setPanel({ kind: "closed" })}
          onSave={(updated) => {
            upsertAdmin(updated);
            setPanel({ kind: "closed" });
          }}
          onRequestRemove={() => setConfirmRemove(panel.admin)}
        />
      )}

      {/* Remove confirmation */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
            <div className="border-b border-border px-5 py-3 text-sm font-semibold">Remove access?</div>
            <div className="px-5 py-4 text-sm text-foreground">
              <p>
                <span className="font-medium">{confirmRemove.name}</span> ({confirmRemove.email}) will lose
                access to FieldWorkz immediately. This can't be undone, but you can re-invite them later.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button className={btnSecondary} onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                onClick={() => {
                  removeAdmin(confirmRemove.id);
                  setConfirmRemove(null);
                  setPanel({ kind: "closed" });
                }}
              >
                Remove access
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Cell({ on }: { on: boolean }) {
  return (
    <td className="px-4 py-2.5">
      {on ? (
        <span className="text-primary" aria-label="allowed">✓</span>
      ) : (
        <span className="text-muted-foreground" aria-label="not allowed">—</span>
      )}
    </td>
  );
}

// ---------- Invite panel ----------
type InvitablePanelRole = Exclude<AdminRole, "owner">;

function InvitePanel({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (v: { email: string; role: InvitablePanelRole; scope: AdminScope }) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitablePanelRole>("admin");
  const [scopeType, setScopeType] = useState<"all" | "specific">("all");
  const [projectIds, setProjectIds] = useState<string[]>([]);

  const valid =
    /.+@.+\..+/.test(email) &&
    (scopeType === "all" || projectIds.length > 0);

  return (
    <SidePanel title="Invite to workspace" onClose={onClose}>
      <PanelForm
        email={email}
        setEmail={setEmail}
        role={role}
        setRole={setRole}
        scopeType={scopeType}
        setScopeType={setScopeType}
        projectIds={projectIds}
        setProjectIds={setProjectIds}
      />
      <PanelFooter>
        <button className={btnSecondary} onClick={onClose}>Cancel</button>
        <button
          className={btnPrimary}
          disabled={!valid}
          onClick={() =>
            onSubmit({
              email: email.trim(),
              role,
              scope:
                scopeType === "all"
                  ? { type: "all" }
                  : { type: "specific", projectIds },
            })
          }
        >
          Send invite
        </button>
      </PanelFooter>
    </SidePanel>
  );
}

// ---------- Manage panel ----------
function ManagePanel({
  admin,
  onClose,
  onSave,
  onRequestRemove,
}: {
  admin: Admin;
  onClose: () => void;
  onSave: (a: Admin) => void;
  onRequestRemove: () => void;
}) {
  const [email] = useState(admin.email);
  const [role, setRole] = useState<InvitablePanelRole>(
    admin.role === "owner" ? "admin" : (admin.role as InvitablePanelRole)
  );
  const [scopeType, setScopeType] = useState<"all" | "specific">(admin.scope.type);
  const [projectIds, setProjectIds] = useState<string[]>(
    admin.scope.type === "specific" ? admin.scope.projectIds : []
  );

  const valid = scopeType === "all" || projectIds.length > 0;

  return (
    <SidePanel title={`Manage access · ${admin.name}`} onClose={onClose}>
      <PanelForm
        email={email}
        setEmail={() => {}}
        emailReadOnly
        role={role}
        setRole={setRole}
        scopeType={scopeType}
        setScopeType={setScopeType}
        projectIds={projectIds}
        setProjectIds={setProjectIds}
      />
      <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-900">Remove access</p>
        <p className="mt-1 text-xs text-red-800">
          Revokes this person's access to the workspace. They can be re-invited later.
        </p>
        <button
          className="mt-3 text-sm font-medium text-red-700 hover:underline"
          onClick={onRequestRemove}
        >
          Remove {admin.name}'s access
        </button>
      </div>
      <PanelFooter>
        <button className={btnSecondary} onClick={onClose}>Cancel</button>
        <button
          className={btnPrimary}
          disabled={!valid}
          onClick={() =>
            onSave({
              ...admin,
              role,
              scope:
                scopeType === "all"
                  ? { type: "all" }
                  : { type: "specific", projectIds },
            })
          }
        >
          Save changes
        </button>
      </PanelFooter>
    </SidePanel>
  );
}

// ---------- Shared side panel shell ----------
function SidePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PanelFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto flex items-center justify-end gap-2 border-t border-border px-5 py-3">
      {children}
    </div>
  );
}

// ---------- Panel form (shared invite + manage) ----------
function PanelForm({
  email,
  setEmail,
  emailReadOnly = false,
  role,
  setRole,
  scopeType,
  setScopeType,
  projectIds,
  setProjectIds,
}: {
  email: string;
  setEmail: (v: string) => void;
  emailReadOnly?: boolean;
  role: InvitablePanelRole;
  setRole: (r: InvitablePanelRole) => void;
  scopeType: "all" | "specific";
  setScopeType: (v: "all" | "specific") => void;
  projectIds: string[];
  setProjectIds: (v: string[]) => void;
}) {
  function toggleProject(id: string) {
    setProjectIds(
      projectIds.includes(id) ? projectIds.filter((x) => x !== id) : [...projectIds, id]
    );
  }
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
      <div>
        <label className={labelCls}>Email</label>
        <input
          className={inputCls}
          value={email}
          readOnly={emailReadOnly}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@relief-hq.org"
        />
      </div>

      <div>
        <label className={labelCls}>Role</label>
        <div className="mt-1 space-y-2">
          {(["admin", "qc_reviewer", "viewer"] as InvitablePanelRole[]).map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors ${
                role === r ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={role === r}
                onChange={() => setRole(r)}
                className="mt-0.5 h-4 w-4"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <RoleBadge role={r} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{ROLE_HINT[r]}</p>
              </div>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Owner is tied to org creation and transferred separately, not assigned via invite.
        </p>
      </div>

      {/* Project scope — same visual weight as role */}
      <div>
        <label className={labelCls}>Project access</label>
        <div className="mt-1 space-y-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors ${
              scopeType === "all" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
            }`}
          >
            <input
              type="radio"
              name="scope"
              checked={scopeType === "all"}
              onChange={() => setScopeType("all")}
              className="mt-0.5 h-4 w-4"
            />
            <div>
              <div className="font-medium text-foreground">All projects</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sees every current and future project in this workspace.
              </p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors ${
              scopeType === "specific" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
            }`}
          >
            <input
              type="radio"
              name="scope"
              checked={scopeType === "specific"}
              onChange={() => setScopeType("specific")}
              className="mt-0.5 h-4 w-4"
            />
            <div className="flex-1">
              <div className="font-medium text-foreground">Specific projects</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Useful for client contacts, funders, or reviewers scoped to one engagement.
              </p>

              {scopeType === "specific" && (
                <div className="mt-3 space-y-1.5 rounded-md border border-border bg-background p-2">
                  {allProjects.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        checked={projectIds.includes(p.id)}
                        onChange={() => toggleProject(p.id)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-foreground">{p.name}</span>
                    </label>
                  ))}
                  {projectIds.length === 0 && (
                    <p className="px-1.5 pt-1 text-xs text-amber-800">
                      Select at least one project.
                    </p>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

const ROLE_HINT: Record<InvitablePanelRole, string> = {
  admin: "Full operational access: projects, integrations, collectors, training, messaging.",
  qc_reviewer: "Reviews, approves, or rejects submissions and views analytics. Cannot create or send.",
  viewer: "Read-only access to submissions, analytics, and reports.",
};
