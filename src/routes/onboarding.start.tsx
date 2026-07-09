import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadOnboarding } from "../lib/onboarding";

export const Route = createFileRoute("/onboarding/start")({
  head: () => ({
    meta: [
      { title: "Your workspace is ready — FieldWorkz OS" },
      {
        name: "description",
        content: "Create your first project or explore the FieldWorkz OS dashboard.",
      },
    ],
  }),
  component: StartStep,
});

function StartStep() {
  const [orgName, setOrgName] = useState("");
  useEffect(() => {
    setOrgName(loadOnboarding().orgName);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {orgName ? `${orgName} is set up` : "Your workspace is ready"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No data collectors or projects are required to look around.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard"
          search={{ create: true }}
          className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <p className="text-sm font-semibold text-foreground">
            Create your first project
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Set up a data collection operation with forms, teams, and quality checks.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-foreground">
            Start a project
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10m0 0L9 4m4 4l-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <p className="text-sm font-semibold text-foreground">
            Explore the dashboard first
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            See how projects, submissions, and quality flags fit together before
            committing to anything.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
            Take a look
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10m0 0L9 4m4 4l-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
