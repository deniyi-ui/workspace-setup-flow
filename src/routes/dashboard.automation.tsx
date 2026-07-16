import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge, PageHeader, EmptyState } from "../components/ui-kit";

export const Route = createFileRoute("/dashboard/automation")({
  head: () => ({ meta: [{ title: "Automation — FieldWorkz OS" }] }),
  component: AutomationPage,
});

type TriggerId =
  | "collector_inactive"
  | "submission_flagged"
  | "submission_clean"
  | "quota_reached"
  | "training_incomplete";

type ActionId =
  | "send_message"
  | "auto_approve"
  | "notify_admin"
  | "flag_qa";

type Channel = "SMS" | "Email" | "Push" | "In-app";

interface Automation {
  id: string;
  name: string;
  active: boolean;
  trigger: TriggerId;
  triggerDays?: number;
  action: ActionId;
  channel?: Channel;
  template?: string;
}

const TRIGGERS: { id: TriggerId; label: (n?: number) => string; needsDays: boolean }[] = [
  { id: "collector_inactive", label: (n) => `collector inactive for ${n ?? 0} days`, needsDays: true },
  { id: "submission_flagged", label: () => "submission received with a QA flag", needsDays: false },
  { id: "submission_clean", label: () => "submission received with no QA flags", needsDays: false },
  { id: "quota_reached", label: () => "project quota reached", needsDays: false },
  { id: "training_incomplete", label: (n) => `training not completed after ${n ?? 0} days`, needsDays: true },
];

const ACTIONS: { id: ActionId; label: string }[] = [
  { id: "send_message", label: "send message" },
  { id: "auto_approve", label: "approve submission automatically" },
  { id: "notify_admin", label: "notify admin" },
  { id: "flag_qa", label: "flag for QA review" },
];

const CHANNELS: Channel[] = ["SMS", "Email", "Push", "In-app"];

const seed: Automation[] = [
  {
    id: "a1",
    name: "Nudge inactive collectors",
    active: true,
    trigger: "collector_inactive",
    triggerDays: 3,
    action: "send_message",
    channel: "SMS",
    template: "Hi {{name}}, we haven't seen a submission from you in a few days. Please check in when you can.",
  },
  {
    id: "a2",
    name: "Auto-approve clean submissions",
    active: true,
    trigger: "submission_clean",
    action: "auto_approve",
  },
  {
    id: "a3",
    name: "Escalate flagged submissions",
    active: false,
    trigger: "submission_flagged",
    action: "notify_admin",
  },
  {
    id: "a4",
    name: "Training reminder",
    active: false,
    trigger: "training_incomplete",
    triggerDays: 7,
    action: "send_message",
    channel: "Email",
    template: "Reminder: please complete your onboarding training module by end of week.",
  },
];

function triggerPhrase(a: Pick<Automation, "trigger" | "triggerDays">) {
  const t = TRIGGERS.find((x) => x.id === a.trigger)!;
  return t.label(a.triggerDays);
}
function actionPhrase(a: Pick<Automation, "action" | "channel">) {
  const base = ACTIONS.find((x) => x.id === a.action)!.label;
  if (a.action === "send_message" && a.channel) return `${base} via ${a.channel}`;
  return base;
}

