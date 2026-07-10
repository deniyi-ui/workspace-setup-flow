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

const industries = [
  { value: "research-me", label: "Research / M&E" },
  { value: "public-health", label: "Public health" },
  { value: "agriculture", label: "Agriculture & food security" },
  { value: "education", label: "Education" },
  { value: "livelihoods", label: "Livelihoods & economic development" },
  { value: "governance", label: "Governance & civic" },
  { value: "humanitarian", label: "Humanitarian response" },
  { value: "climate", label: "Climate & environment" },
  { value: "other", label: "Other" },
];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v: string) {
  // Loose international format check
  return /^[+\d][\d\s()-]{6,}$/.test(v.trim());
}

function ProfileStep() {
  const navigate = useNavigate();

  // Organization
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  // Contact
  const [contactName, setContactName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const emailValid = isValidEmail(email);
  const phoneValid = isValidPhone(contactPhone);

  const orgValid =
    orgName.trim().length > 0 &&
    orgType !== "" &&
    industry !== "" &&
    country.trim().length > 0 &&
    city.trim().length > 0;

  const contactValid =
    contactName.trim().length > 0 &&
    role.trim().length > 0 &&
    emailValid &&
    phoneValid;

  const valid = orgValid && contactValid;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    saveOnboarding({
      orgName: orgName.trim(),
      orgType,
      industry,
      country: country.trim(),
      city: city.trim(),
      contactName: contactName.trim(),
      role: role.trim(),
      email: email.trim(),
      contactPhone: contactPhone.trim(),
    });
    navigate({ to: "/onboarding/connect" });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Create your organization
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us about the organization and who we should contact. This sets up
        your workspace — everything else can wait.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-10" noValidate>
        {/* Group A — Organization profile */}
        <section>
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Organization profile
            </h2>
            <span className="text-xs text-muted-foreground">The entity</span>
          </div>

          <div className="mt-6 space-y-6">
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

            <div className="grid gap-6 sm:grid-cols-2">
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
                <label htmlFor="industry" className={labelCls}>
                  Industry
                </label>
                <select
                  id="industry"
                  className={inputCls}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="" disabled>
                    Select an industry
                  </option>
                  {industries.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="country" className={labelCls}>
                  Country
                </label>
                <input
                  id="country"
                  className={inputCls}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Kenya"
                  autoComplete="country-name"
                />
              </div>
              <div>
                <label htmlFor="city" className={labelCls}>
                  City
                </label>
                <input
                  id="city"
                  className={inputCls}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nairobi"
                  autoComplete="address-level2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Group B — Primary contact */}
        <section>
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Primary contact
            </h2>
            <span className="text-xs text-muted-foreground">The person</span>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className={labelCls}>
                  Full name
                </label>
                <input
                  id="contact-name"
                  className={inputCls}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Amina Otieno"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="role" className={labelCls}>
                  Role / title
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
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelCls}>
                  Contact email
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
              <div>
                <label htmlFor="phone" className={labelCls}>
                  Contact phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={inputCls}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="+254 700 000 000"
                  autoComplete="tel"
                />
                {phoneTouched && contactPhone.length > 0 && !phoneValid && (
                  <p className="mt-1.5 text-xs text-destructive">
                    Enter a valid phone number
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="pt-2">
          <button type="submit" className={btnPrimary} disabled={!valid}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
