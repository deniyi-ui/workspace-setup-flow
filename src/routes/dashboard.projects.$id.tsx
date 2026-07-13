import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  collectors as allCollectors,
  getProject,
  integrations,
  countryOptions,
  languageOptions,
  religionOptions,
  type Collector,
  type Project,
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
  loader: ({ params }): { project: Project } => {
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
  const { project } = Route.useLoaderData() as { project: Project };
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
  project: Project;
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
function CollectorsTab({ project }: { project: Project }) {
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
type SubTab = "all" | "pending" | "flagged" | "approved" | "rejected";

function flagSignal(s: Submission): { label: string; detail: string } | null {
  if (s.status !== "flagged") return null;
  const reason = (s.flagReason ?? "").toLowerCase();
  if (reason.includes("duration") || reason.includes("short") || reason.includes("straight"))
    return { label: "Speed", detail: s.flagReason ?? "" };
  if (reason.includes("gps") || reason.includes("region") || reason.includes("duplicate"))
    return { label: "GPS", detail: s.flagReason ?? "" };
  return { label: "Quality", detail: s.flagReason ?? "" };
}

function WarningIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5l7 12H1l7-12z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function SubmissionsTab({ project }: { project: Project }) {
  const [status, setStatus] = useState<SubTab>("all");
  const [detail, setDetail] = useState<Submission | null>(null);
  const [selectedQ, setSelectedQ] = useState(0);
  const [auditOpen, setAuditOpen] = useState(true);

  const counts = {
    all: project.submissions.length,
    pending: project.submissions.filter((s) => s.status === "pending").length,
    flagged: project.submissions.filter((s) => s.status === "flagged").length,
    approved: project.submissions.filter((s) => s.status === "approved").length,
    rejected: 0,
  };
  const rows =
    status === "all" ? project.submissions : project.submissions.filter((s) => s.status === status);

  const columns: Column<Submission>[] = [
    { key: "collector", header: "Collector", render: (s) => <span className="font-medium">{s.collectorName}</span> },
    { key: "at", header: "Submitted", render: (s) => <span className="text-muted-foreground">{s.submittedAt}</span> },
    { key: "duration", header: "Duration", render: (s) => `${s.durationMin} min` },
    { key: "gps", header: "GPS", render: (s) => <span className="font-mono text-xs text-muted-foreground">{s.gps}</span> },
    { key: "location", header: "Location", render: (s) => <span className="text-muted-foreground">{s.location}</span> },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={s.status} />
          {(() => {
            const f = flagSignal(s);
            return f ? (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800"
                title={f.detail}
              >
                <WarningIcon /> {f.label}
              </span>
            ) : null;
          })()}
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: () => <span className="text-xs text-muted-foreground">Review →</span>,
    },
  ];

  function openDetail(s: Submission) {
    setSelectedQ(0);
    setAuditOpen(true);
    setDetail(s);
  }

  const flag = detail ? flagSignal(detail) : null;

  return (
    <>
      <div className="mb-4">
        <Tabs<SubTab>
          value={status}
          onChange={setStatus}
          tabs={[
            { id: "all", label: "All", count: counts.all },
            { id: "pending", label: "Awaiting approval", count: counts.pending },
            { id: "flagged", label: "Flagged", count: counts.flagged },
            { id: "approved", label: "Approved", count: counts.approved },
            { id: "rejected", label: "Rejected", count: counts.rejected },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={(s) => openDetail(s)}
        rowClassName={(s) => (s.status === "flagged" ? "bg-amber-50/70 hover:!bg-amber-50" : "")}
        empty={
          <EmptyState
            title={
              status === "flagged"
                ? "No flagged submissions"
                : status === "pending"
                  ? "No submissions awaiting approval"
                  : status === "approved"
                    ? "No approved submissions yet"
                    : status === "rejected"
                      ? "No rejected submissions"
                      : "No submissions yet"
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
          detail && detail.status !== "approved" ? (
            <>
              <button className={btnSecondary}>Reject</button>
              <button className={btnPrimary}>Approve</button>
            </>
          ) : null
        }
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <MetaCell label="Project" value={project.name} />
              <MetaCell label="Survey" value={project.formName || "—"} />
              <MetaCell label="Submitted" value={detail.submittedAt} />
              <MetaCell label="Duration" value={`${detail.durationMin} min`} />
              <MetaCell label="Location" value={detail.location} sub={detail.gps} />
              <MetaCell label="Status" node={<StatusBadge status={detail.status} />} />
            </div>

            {flag && (
              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <span className="text-amber-700"><WarningIcon /></span>
                <p className="truncate text-sm">{flag.detail}</p>
              </div>
            )}

            <div className="grid gap-0 overflow-hidden rounded-md border border-border sm:grid-cols-[220px_minmax(0,1fr)]">
              <ul className="divide-y divide-border border-b border-border sm:border-b-0 sm:border-r">
                {detail.responses.map((r, i) => {
                  const active = i === selectedQ;
                  return (
                    <li key={i}>
                      <button
                        onClick={() => setSelectedQ(i)}
                        className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors ${
                          active ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <span className="mt-0.5 w-6 shrink-0 text-xs tabular-nums text-muted-foreground">
                          Q{i + 1}
                        </span>
                        <span className="truncate">{r.question}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Question</p>
                <p className="mt-1 text-foreground">{detail.responses[selectedQ]?.question}</p>
                <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Response</p>
                <p className="mt-1 text-foreground">{detail.responses[selectedQ]?.answer}</p>
              </div>
            </div>

            <div className="rounded-md border border-border">
              <button
                onClick={() => setAuditOpen((o) => !o)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Audit trail
                <span aria-hidden>{auditOpen ? "−" : "+"}</span>
              </button>
              {auditOpen && (
                <ul className="border-t border-border px-3 py-2">
                  {detail.audit.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 py-1 text-xs">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                      <span className="w-36 shrink-0 text-muted-foreground tabular-nums">{a.at}</span>
                      <span className="w-32 shrink-0 text-foreground">{a.who}</span>
                      <span className="text-muted-foreground">{a.action}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function MetaCell({
  label,
  value,
  sub,
  node,
}: {
  label: string;
  value?: string;
  sub?: string;
  node?: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {node ? <div className="mt-0.5">{node}</div> : <p className="mt-0.5 text-foreground">{value}</p>}
      {sub && <p className="mt-0.5 font-mono text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ---------------- Analytics ---------------- */
type SortKey = "name" | "subs" | "avgDur" | "approvalRate";
function AnalyticsTab({ project }: { project: Project }) {
  const [includeAll, setIncludeAll] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("subs");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (project.submissions.length === 0) {
    return (
      <EmptyState
        title="No analytics yet"
        description="Analytics appear once collectors start submitting. Check back after your first submissions come in."
      />
    );
  }

  const subs = project.submissions;
  const approved = subs.filter((s) => s.status === "approved");
  const pending = subs.filter((s) => s.status === "pending");
  const flagged = subs.filter((s) => s.status === "flagged");
  const approvalRate = subs.length ? Math.round((approved.length / subs.length) * 100) : 0;
  const avgDuration = subs.length
    ? Math.round(subs.reduce((a, s) => a + s.durationMin, 0) / subs.length)
    : 0;

  const series = [4, 8, 12, 10, 15, 18, 22];
  const max = Math.max(...series);
  const width = 640,
    height = 160;
  const step = width / (series.length - 1);
  const pts = series
    .map((v, i) => `${i * step},${height - (v / max) * (height - 30) - 15}`)
    .join(" ");

  const total = subs.length;
  const donut = [
    { label: "Approved", count: approved.length, color: "var(--color-primary)" },
    { label: "Awaiting approval", count: pending.length, color: "var(--color-muted-foreground)" },
    { label: "Flagged / rejected", count: flagged.length, color: "#d97706" },
  ];
  let acc = 0;
  const r = 52,
    c = 2 * Math.PI * r;
  const donutSegs = donut.map((d) => {
    const frac = total ? d.count / total : 0;
    const seg = { ...d, offset: acc, length: c * frac };
    acc += c * frac;
    return seg;
  });

  const perf = project.collectorIds
    .map((id) => {
      const cx = allCollectors.find((x) => x.id === id);
      if (!cx) return null;
      const mine = subs.filter((s) => s.collectorId === id);
      const app = mine.filter((s) => s.status === "approved").length;
      const avg = mine.length ? Math.round(mine.reduce((a, s) => a + s.durationMin, 0) / mine.length) : 0;
      const rate = mine.length ? Math.round((app / mine.length) * 100) : 0;
      return { id, name: cx.name, subs: mine.length, avgDur: avg, approvalRate: rate };
    })
    .filter((x): x is { id: string; name: string; subs: number; avgDur: number; approvalRate: number } => x !== null);

  const sorted = [...perf].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    return ((a[sortKey] as number) - (b[sortKey] as number)) * dir;
  });
  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" ? "asc" : "desc");
    }
  }
  const arrow = (k: SortKey) => (sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  const byLocation = subs.reduce<Record<string, number>>((acc, s) => {
    const country = s.location.split(",").pop()?.trim() || s.location;
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});
  const locRows = Object.entries(byLocation).sort((a, b) => b[1] - a[1]);
  const locMax = Math.max(1, ...locRows.map(([, v]) => v));

  const pool = includeAll ? subs : approved;
  const questions = Array.from(new Set(subs.flatMap((s) => s.responses.map((r) => r.question))));
  const currentQ = questions[qIdx] ?? questions[0];
  const answers = pool.flatMap((s) => s.responses.filter((r) => r.question === currentQ).map((r) => r.answer));
  const answerCounts = answers.reduce<Record<string, number>>((acc, a) => {
    acc[a] = (acc[a] ?? 0) + 1;
    return acc;
  }, {});
  const unique = Object.keys(answerCounts);
  const isChoice = unique.length > 0 && unique.length <= 6;
  const sortedAnswers = Object.entries(answerCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total submissions" value={subs.length} />
        <StatCard label="Approval rate" value={`${approvalRate}%`} hint={`${approved.length} approved`} />
        <StatCard label="Average duration" value={`${avgDuration} min`} />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-900/80">Flagged for review</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-amber-900">{flagged.length}</p>
          <p className="mt-1 text-xs text-amber-900/70">Needs attention</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">Submissions over time</p>
          <p className="text-xs text-muted-foreground">Daily volume across active date range</p>
          <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
            <polyline points={pts} fill="none" stroke="var(--color-primary)" strokeWidth="2" />
            {series.map((v, i) => (
              <circle
                key={i}
                cx={i * step}
                cy={height - (v / max) * (height - 30) - 15}
                r="3"
                fill="var(--color-primary)"
              />
            ))}
          </svg>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">Status breakdown</p>
          <div className="mt-4 flex items-center gap-5">
            <svg viewBox="0 0 140 140" className="h-32 w-32 -rotate-90">
              <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="16" />
              {donutSegs.map((s, i) => (
                <circle
                  key={i}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="16"
                  strokeDasharray={`${s.length} ${c - s.length}`}
                  strokeDashoffset={-s.offset}
                />
              ))}
            </svg>
            <ul className="space-y-1.5 text-sm">
              {donut.map((d) => (
                <li key={d.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-foreground">{d.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {d.count} · {total ? Math.round((d.count / total) * 100) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <p className="text-sm font-medium text-foreground">Collector performance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="cursor-pointer px-4 py-2.5" onClick={() => toggleSort("name")}>
                  Collector{arrow("name")}
                </th>
                <th className="cursor-pointer px-4 py-2.5 text-right" onClick={() => toggleSort("subs")}>
                  Submissions{arrow("subs")}
                </th>
                <th className="cursor-pointer px-4 py-2.5 text-right" onClick={() => toggleSort("avgDur")}>
                  Avg duration{arrow("avgDur")}
                </th>
                <th className="cursor-pointer px-4 py-2.5 text-right" onClick={() => toggleSort("approvalRate")}>
                  Approval rate{arrow("approvalRate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.subs}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.avgDur ? `${row.avgDur} min` : "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.subs ? `${row.approvalRate}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Coverage by location</p>
        <ul className="mt-3 space-y-2">
          {locRows.map(([loc, n]) => (
            <li key={loc} className="text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span className="text-foreground">{loc}</span>
                <span className="tabular-nums">{n} submission{n === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${(n / locMax) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Question response breakdown</p>
            <p className="text-xs text-muted-foreground">
              Question {Math.min(qIdx + 1, questions.length)} of {questions.length} · {answers.length}{" "}
              response{answers.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={includeAll}
                onChange={(e) => setIncludeAll(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input"
              />
              Include non-approved
            </label>
            <div className="flex items-center gap-1">
              <button
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                onClick={() => setQIdx((i) => Math.max(0, i - 1))}
                disabled={qIdx === 0}
              >
                ←
              </button>
              <select
                value={qIdx}
                onChange={(e) => setQIdx(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                {questions.map((q, i) => (
                  <option key={q} value={i}>
                    Q{i + 1}. {q}
                  </option>
                ))}
              </select>
              <button
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                onClick={() => setQIdx((i) => Math.min(questions.length - 1, i + 1))}
                disabled={qIdx >= questions.length - 1}
              >
                →
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-foreground">{currentQ}</p>

        {answers.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No responses to display for this question.</p>
        ) : isChoice ? (
          <ul className="mt-4 space-y-2">
            {sortedAnswers.map(([label, count]) => {
              const pct = Math.round((count / answers.length) * 100);
              return (
                <li key={label} className="text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-foreground">{label}</span>
                    <span className="tabular-nums">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 max-h-72 overflow-y-auto rounded-md border border-border">
            <ul className="divide-y divide-border">
              {answers.map((a, i) => (
                <li key={i} className="px-3 py-2 text-sm text-foreground">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


/* ---------------- Training ---------------- */
type ModuleSubTab = "materials" | "assessment" | "progress";
type ProgressFilter = "all" | "not started" | "in progress" | "passed" | "failed";

function materialTypeSummary(m: TrainingModule): string {
  if (m.materials.length === 0) return "No materials";
  const counts: Record<string, number> = {};
  for (const mat of m.materials) counts[mat.type] = (counts[mat.type] ?? 0) + 1;
  return Object.entries(counts)
    .map(([t, n]) => `${n} ${t}${n > 1 ? "s" : ""}`)
    .join(", ");
}
function moduleAvgScore(m: TrainingModule): string {
  const scores = m.progress.map((p) => p.score).filter((s): s is number => s !== null);
  if (scores.length === 0) return "—";
  return `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%`;
}
function moduleCompletionRate(m: TrainingModule): string {
  if (m.progress.length === 0) return "—";
  const passed = m.progress.filter((p) => p.assessmentStatus === "passed").length;
  return `${Math.round((passed / m.progress.length) * 100)}%`;
}

function MaterialIcon({ type }: { type: TrainingModule["materials"][number]["type"] }) {
  const base = "flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold";
  if (type === "PDF") return <span className={`${base} bg-red-50 text-red-700`}>PDF</span>;
  if (type === "Video") return <span className={`${base} bg-blue-50 text-blue-700`}>VID</span>;
  return <span className={`${base} bg-amber-50 text-amber-800`}>PPT</span>;
}

function TrainingTab({ project }: { project: Project }) {
  const [modules, setModules] = useState<TrainingModule[]>(project.training);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = modules.find((m) => m.id === selectedId) ?? null;

  function updateModule(next: TrainingModule) {
    setModules((prev) => prev.map((m) => (m.id === next.id ? next : m)));
  }
  function createModule() {
    const id = `t_${Date.now()}`;
    const fresh: TrainingModule = {
      id,
      title: "Untitled module",
      addedOn: new Date().toISOString().slice(0, 10),
      passingScore: 80,
      maxAttempts: 3,
      materials: [],
      questions: [],
      progress: [],
    };
    setModules((prev) => [...prev, fresh]);
    setSelectedId(id);
  }

  if (selected) {
    return (
      <ModuleDetail
        module={selected}
        onBack={() => setSelectedId(null)}
        onChange={updateModule}
      />
    );
  }

  if (modules.length === 0) {
    return (
      <EmptyState
        title="No training modules yet"
        description="Create a module to upload materials and set a knowledge check before assigning collectors."
        action={
          <button className={btnPrimary} onClick={createModule}>
            + New module
          </button>
        }
      />
    );
  }

  const columns: Column<TrainingModule>[] = [
    { key: "title", header: "Module", render: (m) => <span className="font-medium">{m.title}</span> },
    { key: "materials", header: "Materials", render: (m) => <span className="text-muted-foreground">{materialTypeSummary(m)}</span> },
    {
      key: "questions",
      header: "Questions",
      render: (m) =>
        m.questions.length === 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
            <WarningIcon /> None yet
          </span>
        ) : (
          <span className="tabular-nums">{m.questions.length}</span>
        ),
    },
    {
      key: "assigned",
      header: "Assigned",
      render: (m) => <span className="tabular-nums">{m.progress.length}</span>,
    },
    { key: "avg", header: "Avg score", render: (m) => <span className="tabular-nums">{moduleAvgScore(m)}</span> },
    { key: "rate", header: "Completion", render: (m) => <span className="tabular-nums">{moduleCompletionRate(m)}</span> },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className={btnPrimary} onClick={createModule}>
          + New module
        </button>
      </div>
      <DataTable columns={columns} rows={modules} onRowClick={(m) => setSelectedId(m.id)} />
    </>
  );
}

function ModuleDetail({
  module: mod,
  onBack,
  onChange,
}: {
  module: TrainingModule;
  onBack: () => void;
  onChange: (next: TrainingModule) => void;
}) {
  const [sub, setSub] = useState<ModuleSubTab>("materials");
  const [assignOpen, setAssignOpen] = useState(false);

  function assignCollectors(ids: string[]) {
    const existing = new Set(mod.progress.map((p) => p.collectorId));
    const additions = ids
      .filter((id) => !existing.has(id))
      .map((id) => ({
        collectorId: id,
        materialsStatus: "not started" as const,
        assessmentStatus: "not attempted" as const,
        score: null,
        attemptsUsed: 0,
        lastAttemptAt: null,
      }));
    onChange({ ...mod, progress: [...mod.progress, ...additions] });
    setAssignOpen(false);
  }

  return (
    <>
      <div className="mb-2">
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">
          ← All modules
        </button>
      </div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <input
            value={mod.title}
            onChange={(e) => onChange({ ...mod, title: e.target.value })}
            className="w-full max-w-lg rounded-md border border-transparent bg-transparent px-1 -mx-1 text-xl font-semibold tracking-tight text-foreground hover:border-input focus:border-input focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Added {mod.addedOn} · {mod.materials.length} material{mod.materials.length === 1 ? "" : "s"} · {mod.questions.length} question{mod.questions.length === 1 ? "" : "s"} · {mod.progress.length} assigned
          </p>
        </div>
        <button className={btnPrimary} onClick={() => setAssignOpen(true)}>
          Assign collectors
        </button>
      </div>

      <Tabs<ModuleSubTab>
        value={sub}
        onChange={setSub}
        tabs={[
          { id: "materials", label: "Materials", count: mod.materials.length },
          { id: "assessment", label: "Assessment", count: mod.questions.length },
          { id: "progress", label: "Collector progress", count: mod.progress.length },
        ]}
      />

      <div className="mt-6">
        {sub === "materials" && <MaterialsSubTab mod={mod} onChange={onChange} onGoToAssessment={() => setSub("assessment")} />}
        {sub === "assessment" && <AssessmentSubTab mod={mod} onChange={onChange} />}
        {sub === "progress" && <ProgressSubTab mod={mod} onChange={onChange} onAssign={() => setAssignOpen(true)} />}
      </div>

      <AssignCollectorsModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        alreadyAssigned={new Set(mod.progress.map((p) => p.collectorId))}
        onAssign={assignCollectors}
      />
    </>
  );
}

/* -------- Materials sub-tab -------- */
function MaterialsSubTab({
  mod,
  onChange,
  onGoToAssessment,
}: {
  mod: TrainingModule;
  onChange: (next: TrainingModule) => void;
  onGoToAssessment: () => void;
}) {
  function removeMaterial(id: string) {
    onChange({ ...mod, materials: mod.materials.filter((x) => x.id !== id) });
  }
  function addMockMaterial() {
    const id = `mat_${Date.now()}`;
    onChange({
      ...mod,
      materials: [
        ...mod.materials,
        {
          id,
          filename: "new-material.pdf",
          type: "PDF",
          uploadedOn: new Date().toISOString().slice(0, 10),
        },
      ],
    });
  }

  return (
    <div className="space-y-4">
      {mod.materials.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <ul className="divide-y divide-border">
            {mod.materials.map((mat) => (
              <li key={mat.id} className="flex items-center gap-3 px-4 py-3">
                <MaterialIcon type={mat.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{mat.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {mat.type} · uploaded {mat.uploadedOn}
                  </p>
                </div>
                <button className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  Replace
                </button>
                <button
                  onClick={() => removeMaterial(mat.id)}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        onClick={addMockMaterial}
        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
      >
        <span className="text-sm font-medium text-foreground">+ Add another material</span>
        <span className="mt-1 text-xs text-muted-foreground">
          Drag a PDF, video, or slide deck here — you can add several per module
        </span>
      </button>

      {mod.materials.length > 0 && mod.questions.length === 0 && (
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Once materials are added, head to the{" "}
          <button
            onClick={onGoToAssessment}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Assessment
          </button>{" "}
          sub-tab to write the knowledge check.
        </div>
      )}
    </div>
  );
}

/* -------- Assessment sub-tab -------- */
function AssessmentSubTab({
  mod,
  onChange,
}: {
  mod: TrainingModule;
  onChange: (next: TrainingModule) => void;
}) {
  function updateQuestion(qid: string, patch: Partial<import("../lib/mock-data").AssessmentQuestion>) {
    onChange({
      ...mod,
      questions: mod.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    });
  }
  function updateOption(qid: string, oid: string, text: string) {
    onChange({
      ...mod,
      questions: mod.questions.map((q) =>
        q.id === qid ? { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, text } : o)) } : q,
      ),
    });
  }
  function removeQuestion(qid: string) {
    onChange({ ...mod, questions: mod.questions.filter((q) => q.id !== qid) });
  }
  function addQuestion() {
    const qid = `q_${Date.now()}`;
    const newQ = {
      id: qid,
      text: "",
      options: [
        { id: "o1", text: "" },
        { id: "o2", text: "" },
        { id: "o3", text: "" },
        { id: "o4", text: "" },
      ],
      correctOptionId: "o1",
    };
    onChange({ ...mod, questions: [...mod.questions, newQ] });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">Scoring for this module</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Applies only to <span className="font-medium text-foreground">{mod.title}</span>, not other modules.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Passing score (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={mod.passingScore}
              onChange={(e) => onChange({ ...mod, passingScore: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Max attempts</label>
            <input
              type="number"
              min={1}
              value={mod.maxAttempts}
              onChange={(e) => onChange({ ...mod, maxAttempts: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {mod.questions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">No assessment questions yet</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            Add at least one multiple-choice question so collectors can prove they understood the materials.
          </p>
          <div className="mt-5 flex justify-center">
            <button className={btnPrimary} onClick={addQuestion}>
              + Add first question
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {mod.questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Question {i + 1}
                  </p>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Type the question…"
                  rows={2}
                  className={`${inputCls} mt-2 resize-none`}
                />
                <div className="mt-3 space-y-2">
                  {q.options.map((o) => {
                    const isCorrect = o.id === q.correctOptionId;
                    return (
                      <div
                        key={o.id}
                        className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
                          isCorrect ? "border-emerald-300 bg-emerald-50/60" : "border-border bg-background"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={isCorrect}
                          onChange={() => updateQuestion(q.id, { correctOptionId: o.id })}
                          aria-label="Mark as correct"
                          className="h-4 w-4"
                        />
                        <input
                          value={o.text}
                          onChange={(e) => updateOption(q.id, o.id, e.target.value)}
                          placeholder="Answer option…"
                          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        {isCorrect && (
                          <span className="shrink-0 rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                            Marked as correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={addQuestion}
              className="text-sm font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              + Add question
            </button>
            <button className={btnPrimary}>Save assessment</button>
          </div>
        </>
      )}
    </div>
  );
}

/* -------- Collector progress sub-tab -------- */
function progressTone(status: import("../lib/mock-data").AssessmentStatus): import("../lib/mock-data").BadgeTone {
  if (status === "passed") return "success";
  if (status === "failed") return "warning";
  if (status === "in progress") return "neutral";
  return "muted";
}

function ProgressSubTab({
  mod,
  onChange,
  onAssign,
}: {
  mod: TrainingModule;
  onChange: (next: TrainingModule) => void;
  onAssign: () => void;
}) {
  const [filter, setFilter] = useState<ProgressFilter>("all");

  if (mod.progress.length === 0) {
    return (
      <EmptyState
        title="No collectors assigned yet"
        description="Assign collectors to this module — they'll appear here as 'not started' until they open the materials."
        action={
          <button className={btnPrimary} onClick={onAssign}>
            Assign collectors
          </button>
        }
      />
    );
  }

  const counts: Record<ProgressFilter, number> = {
    all: mod.progress.length,
    "not started": mod.progress.filter((p) => p.assessmentStatus === "not attempted" && p.materialsStatus === "not started").length,
    "in progress": mod.progress.filter((p) => p.assessmentStatus === "in progress").length,
    passed: mod.progress.filter((p) => p.assessmentStatus === "passed").length,
    failed: mod.progress.filter((p) => p.assessmentStatus === "failed").length,
  };
  const rows = mod.progress.filter((p) => {
    if (filter === "all") return true;
    if (filter === "not started") return p.assessmentStatus === "not attempted" && p.materialsStatus === "not started";
    return p.assessmentStatus === filter;
  });

  function resetAttempts(cid: string) {
    onChange({
      ...mod,
      progress: mod.progress.map((p) =>
        p.collectorId === cid
          ? { ...p, attemptsUsed: 0, assessmentStatus: "not attempted", score: null, lastAttemptAt: null }
          : p,
      ),
    });
  }

  function nameFor(id: string): string {
    return allCollectors.find((c) => c.id === id)?.name ?? id;
  }

  const columns: Column<import("../lib/mock-data").TrainingProgress & { id: string }>[] = [
    { key: "name", header: "Collector", render: (p) => <span className="font-medium">{nameFor(p.collectorId)}</span> },
    {
      key: "materials",
      header: "Materials",
      render: (p) => <Badge tone={p.materialsStatus === "viewed" ? "success" : "muted"}>{p.materialsStatus}</Badge>,
    },
    {
      key: "assessment",
      header: "Assessment",
      render: (p) => <Badge tone={progressTone(p.assessmentStatus)}>{p.assessmentStatus}</Badge>,
    },
    { key: "score", header: "Score", render: (p) => <span className="tabular-nums">{p.score !== null ? `${p.score}%` : "—"}</span> },
    {
      key: "attempts",
      header: "Attempts",
      render: (p) => (
        <span className="tabular-nums">
          {p.attemptsUsed} / {mod.maxAttempts}
        </span>
      ),
    },
    {
      key: "last",
      header: "Last attempt",
      render: (p) => <span className="text-muted-foreground">{p.lastAttemptAt ?? "—"}</span>,
    },
    {
      key: "action",
      header: "",
      render: (p) => (
        <button
          onClick={() => resetAttempts(p.collectorId)}
          disabled={p.attemptsUsed === 0}
          className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset attempts
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs<ProgressFilter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: "All", count: counts.all },
            { id: "not started", label: "Not started", count: counts["not started"] },
            { id: "in progress", label: "In progress", count: counts["in progress"] },
            { id: "passed", label: "Passed", count: counts.passed },
            { id: "failed", label: "Failed", count: counts.failed },
          ]}
        />
        <button className={btnSecondary} onClick={onAssign}>
          Assign collectors
        </button>
      </div>
      <DataTable
        columns={columns}
        rows={rows.map((p) => ({ ...p, id: p.collectorId }))}
        empty={<EmptyState title="No collectors match this status" />}
      />
    </div>
  );
}

/* -------- Assign collectors modal -------- */
function AssignCollectorsModal({
  open,
  onClose,
  alreadyAssigned,
  onAssign,
}: {
  open: boolean;
  onClose: () => void;
  alreadyAssigned: Set<string>;
  onAssign: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const groups: FilterGroup[] = [
    { key: "country", label: "Country", options: countryOptions() },
    { key: "language", label: "Language", options: languageOptions() },
    { key: "status", label: "Status", options: ["active", "invited", "inactive"] },
  ];

  const filtered = useMemo(() => {
    return allCollectors.filter((c) => {
      if (search && !`${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase())) return false;
      for (const g of groups) {
        const v = values[g.key];
        if (v && v.length && !v.includes((c as Record<string, unknown>)[g.key] as string)) return false;
      }
      return true;
    });
  }, [search, values]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    const selectable = filtered.filter((c) => !alreadyAssigned.has(c.id)).map((c) => c.id);
    setSelected((prev) => (prev.size === selectable.length ? new Set() : new Set(selectable)));
  }

  const columns: Column<Collector>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "country", header: "Country", render: (c) => c.country },
    { key: "language", header: "Language", render: (c) => c.language },
    {
      key: "state",
      header: "State",
      render: (c) =>
        alreadyAssigned.has(c.id) ? (
          <Badge tone="muted">Already assigned</Badge>
        ) : (
          <StatusBadge status={c.status} />
        ),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign collectors to this module"
      size="lg"
      footer={
        <>
          <button className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            className={btnPrimary}
            disabled={selected.size === 0}
            onClick={() => {
              onAssign(Array.from(selected));
              setSelected(new Set());
            }}
          >
            Assign {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </>
      }
    >
      <div className="flex gap-5">
        <FilterPanel
          groups={groups}
          values={values}
          onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
          search={search}
          onSearchChange={setSearch}
          onClear={() => {
            setValues({});
            setSearch("");
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-xs text-muted-foreground">
            {filtered.length} matching · {selected.size} selected
          </p>
          <DataTable
            columns={columns}
            rows={filtered}
            selectable
            selectedIds={selected}
            onToggleRow={(id) => {
              if (alreadyAssigned.has(id)) return;
              toggleRow(id);
            }}
            onToggleAll={toggleAll}
            rowClassName={(c) => (alreadyAssigned.has(c.id) ? "opacity-60" : "")}
            empty={<EmptyState title="No collectors match these filters" />}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Messaging (project-scoped) ---------------- */
function MessagingTab({ project }: { project: Project }) {
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
