import type { ReactNode } from "react";
import type { BadgeTone } from "../lib/mock-data";

// ---------- Badge ----------
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  const styles: Record<BadgeTone, string> = {
    neutral: "bg-secondary text-secondary-foreground",
    success: "bg-success-subtle text-accent-foreground",
    warning: "bg-amber-100 text-amber-800",
    muted: "bg-muted text-muted-foreground",
    danger: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

// Maps common status strings to badge tones.
export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let tone: BadgeTone = "neutral";
  if (["active", "approved", "connected", "sent", "delivered", "accepted"].includes(s)) tone = "success";
  else if (["flagged", "error", "failed"].includes(s)) tone = "warning";
  else if (["inactive", "completed"].includes(s)) tone = "muted";
  else if (["draft", "pending", "invited", "not_connected", "not connected"].includes(s)) tone = "neutral";
  const label = s === "not_connected" ? "Not connected" : status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge tone={tone}>{label}</Badge>;
}

// ---------- Page header ----------
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ---------- Stat card ----------
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ---------- DataTable ----------
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  rowClassName,
  onRowClick,
  empty,
  selectable,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: {
  columns: Column<T>[];
  rows: T[];
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
}) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }
  const allSelected =
    selectable && rows.length > 0 && rows.every((r) => selectedIds?.has(r.id));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected ?? false}
                    onChange={onToggleAll}
                    aria-label="Select all"
                    className="h-4 w-4 rounded border-input"
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground ${c.className ?? ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border last:border-0 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-muted/40" : ""
                } ${rowClassName?.(row) ?? ""}`}
              >
                {selectable && (
                  <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(row.id) ?? false}
                      onChange={() => onToggleRow?.(row.id)}
                      aria-label="Select row"
                      className="h-4 w-4 rounded border-input"
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-foreground ${c.className ?? ""}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- FilterPanel ----------
export interface FilterGroup {
  key: string;
  label: string;
  options: string[];
}
export function FilterPanel({
  groups,
  values,
  onChange,
  search,
  onSearchChange,
  onClear,
}: {
  groups: FilterGroup[];
  values: Record<string, string[]>;
  onChange: (key: string, next: string[]) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onClear: () => void;
}) {
  function toggle(key: string, opt: string) {
    const cur = values[key] ?? [];
    onChange(key, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  }
  const hasAny =
    Object.values(values).some((v) => v.length > 0) || search.trim().length > 0;

  return (
    <aside className="w-64 shrink-0 space-y-5 rounded-lg border border-border bg-card p-4">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Search
        </label>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name or email"
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {groups.map((g) => (
        <div key={g.key}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {g.label}
          </p>
          <div className="mt-2 space-y-1.5">
            {g.options.map((opt) => {
              const checked = (values[g.key] ?? []).includes(opt);
              return (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(g.key, opt)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="capitalize">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {hasAny && (
        <button
          onClick={onClear}
          className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}

// ---------- EmptyState ----------
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

// ---------- Modal ----------
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const width = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-6">
      <div className={`mt-16 w-full ${width} rounded-lg border border-border bg-card shadow-lg`}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Tabs ----------
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-6">
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition-colors ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {typeof t.count === "number" && (
                <span
                  className={`ml-2 rounded-md px-1.5 py-0.5 text-xs ${
                    active ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