function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>(seed);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);

  const visible = showEmpty ? [] : automations;

  function toggleActive(id: string) {
    setAutomations((xs) => xs.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  }

  function startNew() {
    setEditing({
      id: `a${Date.now()}`,
      name: "",
      active: true,
      trigger: "collector_inactive",
      triggerDays: 3,
      action: "send_message",
      channel: "SMS",
      template: "",
    });
  }

  function save(a: Automation) {
    setAutomations((xs) => {
      const exists = xs.some((x) => x.id === a.id);
      return exists ? xs.map((x) => (x.id === a.id ? a : x)) : [...xs, a];
    });
    setEditing(null);
  }

  if (editing) {
    return (
      <RuleBuilder
        value={editing}
        onCancel={() => setEditing(null)}
        onSave={save}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Automation"
        description="Set up simple when-then rules that run without manual intervention."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmpty((v) => !v)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {showEmpty ? "Show automations" : "Preview empty state"}
            </button>
            <button
              onClick={startNew}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              + New automation
            </button>
          </div>
        }
      />

      {visible.length === 0 ? (
        <EmptyState
          title="No automations yet"
          description="Create a rule to auto-approve clean submissions, chase inactive collectors, or notify admins when something needs attention."
          action={
            <button
              onClick={() => {
                setShowEmpty(false);
                startNew();
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              + New automation
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((a) => (
            <AutomationCard
              key={a.id}
              automation={a}
              onToggle={() => toggleActive(a.id)}
              onEdit={() => setEditing(a)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AutomationCard({
  automation,
  onToggle,
  onEdit,
}: {
  automation: Automation;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="text-sm font-semibold text-foreground hover:underline underline-offset-2"
            >
              {automation.name}
            </button>
            <Badge tone={automation.active ? "success" : "muted"}>
              {automation.active ? "Active" : "Paused"}
            </Badge>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">When</span>
            <Pill>{triggerPhrase(automation)}</Pill>
            <ArrowIcon />
            <span className="text-muted-foreground">then</span>
            <Pill>{actionPhrase(automation)}</Pill>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Toggle checked={automation.active} onChange={onToggle} label={automation.active ? "Pause" : "Activate"} />
          <button
            onClick={onEdit}
            className="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function RuleBuilder({
  value,
  onCancel,
  onSave,
}: {
  value: Automation;
  onCancel: () => void;
  onSave: (a: Automation) => void;
}) {
  const [draft, setDraft] = useState<Automation>(value);
  const triggerNeedsDays = useMemo(
    () => TRIGGERS.find((t) => t.id === draft.trigger)?.needsDays,
    [draft.trigger],
  );
  const showMessageFields = draft.action === "send_message";
  const canSave = draft.name.trim().length > 0 && (!showMessageFields || (draft.channel && draft.template?.trim()));

  return (
    <>
      <PageHeader
        title={value.name ? "Edit automation" : "New automation"}
        description="Pick a trigger and an action. Rules run automatically as events happen."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              disabled={!canSave}
              onClick={() => onSave(draft)}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Save automation
            </button>
          </div>
        }
      />

      <div className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Automation name
          </label>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Nudge inactive collectors"
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* When */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            When
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <select
              value={draft.trigger}
              onChange={(e) => setDraft({ ...draft, trigger: e.target.value as TriggerId })}
              className="flex-1 min-w-[200px] bg-transparent text-sm text-foreground focus:outline-none"
            >
              {TRIGGERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.needsDays ? t.label(0).replace(/\b0\b/, "…") : t.label()}
                </option>
              ))}
            </select>
            {triggerNeedsDays && (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={draft.triggerDays ?? 0}
                  onChange={(e) =>
                    setDraft({ ...draft, triggerDays: Number(e.target.value) || 0 })
                  }
                  className="w-16 rounded-md border border-input bg-card px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Then */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Then
          </label>
          <div className="mt-1.5 rounded-md border border-input bg-background px-3 py-2">
            <select
              value={draft.action}
              onChange={(e) => setDraft({ ...draft, action: e.target.value as ActionId })}
              className="w-full bg-transparent text-sm text-foreground focus:outline-none"
            >
              {ACTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {showMessageFields && (
            <div className="mt-3 space-y-3 rounded-md border border-border bg-muted/30 p-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Channel</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {CHANNELS.map((c) => {
                    const active = draft.channel === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setDraft({ ...draft, channel: c })}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Message template
                </label>
                <textarea
                  value={draft.template ?? ""}
                  onChange={(e) => setDraft({ ...draft, template: e.target.value })}
                  rows={3}
                  placeholder="Hi {{name}}, ..."
                  className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use {"{{name}}"} to insert the collector's name.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-md border border-dashed border-border p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preview
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">When</span>
            <Pill>{triggerPhrase(draft)}</Pill>
            <ArrowIcon />
            <span className="text-muted-foreground">then</span>
            <Pill>{actionPhrase(draft)}</Pill>
          </div>
        </div>
      </div>
    </>
  );
}
