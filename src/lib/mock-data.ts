// Mock data for the FieldWorkz OS demo. Client-only, in-memory + localStorage-backed
// where onboarding info is relevant. Everything below is illustrative.

import type { PlatformId } from "./onboarding";

export type BadgeTone = "neutral" | "success" | "warning" | "muted" | "danger";

export type AdminRole = "owner" | "admin" | "qc_reviewer" | "viewer";

export type AdminScope =
  | { type: "all" }
  | { type: "specific"; projectIds: string[] };

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  scope: AdminScope;
  addedOn: string;
  status: "active" | "invited";
}


export interface Collector {
  id: string;
  name: string;
  email: string;
  country: string;
  gender: "female" | "male" | "other";
  religion: string;
  education: "primary" | "secondary" | "tertiary";
  language: string;
  status: "active" | "invited" | "inactive";
  projectCount: number;
  phone: string;
  joinedOn: string;
}

export interface Submission {
  id: string;
  collectorId: string;
  collectorName: string;
  submittedAt: string;
  durationMin: number;
  gps: string;
  location: string;
  status: "pending" | "flagged" | "approved";
  flagReason?: string;
  responses: { question: string; answer: string }[];
  audit: { at: string; who: string; action: string }[];
}

export type MaterialType = "PDF" | "Video" | "Slide deck";

