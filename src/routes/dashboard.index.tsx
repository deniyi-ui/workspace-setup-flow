import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadOnboarding, saveOnboarding, platforms, type OnboardingData } from "../lib/onboarding";
import { collectors, projects, integrations } from "../lib/mock-data";
import { PageHeader, StatCard, StatusBadge, EmptyState } from "../components/ui-kit";
import { btnPrimary } from "../lib/onboarding";

export const Route = createFileRoute("/dashboard/")({
  validateSearch: (s: Record<string, unknown>) => ({
    create: s.create === true || s.create === "true" ? true : undefined,
  }),
  head: () => ({ meta: [{ title: "Dashboard — FieldWorkz OS" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const [data, setData] = useState<OnboardingData | null>(null);
  useEffect(() => setData(loadOnboarding()), []);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const activeCollectors = collectors.filter((c) => c.status === "active").length;
  const flagged = projects.flatMap((p) => p.submissions).filter((s) => s.status === "flagged").length;
  const totalSubs = projects.flatMap((p) => p.submissions).length;

  const brokenIntegration = integrations.find((i) => i.status === "error");
  const showBanner = data !== null && !data.connectedPlatform && !data.bannerDismissed;

  function dismissBanner() {
    setData(saveOnboarding({ bannerDismissed: true }));
  }

  const connectedName = data?.connectedPlatform
    ? platforms.find((p) => p.id === data.connectedPlatform)?.name
    : null;

  return (
    <>
      {showBanner && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-border bg-accent px-4 py-2.5">
          <p className="text-sm text-accent-foreground">
            No survey platform connected yet — submissions won't sync until you connect one.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/dashboard/integrations"
              className="text-sm font-medium text-accent-foreground underline underline-offset-2 hover:opacity-80"
            >
              Connect a platform
            </Link>
            <button
              onClick={dismissBanner}
              aria-label="Dismiss"
              className="rounded p-1 text-accent-foreground/70 hover:text-accent-foreground"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {brokenIntegration && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <p className="text-sm text-amber-900">
            {brokenIntegration.name} connection error — {brokenIntegration.errorMessage}
          </p>
          <Link
            to="/dashboard/integrations"
            className="text-sm font-medium text-amber-900 underline underline-offset-2"
          >
            Reconnect
          </Link>
        </div>
      )}

      <PageHeader
        title="Dashboard"
        description="Operational summary across your organization."
        action={
          <Link to="/dashboard/projects" className={btnPrimary}>
            New project
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={activeProjects} />
        <StatCard label="Active collectors" value={activeCollectors} />
        <StatCard label="Submissions" value={totalSubs} hint="Across all projects" />
        <StatCard label="Flagged" value={flagged} hint="Awaiting review" />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Active projects</h2>
          <Link to="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        {projects.filter((p) => p.status === "active").length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No projects yet"
              description="Create your first project to link a form, assign collectors, and start reviewing submissions."
              action={<Link to="/dashboard/projects" className={btnPrimary}>Create project</Link>}
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {projects
              .filter((p) => p.status === "active")
              .map((p) => (
                <Link
                  key={p.id}
                  to="/dashboard/projects/$id"
                  params={{ id: p.id }}
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.collectorIds.length} collectors · {p.submissions.length} submissions ·
                    {" "}
                    {p.submissions.filter((s) => s.status === "flagged").length} flagged
                  </p>
                </Link>
              ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-foreground">Integrations</h2>
        <div className="mt-3 rounded-lg border border-border bg-card p-4">
          {connectedName || integrations.some((i) => i.status === "connected") ? (
            <ul className="space-y-2 text-sm">
              {integrations.map((i) => (
                <li key={i.id} className="flex items-center justify-between">
                  <span className="text-foreground">{i.name}</span>
                  <StatusBadge status={i.status === "not_connected" ? "not connected" : i.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No survey platform connected</p>
              <Link to="/dashboard/integrations" className="text-sm font-medium text-accent-foreground">
                Connect
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
