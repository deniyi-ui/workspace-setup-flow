import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { loadOnboarding } from "../lib/onboarding";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <IconGrid /> },
  { to: "/dashboard/projects", label: "Projects", icon: <IconFolder /> },
  { to: "/dashboard/collectors", label: "Data Collectors", icon: <IconUsers /> },
  { to: "/dashboard/messaging", label: "Messaging", icon: <IconMessage /> },
  { to: "/dashboard/reports", label: "Reports", icon: <IconChart /> },
  { to: "/dashboard/integrations", label: "Integrations", icon: <IconPlug /> },
  { to: "/dashboard/automation", label: "Automation", icon: <IconBolt /> },
  { to: "/dashboard/administration", label: "Administration", icon: <IconShield /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    const d = loadOnboarding();
    setOrgName(d.orgName || "Relief HQ");
    setEmail(d.email || "admin@relief-hq.org");
  }, []);

  function isActive(to: string) {
    if (to === "/dashboard") return pathname === "/dashboard";
    return pathname === to || pathname.startsWith(to + "/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-5">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            FieldWorkz OS
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    isActive(item.to)
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-current">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {(email[0] ?? "A").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{orgName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* --- inline icons (kept small; no external icon dependency) --- */
function IconGrid() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4a1 1 0 011-1h3.5l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 4.5a2.2 2.2 0 010 4.2M14 12c-.2-1.6-1.4-2.8-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 3.5h11v8h-6L4 14v-2.5H2.5v-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 13V7M8 13V4M13 13v-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IconPlug() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2v3M10 2v3M4.5 5h7v3a3.5 3.5 0 01-7 0V5zM8 11.5V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2l5 2v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 1L3 9h4l-1 6 6-8H8l1-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
