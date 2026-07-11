import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  collectors as allCollectors,
  getProject,
  integrations,
  countryOptions,
  languageOptions,
  religionOptions,
  type Collector,
  type Submission,
  type TrainingModule,
} from "../lib/mock-data";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "../lib/onboarding";
import {
  Badge,
  DataTable,
  EmptyState,
  FilterPanel,
  Modal,
  PageHeader,
  StatCard,
  StatusBadge,
  Tabs,
  type Column,
  type FilterGroup,
} from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/projects/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Project — FieldWorkz OS` }, { name: "description", content: `Project ${params.id} details` }],
  }),
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectDetail,
});

function ProjectNotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-muted-foreground">Project not found.</p>
      <Link to="/dashboard/projects" className="mt-3 inline-block text-sm font-medium text-accent-foreground">
        Back to projects
      </Link>
    </div>
  );
}

type TabId = "overview" | "collectors" | "submissions" | "analytics" | "training" | "messaging";

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const [tab, setTab] = useState<TabId>("overview");

  const flaggedCount = project.submissions.filter((s) => s.status === "flagged").length;

  return (
    <>
      <div className="mb-2">
        <Link to="/dashboard/projects" className="text-xs text-muted-foreground hover:text-foreground">
          ← Projects
        </Link>
      </div>
      <PageHeader
        title={project.name}
        description={
          project.status === "draft"
            ? "This project is a draft. Complete setup to start collecting."
            : project.formName
              ? `Form: ${project.formName}${project.startDate ? ` · ${project.startDate} → ${project.endDate}` : ""}`
              : undefined
        }
        action={<StatusBadge status={project.status} />}
      />

      <Tabs<TabId>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "collectors", label: "Collectors", count: project.collectorIds.length },
          { id: "submissions", label: "Submissions", count: project.submissions.length },
          { id: "analytics", label: "Analytics" },
          { id: "training", label: "Training" },
          { id: "messaging", label: "Messaging" },
        ]}
      />

      <div className="mt-6">
        {tab === "overview" && <Overview project={project} flaggedCount={flaggedCount} />}
        {tab === "collectors" && <CollectorsTab project={project} />}
        {tab === "submissions" && <SubmissionsTab project={project} />}
        {tab === "analytics" && <AnalyticsTab project={project} />}
        {tab === "training" && <TrainingTab project={project} />}
        {tab === "messaging" && <MessagingTab project={project} />}
      </div>
    </>
  );
}

/* ---------------- Overview ---------------- */
function Overview({
  project,
  flaggedCount,
}: {
  project: ReturnType<typeof getProject> & object;
  flaggedCount: number;
}) {
  if (project.status === "draft") {
    return (
      <EmptyState
        title="Finish setting up this project"
        description="Link an integration and form, define the timeline, then assign collectors to start receiving submissions."
        action={<button className={btnPrimary}>Continue setup</button>}
      />
    );
  }
  const approved = project.submissions.filter((s) => s.status === "approved").length;
  const pending = project.submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Collectors" value={project.collectorIds.length} />
      <StatCard label="Submissions" value={project.submissions.length} />
      <StatCard label="Pending review" value={pending} />
      <StatCard label="Flagged" value={flaggedCount} />
      <div className="sm:col-span-2 lg:col-span-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Integration</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.platform
              ? `${integrations.find((i) => i.id === project.platform)?.name} · form ${project.formName}`
              : "No integration linked"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Collectors ---------------- */
function CollectorsTab({ project }: { project: ReturnType<typeof getProject> & object }) {
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [invited, setInvited] = useState<Set<string>>(new Set(project.collectorIds));

  const groups: FilterGroup[] = [
    { key: "country", label: "Country", options: countryOptions() },
    { key: "gender", label: "Gender", options: ["female", "male", "other"] },
    { key: "religion", label: "Religion", options: religionOptions() },
    { key: "education", label: "Education", options: ["primary", "secondary", "tertiary"] },
    { key: "language", label: "Language", options: languageOptions() },
  ];

  const filtered = useMemo(() => {
    return allCollectors.filter((c) => {
      if (search && !`${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase())) return false;
      for (const g of groups) {
        const v = values[g.key];
        if (v && v.length && !v.includes((c as any)[g.key])) return false;
      }
      return true;
    });
  }, [search, values]);

  function assignmentStatus(id: string): string {
    if (project.collectorIds.includes(id)) return "assigned";
    if (invited.has(id) && !project.collectorIds.includes(id)) return "invited";
    return "not invited";
  }

  const columns: Column<Collector>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "country", header: "Country", render: (c) => c.country },
    { key: "language", header: "Language", render: (c) => c.language },
    {
      key: "assign",
      header: "Assignment",
      render: (c) => <StatusBadge status={assignmentStatus(c.id)} />,
    },
  ];

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((f) => f.id))));
  }
  function inviteSelected() {
    setInvited((prev) => new Set([...prev, ...Array.from(selected)]));
    setSelected(new Set());
  }

  return (
    <div className="flex gap-6">
      <FilterPanel
        groups={groups}
        values={values}
        onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
        search={search}
        onSearchChange={setSearch}
        onClear={() => { setValues({}); setSearch(""); }}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} matching · {selected.size} selected
          </p>
          <button
            className={btnPrimary}
            disabled={selected.size === 0}
            onClick={inviteSelected}
          >
            Invite selected ({selected.size})
          </button>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          selectable
          selectedIds={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          empty={<EmptyState title="No collectors match these filters" />}
        />
      </div>
    </div>
  );
}

