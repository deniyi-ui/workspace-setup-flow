import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { projects, collectors } from "../lib/mock-data";
import { PageHeader, StatCard } from "../components/ui-kit";
import { inputCls } from "../lib/onboarding";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({ meta: [{ title: "Reports — FieldWorkz OS" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-07-11");

  const active = projects.filter((p) => p.status === "active").length;
  const allSubs = projects.flatMap((p) => p.submissions);
  const flagged = allSubs.filter((s) => s.status === "flagged").length;
  const flagRate = allSubs.length === 0 ? 0 : Math.round((flagged / allSubs.length) * 100);

  const byProject = projects
    .filter((p) => p.submissions.length > 0)
    .map((p) => ({
      name: p.name,
      subs: p.submissions.length,
      flagged: p.submissions.filter((s) => s.status === "flagged").length,
      completion: Math.min(100, Math.round((p.submissions.length / 40) * 100)),
    }));

  const maxSubs = Math.max(1, ...byProject.map((r) => r.subs));

  return (
    <>
      <PageHeader
        title="Reports"
        description="Cross-project view of how your organization is performing."
        action={
          <div className="flex items-center gap-2 text-sm">
            <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="text-muted-foreground">to</span>
            <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={active} />
        <StatCard label="Total collectors" value={collectors.length} />
        <StatCard label="Submissions" value={allSubs.length} hint="In selected period" />
        <StatCard label="Flag rate" value={`${flagRate}%`} hint={`${flagged} of ${allSubs.length}`} />
      </div>

      <section className="mt-8 rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Submissions by project</p>
        <ul className="mt-4 space-y-3">
          {byProject.map((r) => (
            <li key={r.name} className="text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span className="text-foreground">{r.name}</span>
                <span className="tabular-nums">{r.subs} subs · {r.flagged} flagged</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${(r.subs / maxSubs) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Flag rate by project</p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2">Project</th>
              <th className="py-2 text-right">Submissions</th>
              <th className="py-2 text-right">Flagged</th>
              <th className="py-2 text-right">Flag rate</th>
              <th className="py-2 text-right">Completion</th>
            </tr>
          </thead>
          <tbody>
            {byProject.map((r) => (
              <tr key={r.name} className="border-t border-border">
                <td className="py-2 text-foreground">{r.name}</td>
                <td className="py-2 text-right tabular-nums">{r.subs}</td>
                <td className="py-2 text-right tabular-nums">{r.flagged}</td>
                <td className="py-2 text-right tabular-nums">
                  {r.subs === 0 ? "—" : `${Math.round((r.flagged / r.subs) * 100)}%`}
                </td>
                <td className="py-2 text-right tabular-nums">{r.completion}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
