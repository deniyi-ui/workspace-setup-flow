import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  btnPrimary,
  inputCls,
  loadOnboarding,
  platforms,
  saveOnboarding,
  type OnboardingData,
} from "../lib/onboarding";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>) => ({
    create: search.create === true || search.create === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Dashboard — FieldWorkz OS" },
      {
        name: "description",
        content: "Manage field data collection operations across your organization.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { create } = Route.useSearch();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [projectName, setProjectName] = useState("");
  const [createdProject, setCreatedProject] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setData(loadOnboarding());
    if (create) setShowCreate(true);
  }, [create]);

  const connectedName = data?.connectedPlatform
    ? platforms.find((p) => p.id === data.connectedPlatform)?.name
    : null;
  const showBanner = data !== null && !data.connectedPlatform && !data.bannerDismissed;

  function dismissBanner() {
    setData(saveOnboarding({ bannerDismissed: true }));
  }

  function createProject(e: FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) return;
    setCreatedProject(projectName.trim());
    setProjectName("");
    setShowCreate(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              FieldWorkz OS
            </span>
            {data?.orgName && (
              <>
                <span className="text-border">/</span>
                <span className="text-sm text-muted-foreground">{data.orgName}</span>
              </>
            )}
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            {(data?.email?.[0] ?? "A").toUpperCase()}
          </span>
        </div>
      </header>

      {showBanner && (
        <div className="border-b border-border bg-accent">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-2.5">
            <p className="text-sm text-accent-foreground">
              No survey platform connected yet — submissions won't sync until you
              connect one.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/onboarding/connect"
                className="text-sm font-medium text-accent-foreground underline underline-offset-2 hover:opacity-80"
              >
                Connect a platform
              </Link>
              <button
                onClick={dismissBanner}
                aria-label="Dismiss"
                className="rounded p-1 text-accent-foreground/70 transition-colors hover:text-accent-foreground"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <button className={btnPrimary} onClick={() => setShowCreate(true)}>
            New project
          </button>
        </div>

        {showCreate && (
          <form
            onSubmit={createProject}
            className="mt-6 flex items-end gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex-1">
              <label htmlFor="project-name" className="block text-sm font-medium text-foreground">
                Project name
              </label>
              <input
                id="project-name"
                className={inputCls}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Household survey — Q3 baseline"
                autoFocus
              />
            </div>
            <button type="submit" className={btnPrimary} disabled={!projectName.trim()}>
              Create project
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Projects" value={createdProject ? "1" : "0"} />
          <StatCard label="Data collectors" value="0" />
          <StatCard label="Submissions this week" value="0" />
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-foreground">Projects</h2>
          {createdProject ? (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{createdProject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  No forms linked · 0 collectors · created just now
                </p>
              </div>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                Draft
              </span>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No projects yet. Create one when you're ready — there's no rush.
              </p>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-foreground">Integrations</h2>
          <div className="mt-3 rounded-lg border border-border bg-card p-4">
            {connectedName ? (
              <p className="text-sm text-foreground">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                {connectedName} connected
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  No survey platform connected
                </p>
                <Link
                  to="/onboarding/connect"
                  className="text-sm font-medium text-accent-foreground hover:opacity-80"
                >
                  Connect
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
