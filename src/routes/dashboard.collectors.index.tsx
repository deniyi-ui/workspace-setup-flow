import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  collectors as allCollectors,
  countryOptions,
  languageOptions,
  religionOptions,
  type Collector,
} from "../lib/mock-data";
import { btnPrimary, btnSecondary } from "../lib/onboarding";
import {
  DataTable,
  EmptyState,
  FilterPanel,
  PageHeader,
  StatusBadge,
  type Column,
  type FilterGroup,
} from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/collectors/")({
  head: () => ({ meta: [{ title: "Data collectors — FieldWorkz OS" }] }),
  component: CollectorsPage,
});

function CollectorsPage() {
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [invited, setInvited] = useState<Record<string, "pending" | "sent" | "accepted">>({});

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

  const columns: Column<Collector>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <Link
          to="/dashboard/collectors/$id"
          params={{ id: c.id }}
          className="font-medium text-foreground hover:underline"
        >
          {c.name}
        </Link>
      ),
    },
    { key: "email", header: "Email", render: (c) => <span className="text-muted-foreground">{c.email}</span> },
    { key: "country", header: "Country", render: (c) => c.country },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "invite",
      header: "Invite",
      render: (c) =>
        invited[c.id] ? <StatusBadge status={invited[c.id]} /> : <span className="text-muted-foreground">—</span>,
    },
    { key: "projects", header: "Projects", render: (c) => <span className="tabular-nums">{c.projectCount}</span> },
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
  function bulkInvite() {
    setInvited((prev) => {
      const next = { ...prev };
      selected.forEach((id) => { next[id] = "sent"; });
      return next;
    });
    setSelected(new Set());
  }

  return (
    <>
      <PageHeader
        title="Data collectors"
        description="Your organization's shared workforce, available to any project."
        action={
          <div className="flex gap-2">
            <Link to="/dashboard/collectors/upload" className={btnSecondary}>
              Bulk upload
            </Link>
            <button className={btnPrimary}>Invite collector</button>
          </div>
        }
      />

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
            <button className={btnPrimary} disabled={selected.size === 0} onClick={bulkInvite}>
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
            empty={
              allCollectors.length === 0 ? (
                <EmptyState
                  title="No collectors yet"
                  description="Bulk upload a spreadsheet of collectors or invite them one at a time."
                  action={
                    <Link to="/dashboard/collectors/upload" className={btnPrimary}>Bulk upload</Link>
                  }
                />
              ) : (
                <EmptyState title="No collectors match these filters" />
              )
            }
          />
        </div>
      </div>
    </>
  );
}
