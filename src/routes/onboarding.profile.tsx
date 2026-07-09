import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { btnPrimary, inputCls, labelCls, saveOnboarding } from "../lib/onboarding";

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({
    meta: [
      { title: "Create your organization — FieldWorkz OS" },
      {
        name: "description",
        content: "Set up your organization workspace on FieldWorkz OS.",
      },
    ],
  }),
  component: ProfileStep,
});

const orgTypes = [
  { value: "ngo", label: "NGO" },
  { value: "research-firm", label: "Research firm" },
  { value: "government-program", label: "Government program" },
  { value: "other", label: "Other" },
];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function ProfileStep() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = isValidEmail(email);
  const valid = orgName.trim().length > 0 && orgType !== "" && role.trim().length > 0 && emailValid;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    saveOnboarding({ orgName: orgName.trim(), orgType, role: role.trim(), email: email.trim() });
    navigate({ to: "/onboarding/connect" });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Create your organization
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This sets up your workspace. Everything else can wait.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6" noValidate>
        <div>
          <label htmlFor="org-name" className={labelCls}>
            Organization name
          </label>
          <input
            id="org-name"
            className={inputCls}
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. Horizon Research Group"
            autoComplete="organization"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="org-type" className={labelCls}>
            Organization type
          </label>
          <select
            id="org-type"
            className={inputCls}
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
          >
            <option value="" disabled>
              Select a type
            </option>
            {orgTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role" className={labelCls}>
            Your role
          </label>
          <input
            id="role"
            className={inputCls}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. M&E manager"
            autoComplete="organization-title"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Work email
          </label>
          <input
            id="email"
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="you@organization.org"
            autoComplete="email"
          />
          {emailTouched && email.length > 0 && !emailValid && (
            <p className="mt-1.5 text-xs text-destructive">
              Enter a valid work email
            </p>
          )}
        </div>

        <div className="pt-4">
          <button type="submit" className={btnPrimary} disabled={!valid}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
