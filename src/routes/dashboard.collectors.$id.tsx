import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollector, projects, type Collector } from "../lib/mock-data";
import { PageHeader, StatusBadge, StatCard, Badge } from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/collectors/$id")({
  head: () => ({ meta: [{ title: "Collector — FieldWorkz OS" }] }),
  loader: ({ params }): { collector: Collector } => {
    const collector = getCollector(params.id);
    if (!collector) throw notFound();
    return { collector };
  },
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <p className="text-sm text-muted-foreground">Collector not found.</p>
      <Link to="/dashboard/collectors" className="mt-3 inline-block text-sm font-medium text-accent-foreground">
        Back to collectors
      </Link>
    </div>
  ),
  component: CollectorDetail,
});

function CollectorDetail() {
  const { collector } = Route.useLoaderData() as { collector: Collector };
  const assignments = projects.filter((p) => p.collectorIds.includes(collector.id));
  const subs = projects.flatMap((p) => p.submissions.filter((s) => s.collectorId === collector.id));
  const flagged = subs.filter((s) => s.status === "flagged").length;
  const approved = subs.filter((s) => s.status === "approved").length;

  return (
    <>
      <div className="mb-2">
        <Link to="/dashboard/collectors" className="text-xs text-muted-foreground hover:text-foreground">
          ← Collectors
        </Link>
      </div>
      <PageHeader title={collector.name} action={<StatusBadge status={collector.status} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
          <p className="text-sm font-medium text-foreground">Contact</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Email" value={collector.email} />
            <Row label="Phone" value={collector.phone} />
            <Row label="Joined" value={collector.joinedOn} />
          </dl>
          <p className="mt-6 text-sm font-medium text-foreground">Demographics</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Country" value={collector.country} />
            <Row label="Language" value={collector.language} />
            <Row label="Gender" value={collector.gender} />
            <Row label="Religion" value={collector.religion} />
            <Row label="Education" value={collector.education} />
          </dl>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Submissions" value={subs.length} />
            <StatCard label="Approved" value={approved} />
            <StatCard label="Flagged" value={flagged} />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground">Project assignments</p>
            {assignments.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Not assigned to any project.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {assignments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5">
                    <Link
                      to="/dashboard/projects/$id"
                      params={{ id: p.id }}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">
                        {p.submissions.filter((s) => s.collectorId === collector.id).length} subs
                      </Badge>
                      <StatusBadge status="assigned" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-foreground capitalize">{value}</dd>
    </div>
  );
}
