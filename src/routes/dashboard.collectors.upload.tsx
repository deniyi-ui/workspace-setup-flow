import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "../lib/onboarding";
import { Badge, PageHeader } from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/collectors/upload")({
  head: () => ({ meta: [{ title: "Bulk upload collectors — FieldWorkz OS" }] }),
  component: BulkUpload,
});

type Step = "upload" | "map" | "validating" | "preview" | "done";

const sampleRows = [
  { name: "Amelia Okoro", email: "amelia.o@fieldwork.ng", country: "Nigeria", language: "Igbo", phone: "+234 803 111 8827" },
  { name: "Michael Njoroge", email: "m.njoroge@fieldwork.ke", country: "Kenya", language: "Swahili", phone: "+254 722 883 004" },
  { name: "Sara Ahmed", email: "", country: "Egypt", language: "Arabic", phone: "+20 100 887 2211" },
  { name: "Kelechi Umeh", email: "k.umeh@fieldwork.ng", country: "Nigeria", language: "Igbo", phone: "" },
  { name: "Mercy Wanjiku", email: "mercy.w@fieldwork.ke", country: "Kenya", language: "Swahili", phone: "+254 733 502 118" },
];

const targetFields = ["Name", "Email", "Country", "Language", "Phone"];

function BulkUpload() {
  const [step, setStep] = useState<Step>("upload");
  const [mapping, setMapping] = useState<Record<string, string>>({
    Name: "name", Email: "email", Country: "country", Language: "language", Phone: "phone",
  });

  function startValidation() {
    setStep("validating");
    setTimeout(() => setStep("preview"), 1200);
  }

  const validRows = sampleRows.filter((r) => r.email);
  const invalidRows = sampleRows.filter((r) => !r.email);
  const stepOrder: Record<string, number> = { upload: 0, map: 1, validating: 2, preview: 2, done: 3 };

  return (
    <>
      <div className="mb-2">
        <Link to="/dashboard/collectors" className="text-xs text-muted-foreground hover:text-foreground">
          ← Collectors
        </Link>
      </div>
      <PageHeader title="Bulk upload collectors" description="Import a spreadsheet of collectors into your organization." />

      <ol className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        {[["upload", "1. Upload"], ["map", "2. Map columns"], ["preview", "3. Preview and confirm"]].map(
          ([id, label], i) => (
            <li key={id} className={stepOrder[step] >= i ? "font-medium text-foreground" : ""}>
              {label}
              {i < 2 && <span className="mx-2 text-border">·</span>}
            </li>
          ),
        )}
      </ol>

      {step === "upload" && (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">Drop a CSV or XLSX file</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Or select from your device. First row should be column headers.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button className={btnSecondary}>Download template</button>
            <button className={btnPrimary} onClick={() => setStep("map")}>Choose file</button>
          </div>
        </div>
      )}

      {step === "map" && (
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">Map spreadsheet columns to collector fields</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {targetFields.map((f) => (
              <div key={f}>
                <label className={labelCls}>{f}</label>
                <select
                  className={inputCls}
                  value={mapping[f] ?? ""}
                  onChange={(e) => setMapping((prev) => ({ ...prev, [f]: e.target.value }))}
                >
                  <option value="">Skip this field</option>
                  {["name", "email", "country", "language", "phone", "region", "notes"].map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnSecondary} onClick={() => setStep("upload")}>Back</button>
            <button className={btnPrimary} onClick={startValidation}>Validate rows</button>
          </div>
        </div>
      )}

      {step === "validating" && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-6">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-foreground">Validating {sampleRows.length} rows…</p>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              <Badge tone="success">{validRows.length} valid</Badge>
              <Badge tone="warning">{invalidRows.length} needs attention</Badge>
            </div>
            <button className={btnPrimary} onClick={() => setStep("done")}>
              Confirm import ({validRows.length})
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5">Row</th>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Country</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((r, i) => {
                  const invalid = !r.email;
                  return (
                    <tr key={i} className={`border-b border-border last:border-0 ${invalid ? "bg-red-50/60" : ""}`}>
                      <td className="px-4 py-2.5 text-muted-foreground">{i + 2}</td>
                      <td className="px-4 py-2.5 text-foreground">{r.name}</td>
                      <td className="px-4 py-2.5">
                        {r.email ? r.email : <span className="text-red-700">Missing email</span>}
                      </td>
                      <td className="px-4 py-2.5">{r.country}</td>
                      <td className="px-4 py-2.5">{r.phone || <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-2.5">
                        {invalid ? <Badge tone="warning">Skip</Badge> : <Badge tone="success">Ready</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-foreground">Imported {validRows.length} collectors</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {invalidRows.length} rows were skipped due to missing emails.
          </p>
          <div className="mt-5">
            <Link to="/dashboard/collectors" className={btnPrimary}>Back to directory</Link>
          </div>
        </div>
      )}
      {/* mapping state referenced to satisfy noUnusedLocals-style lints if any */}
      <span className="hidden">{JSON.stringify(mapping).length}</span>
    </>
  );
}
