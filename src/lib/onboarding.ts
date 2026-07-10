export type PlatformId = "surveycto" | "kobo" | "odk";

export interface OnboardingData {
  // Organization profile
  orgName: string;
  orgType: string;
  industry: string;
  country: string;
  city: string;
  // Primary contact
  contactName: string;
  role: string;
  email: string;
  contactPhone: string;
  // Rest
  connectedPlatform: PlatformId | null;
  invitesSent: number;
  bannerDismissed: boolean;
}

export const onboardingDefaults: OnboardingData = {
  orgName: "",
  orgType: "",
  industry: "",
  country: "",
  city: "",
  contactName: "",
  role: "",
  email: "",
  contactPhone: "",
  connectedPlatform: null,
  invitesSent: 0,
  bannerDismissed: false,
};

const KEY = "fieldworkz.onboarding";

/** Client-only. Call from event handlers or useEffect. */
export function loadOnboarding(): OnboardingData {
  if (typeof window === "undefined") return onboardingDefaults;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return onboardingDefaults;
    return { ...onboardingDefaults, ...JSON.parse(raw) };
  } catch {
    return onboardingDefaults;
  }
}

export function saveOnboarding(patch: Partial<OnboardingData>): OnboardingData {
  const next = { ...loadOnboarding(), ...patch };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  return next;
}

export const platforms: {
  id: PlatformId;
  name: string;
  mark: string;
  detail: string;
}[] = [
  {
    id: "surveycto",
    name: "SurveyCTO",
    mark: "SC",
    detail: "Server URL and API access",
  },
  {
    id: "kobo",
    name: "Kobo Toolbox",
    mark: "KT",
    detail: "Account and project access",
  },
  {
    id: "odk",
    name: "ODK Central",
    mark: "OC",
    detail: "Server URL and app user access",
  },
];

/* Shared class strings for the flat form language */
export const labelCls = "block text-sm font-medium text-foreground";
export const inputCls =
  "mt-1.5 block w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";
export const btnGhost =
  "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
