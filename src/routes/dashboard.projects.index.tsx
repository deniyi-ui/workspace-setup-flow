import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { projects, integrations } from "../lib/mock-data";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "../lib/onboarding";
import {
  DataTable,
  EmptyState,
  Modal,
  PageHeader,
  StatusBadge,
  type Column,
} from "../components/ui-kit";
import type { Project } from "../lib/mock-data";

export const Route = createFileRoute("/dashboard/projects/")({
  head: () => ({ meta: [{ title: "Projects — FieldWorkz OS" }] }),
  component: ProjectsList,
});

function ProjectsList() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [form, setForm] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [created, setCreated] = useState<string[]>([]);

  const rows = [
    ...projects,
    ...created.map<Project>((n, i) => ({
      id: `new-${i}`,
      name: n,
      status: "draft",
      platform: null,
      formName: "",
      startDate: "",
      endDate: "",
      collectorIds: [],
      submissions: [],
      training: [],
      messages: [],
      targetSubmissions: 0,
      budget: 0,
      costPerSubmission: 0,
    })),
  ];

  function submit() {
    if (!name.trim()) return;
    setCreated((c) => [...c, name.trim()]);
    setName(""); setPlatform(""); setForm(""); setStart(""); setEnd("");
    setOpen(false);
  }

  const columns: Column<Project>[] = [
    {
      key: "name",
      header: "Project",
      render: (p) => (
        <Link
          to="/dashboard/projects/$id"
          params={{ id: p.id }}
          className="font-medium text-foreground hover:underline"
        >
          {p.name}
        </Link>
      ),
    },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "integration",
      header: "Integration",
      render: (p) =>
        p.platform ? (
          <span className="text-sm text-foreground">
            {integrations.find((i) => i.id === p.platform)?.name}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: "collectors",
      header: "Collectors",
      render: (p) => <span className="tabular-nums">{p.collectorIds.length}</span>,
    },
    {
      key: "subs",
      header: "Submissions",
      render: (p) => <span className="tabular-nums">{p.submissions.length}</span>,
    },
    {
      key: "dates",
      header: "Date range",
      render: (p) =>
        p.startDate ? (
          <span className="text-sm text-muted-foreground">
            {p.startDate} → {p.endDate}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        description="All data collection operations across your organization."
        action={
          <button className={btnPrimary} onClick={() => setOpen(true)}>
            New project
          </button>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        empty={
          <EmptyState
            title="No projects yet"
            description="Create your first project to link a form and assign collectors."
            action={<button className={btnPrimary} onClick={() => setOpen(true)}>Create project</button>}
          />
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New project"
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>Cancel</button>
            <button className={btnPrimary} onClick={submit} disabled={!name.trim()}>
              Create project
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="p-name">Project name</label>
            <input id="p-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Household survey — Q3 baseline" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="p-plat">Integration</label>
              <select id="p-plat" className={inputCls} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="">Select platform</option>
                {integrations.filter((i) => i.status === "connected").map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="p-form">Form</label>
              <select id="p-form" className={inputCls} value={form} onChange={(e) => setForm(e.target.value)} disabled={!platform}>
                <option value="">Select form</option>
                <option value="a">household_baseline_v1</option>
                <option value="b">wash_endline_v2</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="p-start">Start date</label>
              <input id="p-start" type="date" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-end">End date</label>
              <input id="p-end" type="date" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            You can assign collectors and upload training modules after the project is created.
          </p>
        </div>
      </Modal>
    </>
  );
}