/* ---------------- Submissions ---------------- */
type SubTab = "pending" | "flagged" | "approved";
function SubmissionsTab({ project }: { project: ReturnType<typeof getProject> & object }) {
  const [status, setStatus] = useState<SubTab>("pending");
  const [detail, setDetail] = useState<Submission | null>(null);

  const counts = {
    pending: project.submissions.filter((s) => s.status === "pending").length,
    flagged: project.submissions.filter((s) => s.status === "flagged").length,
    approved: project.submissions.filter((s) => s.status === "approved").length,
  };
  const rows = project.submissions.filter((s) => s.status === status);

  const columns: Column<Submission>[] = [
    { key: "collector", header: "Collector", render: (s) => <span className="font-medium">{s.collectorName}</span> },
    { key: "at", header: "Submitted", render: (s) => <span className="text-muted-foreground">{s.submittedAt}</span> },
    { key: "duration", header: "Duration", render: (s) => `${s.durationMin} min` },
    { key: "gps", header: "GPS", render: (s) => <span className="font-mono text-xs text-muted-foreground">{s.gps}</span> },
    {
      key: "flags",
      header: "Flags",
      render: (s) =>
        s.status === "flagged" ? (
          <Badge tone="warning">Quality</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Tabs<SubTab>
          value={status}
          onChange={setStatus}
          tabs={[
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "flagged", label: "Flagged", count: counts.flagged },
            { id: "approved", label: "Approved", count: counts.approved },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={(s) => setDetail(s)}
        rowClassName={(s) => (s.status === "flagged" ? "bg-red-50/60 hover:!bg-red-50" : "")}
        empty={
          <EmptyState
            title={
              status === "flagged"
                ? "No flagged submissions"
                : status === "pending"
                  ? "No submissions pending review"
                  : "No approved submissions yet"
            }
            description={
              status === "flagged"
                ? "Quality checks haven't flagged anything in this project."
                : undefined
            }
          />
        }
      />

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `Submission by ${detail.collectorName}` : ""}
        size="lg"
        footer={
          detail?.status === "flagged" ? (
            <>
              <button className={btnSecondary}>Reject</button>
              <button className={btnPrimary}>Approve</button>
            </>
          ) : detail?.status === "pending" ? (
            <>
              <button className={btnSecondary}>Flag for review</button>
              <button className={btnPrimary}>Approve</button>
            </>
          ) : null
        }
      >
        {detail && (
          <div className="space-y-5 text-sm">
            {detail.status === "flagged" && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-900">
                  Flag reason
                </p>
                <p className="mt-1 text-sm text-amber-900">{detail.flagReason}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Submitted</p>
                <p className="mt-0.5 text-foreground">{detail.submittedAt}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Duration</p>
                <p className="mt-0.5 text-foreground">{detail.durationMin} minutes</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                <p className="mt-0.5 text-foreground">{detail.location}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{detail.gps}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-0.5"><StatusBadge status={detail.status} /></p>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-border">
              <div className="aspect-[3/1] w-full bg-[linear-gradient(120deg,var(--color-muted)_0%,var(--color-secondary)_100%)] relative">
                <div
                  className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20"
                  style={{ left: "42%", top: "58%" }}
                  aria-label="GPS pin"
                />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">Map preview</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Response data
              </p>
              <div className="divide-y divide-border rounded-md border border-border">
                {detail.responses.map((r, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 px-3 py-2">
                    <span className="col-span-1 text-muted-foreground">{r.question}</span>
                    <span className="col-span-2 text-foreground">{r.answer}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Audit trail
              </p>
              <ul className="space-y-1.5">
                {detail.audit.map((a, i) => (
                  <li key={i} className="flex gap-3 text-xs">
                    <span className="w-32 shrink-0 text-muted-foreground">{a.at}</span>
                    <span className="w-32 shrink-0 text-foreground">{a.who}</span>
                    <span className="text-muted-foreground">{a.action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ---------------- Analytics ---------------- */
function AnalyticsTab({ project }: { project: ReturnType<typeof getProject> & object }) {
  if (project.submissions.length === 0) {
    return (
      <EmptyState
        title="No analytics yet"
        description="Analytics appear once collectors start submitting. Check back after your first submissions come in."
      />
    );
  }

  // completion series (mocked)
  const series = [4, 8, 12, 10, 15, 18, 22];
  const max = Math.max(...series);
  const width = 560, height = 140;
  const step = width / (series.length - 1);
  const pts = series.map((v, i) => `${i * step},${height - (v / max) * (height - 20) - 10}`).join(" ");

  const leaderboard = project.collectorIds.slice(0, 5).map((id) => {
    const c = allCollectors.find((x) => x.id === id)!;
    const subs = project.submissions.filter((s) => s.collectorId === id).length;
    const flagged = project.submissions.filter((s) => s.collectorId === id && s.status === "flagged").length;
    return { c, subs, flagged };
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Completion rate over time</p>
        <p className="text-xs text-muted-foreground">Daily submissions, last 7 days</p>
        <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
          <polyline points={pts} fill="none" stroke="var(--color-primary)" strokeWidth="2" />
          {series.map((v, i) => (
            <circle
              key={i}
              cx={i * step}
              cy={height - (v / max) * (height - 20) - 10}
              r="3"
              fill="var(--color-primary)"
            />
          ))}
        </svg>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">Collector performance</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2">Collector</th>
                <th className="py-2 text-right">Subs</th>
                <th className="py-2 text-right">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.c.id} className="border-t border-border">
                  <td className="py-2">{row.c.name}</td>
                  <td className="py-2 text-right tabular-nums">{row.subs}</td>
                  <td className="py-2 text-right tabular-nums">{row.flagged}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">Coverage map</p>
          <div className="mt-3 aspect-[3/2] w-full overflow-hidden rounded-md bg-[linear-gradient(120deg,var(--color-muted)_0%,var(--color-secondary)_100%)] relative">
            {project.submissions.map((s, i) => (
              <span
                key={s.id}
                className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                style={{ left: `${20 + i * 12}%`, top: `${30 + (i % 3) * 15}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Primary water source</p>
        <p className="text-xs text-muted-foreground">Response distribution</p>
        <ul className="mt-3 space-y-2">
          {[
            { label: "Borehole", pct: 42 },
            { label: "Piped", pct: 28 },
            { label: "Well", pct: 18 },
            { label: "River / surface", pct: 12 },
          ].map((row) => (
            <li key={row.label} className="text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span className="text-foreground">{row.label}</span>
                <span className="tabular-nums">{row.pct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${row.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Training ---------------- */
function TrainingTab({ project }: { project: ReturnType<typeof getProject> & object }) {
  if (project.training.length === 0) {
    return (
      <EmptyState
        title="No training modules yet"
        description="Upload PDFs, videos, or slide decks and assign them to collectors before fieldwork starts."
        action={<button className={btnPrimary}>Upload module</button>}
      />
    );
  }
  const columns: Column<TrainingModule>[] = [
    { key: "title", header: "Module", render: (m) => <span className="font-medium">{m.title}</span> },
    { key: "format", header: "Format", render: (m) => <Badge tone="muted">{m.format}</Badge> },
    { key: "added", header: "Added", render: (m) => <span className="text-muted-foreground">{m.addedOn}</span> },
    {
      key: "completions",
      header: "Completed",
      render: (m) => (
        <span className="tabular-nums text-foreground">
          {m.completions} / {m.assigned}
        </span>
      ),
    },
  ];
  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className={btnPrimary}>Upload module</button>
      </div>
      <DataTable columns={columns} rows={project.training} />
    </>
  );
}

/* ---------------- Messaging (project-scoped) ---------------- */
function MessagingTab({ project }: { project: ReturnType<typeof getProject> & object }) {
  return (
    <ComposeAndLog
      audienceLabel={`Assigned collectors on ${project.name}`}
      defaultRecipientCount={project.collectorIds.length}
      history={project.messages}
    />
  );
}

export function ComposeAndLog({
  audienceLabel,
  defaultRecipientCount,
  history,
}: {
  audienceLabel: string;
  defaultRecipientCount: number;
  history: import("../lib/mock-data").ProjectMessage[];
}) {
  const [audience, setAudience] = useState("assigned");
  const [channels, setChannels] = useState<string[]>(["in-app"]);
  const [body, setBody] = useState("");

  function toggleChannel(c: string) {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Compose</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>Recipients</label>
            <select className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="assigned">{audienceLabel} ({defaultRecipientCount})</option>
              <option value="active">Active collectors only</option>
              <option value="individual">Individual collector…</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Channels</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["in-app", "sms", "email", "push"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    channels.includes(c)
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Message</label>
            <textarea
              className={inputCls + " min-h-[120px]"}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Reminder: submit today's visits by 6pm."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className={btnSecondary}>Schedule</button>
            <button className={btnPrimary} disabled={!body.trim() || channels.length === 0}>
              Send
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Recent messages</p>
        {history.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No messages sent yet" />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((m) => (
              <li key={m.id} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{m.sentAt}</span>
                  <span className="flex gap-1">
                    {m.channel.map((c) => (
                      <Badge key={c} tone="muted">{c}</Badge>
                    ))}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-foreground">{m.preview}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.recipients} recipients · {m.delivered} delivered
                  {m.failed > 0 && (
                    <span className="text-amber-800"> · {m.failed} failed</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