export interface TrainingMaterial {
  id: string;
  filename: string;
  type: MaterialType;
  uploadedOn: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export type MaterialsStatus = "not started" | "viewed";
export type AssessmentStatus = "not attempted" | "in progress" | "passed" | "failed";

export interface TrainingProgress {
  collectorId: string;
  materialsStatus: MaterialsStatus;
  assessmentStatus: AssessmentStatus;
  score: number | null;
  attemptsUsed: number;
  lastAttemptAt: string | null;
}

export interface TrainingModule {
  id: string;
  title: string;
  addedOn: string;
  passingScore: number;
  maxAttempts: number;
  materials: TrainingMaterial[];
  questions: AssessmentQuestion[];
  progress: TrainingProgress[];
}

export interface ProjectMessage {
  id: string;
  sentAt: string;
  channel: ("in-app" | "sms" | "email" | "push")[];
  recipients: number;
  preview: string;
  delivered: number;
  failed: number;
}

export interface Project {
  id: string;
  name: string;
  status: "active" | "draft" | "completed";
  platform: PlatformId | null;
  formName: string;
  startDate: string;
  endDate: string;
  collectorIds: string[];
  submissions: Submission[];
  training: TrainingModule[];
  messages: ProjectMessage[];
}

export interface Integration {
  id: PlatformId;
  name: string;
  mark: string;
  detail: string;
  status: "not_connected" | "connected" | "error";
  account?: string;
  projectsUsing: number;
  errorMessage?: string;
}

export const admins: Admin[] = [
  { id: "a1", name: "Amara Okonkwo", email: "amara@relief-hq.org", role: "owner", scope: { type: "all" }, addedOn: "2026-03-04", status: "active" },
  { id: "a2", name: "Daniel Weiss", email: "d.weiss@relief-hq.org", role: "admin", scope: { type: "all" }, addedOn: "2026-03-11", status: "active" },
  { id: "a3", name: "Priya Nair", email: "priya.n@relief-hq.org", role: "admin", scope: { type: "all" }, addedOn: "2026-04-02", status: "active" },
  { id: "a4", name: "Kwame Boateng", email: "k.boateng@relief-hq.org", role: "admin", scope: { type: "all" }, addedOn: "2026-06-19", status: "invited" },
  { id: "a5", name: "Leila Haddad", email: "l.haddad@wash-alliance.org", role: "qc_reviewer", scope: { type: "specific", projectIds: ["p1"] }, addedOn: "2026-05-14", status: "active" },
  { id: "a6", name: "Tom Reyes", email: "tom.r@relief-hq.org", role: "qc_reviewer", scope: { type: "all" }, addedOn: "2026-05-22", status: "active" },
  { id: "a7", name: "Sofia Marín", email: "sofia@fundacion-agua.org", role: "viewer", scope: { type: "specific", projectIds: ["p1"] }, addedOn: "2026-06-08", status: "active" },
  { id: "a8", name: "Henry Osei", email: "h.osei@donorfund.org", role: "viewer", scope: { type: "specific", projectIds: ["p2", "p4"] }, addedOn: "2026-06-25", status: "invited" },
];


export const collectors: Collector[] = [
  { id: "c1", name: "Aisha Bello", email: "aisha.bello@fieldwork.ng", country: "Nigeria", gender: "female", religion: "Muslim", education: "tertiary", language: "Hausa", status: "active", projectCount: 3, phone: "+234 803 555 1122", joinedOn: "2025-11-04" },
  { id: "c2", name: "Emmanuel Adeyemi", email: "e.adeyemi@fieldwork.ng", country: "Nigeria", gender: "male", religion: "Christian", education: "tertiary", language: "Yoruba", status: "active", projectCount: 2, phone: "+234 802 555 9931", joinedOn: "2025-11-04" },
  { id: "c3", name: "Grace Mwangi", email: "grace.m@fieldwork.ke", country: "Kenya", gender: "female", religion: "Christian", education: "secondary", language: "Swahili", status: "active", projectCount: 4, phone: "+254 722 501 883", joinedOn: "2025-09-22" },
  { id: "c4", name: "Peter Otieno", email: "peter.o@fieldwork.ke", country: "Kenya", gender: "male", religion: "Christian", education: "tertiary", language: "Swahili", status: "active", projectCount: 2, phone: "+254 733 208 664", joinedOn: "2025-10-01" },
  { id: "c5", name: "Fatima Diallo", email: "fatima.d@fieldwork.sn", country: "Senegal", gender: "female", religion: "Muslim", education: "secondary", language: "Wolof", status: "invited", projectCount: 0, phone: "+221 77 555 2018", joinedOn: "2026-06-30" },
  { id: "c6", name: "Ibrahim Toure", email: "i.toure@fieldwork.sn", country: "Senegal", gender: "male", religion: "Muslim", education: "tertiary", language: "Wolof", status: "active", projectCount: 1, phone: "+221 76 555 4402", joinedOn: "2026-02-18" },
  { id: "c7", name: "Ravi Kumar", email: "ravi.k@fieldwork.in", country: "India", gender: "male", religion: "Hindu", education: "tertiary", language: "Hindi", status: "active", projectCount: 3, phone: "+91 98450 22190", joinedOn: "2025-08-15" },
  { id: "c8", name: "Meera Iyer", email: "meera.i@fieldwork.in", country: "India", gender: "female", religion: "Hindu", education: "tertiary", language: "Tamil", status: "active", projectCount: 2, phone: "+91 98104 33217", joinedOn: "2025-09-11" },
  { id: "c9", name: "Nadia Hassan", email: "n.hassan@fieldwork.eg", country: "Egypt", gender: "female", religion: "Muslim", education: "tertiary", language: "Arabic", status: "inactive", projectCount: 0, phone: "+20 100 555 2211", joinedOn: "2025-06-04" },
  { id: "c10", name: "Joseph Banda", email: "j.banda@fieldwork.zm", country: "Zambia", gender: "male", religion: "Christian", education: "secondary", language: "Bemba", status: "active", projectCount: 2, phone: "+260 977 502 118", joinedOn: "2025-12-20" },
  { id: "c11", name: "Chipo Ncube", email: "chipo.n@fieldwork.zw", country: "Zimbabwe", gender: "female", religion: "Christian", education: "tertiary", language: "Shona", status: "active", projectCount: 1, phone: "+263 772 550 018", joinedOn: "2026-01-08" },
  { id: "c12", name: "Ahmed Farah", email: "a.farah@fieldwork.so", country: "Somalia", gender: "male", religion: "Muslim", education: "secondary", language: "Somali", status: "invited", projectCount: 0, phone: "+252 61 555 7712", joinedOn: "2026-06-30" },
];

const populatedSubs: Submission[] = [
  {
    id: "s1", collectorId: "c1", collectorName: "Aisha Bello",
    submittedAt: "2026-07-09 09:14", durationMin: 22, gps: "9.0765, 7.3986", location: "Abuja, NG",
    status: "approved",
    responses: [
      { question: "Household size", answer: "6" },
      { question: "Primary water source", answer: "Borehole" },
      { question: "Children under 5", answer: "2" },
    ],
    audit: [
      { at: "2026-07-09 09:14", who: "Aisha Bello", action: "Submitted" },
      { at: "2026-07-09 14:02", who: "Daniel Weiss", action: "Approved" },
    ],
  },
  {
    id: "s2", collectorId: "c3", collectorName: "Grace Mwangi",
    submittedAt: "2026-07-09 10:41", durationMin: 4, gps: "-1.2921, 36.8219", location: "Nairobi, KE",
    status: "flagged",
    flagReason: "Duration well below median (4 min vs 21 min). GPS matches previous submission.",
    responses: [
      { question: "Household size", answer: "4" },
      { question: "Primary water source", answer: "Piped" },
      { question: "Children under 5", answer: "1" },
    ],
    audit: [
      { at: "2026-07-09 10:41", who: "Grace Mwangi", action: "Submitted" },
      { at: "2026-07-09 10:42", who: "FieldWorkz QC", action: "Auto-flagged: short duration + GPS duplicate" },
    ],
  },
  {
    id: "s3", collectorId: "c2", collectorName: "Emmanuel Adeyemi",
    submittedAt: "2026-07-09 11:03", durationMin: 26, gps: "6.5244, 3.3792", location: "Lagos, NG",
    status: "pending",
    responses: [
      { question: "Household size", answer: "5" },
      { question: "Primary water source", answer: "Well" },
      { question: "Children under 5", answer: "1" },
    ],
    audit: [{ at: "2026-07-09 11:03", who: "Emmanuel Adeyemi", action: "Submitted" }],
  },
  {
    id: "s4", collectorId: "c7", collectorName: "Ravi Kumar",
    submittedAt: "2026-07-09 12:20", durationMin: 19, gps: "12.9716, 77.5946", location: "Bengaluru, IN",
    status: "pending",
    responses: [
      { question: "Household size", answer: "3" },
      { question: "Primary water source", answer: "Piped" },
      { question: "Children under 5", answer: "0" },
    ],
    audit: [{ at: "2026-07-09 12:20", who: "Ravi Kumar", action: "Submitted" }],
  },
  {
    id: "s5", collectorId: "c4", collectorName: "Peter Otieno",
    submittedAt: "2026-07-09 13:47", durationMin: 24, gps: "-0.0917, 34.7680", location: "Kisumu, KE",
    status: "approved",
    responses: [
      { question: "Household size", answer: "7" },
      { question: "Primary water source", answer: "River" },
      { question: "Children under 5", answer: "3" },
    ],
    audit: [
      { at: "2026-07-09 13:47", who: "Peter Otieno", action: "Submitted" },
      { at: "2026-07-09 16:15", who: "Priya Nair", action: "Approved" },
    ],
  },
  {
    id: "s6", collectorId: "c8", collectorName: "Meera Iyer",
    submittedAt: "2026-07-10 08:52", durationMin: 3, gps: "13.0827, 80.2707", location: "Chennai, IN",
    status: "flagged",
    flagReason: "Straight-lining detected: identical responses across 6 consecutive questions.",
    responses: [
      { question: "Household size", answer: "5" },
      { question: "Primary water source", answer: "Piped" },
      { question: "Children under 5", answer: "5" },
    ],
    audit: [
      { at: "2026-07-10 08:52", who: "Meera Iyer", action: "Submitted" },
      { at: "2026-07-10 08:53", who: "FieldWorkz QC", action: "Auto-flagged: response pattern anomaly" },
    ],
  },
];

export const projects: Project[] = [];
  {
    id: "p1",
    name: "WASH baseline — Nigeria & Kenya",
    status: "active",
    platform: "surveycto",
    formName: "wash_baseline_v3",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    collectorIds: ["c1", "c2", "c3", "c4", "c7", "c8", "c10"],
    submissions: populatedSubs,
    training: [
      {
        id: "t1",
        title: "Consent and refusal handling",
        addedOn: "2026-05-28",
        passingScore: 80,
        maxAttempts: 3,
        materials: [
          { id: "mat1", filename: "consent-protocol.pdf", type: "PDF", uploadedOn: "2026-05-28" },
          { id: "mat2", filename: "refusal-scenarios.mp4", type: "Video", uploadedOn: "2026-05-28" },
        ],
        questions: [
          {
            id: "q1",
            text: "If a respondent asks to stop mid-interview, what should you do?",
            options: [
              { id: "o1", text: "Continue anyway — the data is important" },
              { id: "o2", text: "Stop immediately and mark the submission as refused" },
              { id: "o3", text: "Offer them a small incentive to continue" },
              { id: "o4", text: "Skip the sensitive questions and continue" },
            ],
            correctOptionId: "o2",
          },
          {
            id: "q2",
            text: "Consent must be obtained before which step?",
            options: [
              { id: "o1", text: "Any recording or note-taking begins" },
              { id: "o2", text: "The GPS reading is taken" },
              { id: "o3", text: "Payment is processed" },
              { id: "o4", text: "The supervisor arrives" },
            ],
            correctOptionId: "o1",
          },
          {
            id: "q3",
            text: "A caregiver consents but the child refuses to be measured. You should:",
            options: [
              { id: "o1", text: "Measure the child anyway — the adult consented" },
              { id: "o2", text: "Respect the child's refusal and record it" },
              { id: "o3", text: "Ask the caregiver to convince the child" },
              { id: "o4", text: "Come back later without telling the child" },
            ],
            correctOptionId: "o2",
          },
          {
            id: "q4",
            text: "Which of these is NOT part of informed consent?",
            options: [
              { id: "o1", text: "Explaining the purpose of the study" },
              { id: "o2", text: "Stating that participation is voluntary" },
              { id: "o3", text: "Guaranteeing a specific outcome from the study" },
              { id: "o4", text: "Describing how data will be used" },
            ],
            correctOptionId: "o3",
          },
          {
            id: "q5",
            text: "If a respondent seems distressed, you should:",
            options: [
              { id: "o1", text: "Pause the interview and check in with them" },
              { id: "o2", text: "Speed up to finish quickly" },
              { id: "o3", text: "Ignore it — it's not your role" },
              { id: "o4", text: "Record their reaction as data" },
            ],
            correctOptionId: "o1",
          },
        ],
        progress: [
          { collectorId: "c1", materialsStatus: "viewed", assessmentStatus: "passed", score: 92, attemptsUsed: 1, lastAttemptAt: "2026-06-02 10:14" },
          { collectorId: "c2", materialsStatus: "viewed", assessmentStatus: "passed", score: 88, attemptsUsed: 1, lastAttemptAt: "2026-06-02 11:03" },
          { collectorId: "c3", materialsStatus: "viewed", assessmentStatus: "failed", score: 60, attemptsUsed: 2, lastAttemptAt: "2026-06-04 15:22" },
          { collectorId: "c4", materialsStatus: "viewed", assessmentStatus: "passed", score: 76, attemptsUsed: 1, lastAttemptAt: "2026-06-03 09:45" },
          { collectorId: "c7", materialsStatus: "viewed", assessmentStatus: "in progress", score: null, attemptsUsed: 1, lastAttemptAt: "2026-06-05 08:11" },
          { collectorId: "c8", materialsStatus: "viewed", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c10", materialsStatus: "not started", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
        ],
      },
      {
        id: "t2",
        title: "WASH questionnaire walkthrough",
        addedOn: "2026-05-30",
        passingScore: 80,
        maxAttempts: 3,
        materials: [
          { id: "mat3", filename: "wash-questionnaire-guide.pdf", type: "PDF", uploadedOn: "2026-05-30" },
        ],
        questions: [],
        progress: [
          { collectorId: "c1", materialsStatus: "viewed", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c2", materialsStatus: "viewed", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c3", materialsStatus: "viewed", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c4", materialsStatus: "viewed", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c7", materialsStatus: "not started", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c8", materialsStatus: "not started", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c10", materialsStatus: "not started", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
        ],
      },
      {
        id: "t3",
        title: "GPS + photo capture protocol",
        addedOn: "2026-06-02",
        passingScore: 75,
        maxAttempts: 2,
        materials: [
          { id: "mat4", filename: "gps-photo-protocol.pptx", type: "Slide deck", uploadedOn: "2026-06-02" },
        ],
        questions: [
          {
            id: "q1",
            text: "GPS readings should be taken:",
            options: [
              { id: "o1", text: "At the entrance to the dwelling, before starting" },
              { id: "o2", text: "Anywhere convenient during the interview" },
              { id: "o3", text: "Only if the respondent asks about it" },
              { id: "o4", text: "At the office after the visit" },
            ],
            correctOptionId: "o1",
          },
          {
            id: "q2",
            text: "If GPS accuracy is above 20m, you should:",
            options: [
              { id: "o1", text: "Submit anyway" },
              { id: "o2", text: "Wait and retake until accuracy is under 10m" },
              { id: "o3", text: "Skip GPS for this visit" },
              { id: "o4", text: "Type the coordinates manually" },
            ],
            correctOptionId: "o2",
          },
        ],
        progress: [
          { collectorId: "c1", materialsStatus: "viewed", assessmentStatus: "passed", score: 100, attemptsUsed: 1, lastAttemptAt: "2026-06-06 09:30" },
          { collectorId: "c2", materialsStatus: "viewed", assessmentStatus: "passed", score: 100, attemptsUsed: 1, lastAttemptAt: "2026-06-06 10:12" },
          { collectorId: "c3", materialsStatus: "viewed", assessmentStatus: "passed", score: 75, attemptsUsed: 2, lastAttemptAt: "2026-06-07 14:00" },
          { collectorId: "c4", materialsStatus: "viewed", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c7", materialsStatus: "not started", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c8", materialsStatus: "not started", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
          { collectorId: "c10", materialsStatus: "not started", assessmentStatus: "not attempted", score: null, attemptsUsed: 0, lastAttemptAt: null },
        ],
      },
    ],
    messages: [
      { id: "m1", sentAt: "2026-07-08 09:00", channel: ["in-app", "sms"], recipients: 7, preview: "Reminder: submit all Monday visits by 6pm.", delivered: 7, failed: 0 },
      { id: "m2", sentAt: "2026-07-05 14:30", channel: ["push"], recipients: 7, preview: "Training module 3 is now available.", delivered: 6, failed: 1 },
    ],
  },
  {
    id: "p2",
    name: "Post-harvest survey — Zambia",
    status: "active",
    platform: "kobo",
    formName: "post_harvest_2026",
    startDate: "2026-07-01",
    endDate: "2026-09-15",
    collectorIds: ["c10", "c11"],
    submissions: [
      {
        id: "s7", collectorId: "c10", collectorName: "Joseph Banda",
        submittedAt: "2026-07-08 15:12", durationMin: 31, gps: "-15.3875, 28.3228", location: "Lusaka, ZM",
        status: "approved",
        responses: [{ question: "Crop yield (kg)", answer: "412" }],
        audit: [{ at: "2026-07-08 15:12", who: "Joseph Banda", action: "Submitted" }],
      },
    ],
    training: [
      {
        id: "t4",
        title: "Post-harvest loss protocol",
        addedOn: "2026-06-20",
        passingScore: 80,
        maxAttempts: 3,
        materials: [
          { id: "mat5", filename: "post-harvest-guide.pdf", type: "PDF", uploadedOn: "2026-06-20" },
        ],
        questions: [
          {
            id: "q1",
            text: "How should crop loss be estimated when the farmer is unsure?",
            options: [
              { id: "o1", text: "Enter zero" },
              { id: "o2", text: "Use the visual reference chart in section 3" },
              { id: "o3", text: "Skip the question" },
              { id: "o4", text: "Ask the neighbor instead" },
            ],
            correctOptionId: "o2",
          },
        ],
        progress: [
          { collectorId: "c10", materialsStatus: "viewed", assessmentStatus: "passed", score: 100, attemptsUsed: 1, lastAttemptAt: "2026-06-22 10:00" },
          { collectorId: "c11", materialsStatus: "viewed", assessmentStatus: "passed", score: 100, attemptsUsed: 1, lastAttemptAt: "2026-06-22 11:30" },
        ],
      },
    ],
    messages: [],
  },
  {
    id: "p3",
    name: "Community health worker pilot",
    status: "draft",
    platform: null,
    formName: "",
    startDate: "",
    endDate: "",
    collectorIds: [],
    submissions: [],
    training: [],
    messages: [],
  },
  {
    id: "p4",
    name: "Adolescent nutrition — India",
    status: "completed",
    platform: "odk",
    formName: "adol_nutrition_v2",
    startDate: "2026-01-10",
    endDate: "2026-05-30",
    collectorIds: ["c7", "c8"],
    submissions: [],
    training: [],
    messages: [],
  },
];

export const integrations: Integration[] = [
  { id: "surveycto", name: "SurveyCTO", mark: "SC", detail: "Server URL and API access", status: "connected", account: "relief-hq.surveycto.com", projectsUsing: 1 },
  { id: "kobo", name: "Kobo Toolbox", mark: "KT", detail: "Account and project access", status: "connected", account: "relief-hq @ kobo.humanitarianresponse.info", projectsUsing: 1 },
  { id: "odk", name: "ODK Central", mark: "OC", detail: "Server URL and app user access", status: "error", account: "central.relief-hq.org", errorMessage: "Token expired 2 days ago. Reconnect to resume sync.", projectsUsing: 1 },
];

export const orgMessages: ProjectMessage[] = [
  { id: "om1", sentAt: "2026-07-09 08:15", channel: ["email", "in-app"], recipients: 42, preview: "Q3 payroll schedule and per diem update.", delivered: 41, failed: 1 },
  { id: "om2", sentAt: "2026-07-07 17:00", channel: ["sms"], recipients: 18, preview: "Please confirm your availability for next week's rotation.", delivered: 18, failed: 0 },
  { id: "om3", sentAt: "2026-07-02 10:30", channel: ["push", "in-app"], recipients: 42, preview: "New safeguarding policy — read and acknowledge.", delivered: 38, failed: 4 },
];

// ------- helpers -------

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
export function getCollector(id: string): Collector | undefined {
  return collectors.find((c) => c.id === id);
}
export function countryOptions() {
  return Array.from(new Set(collectors.map((c) => c.country))).sort();
}
export function languageOptions() {
  return Array.from(new Set(collectors.map((c) => c.language))).sort();
}
export function religionOptions() {
  return Array.from(new Set(collectors.map((c) => c.religion))).sort();
}
