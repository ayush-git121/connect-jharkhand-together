export type Role = "citizen" | "ngo" | "panchayat" | "university" | "industry" | "government";

export const ROLES: { id: Role; label: string; org: string; blurb: string }[] = [
  {
    id: "citizen",
    label: "Citizen",
    org: "Resident, Dumka district",
    blurb: "Report local problems with photo, location and description.",
  },
  {
    id: "ngo",
    label: "NGO / Community Group",
    org: "Santhal Pahariya Vikas Manch",
    blurb: "Report issues on behalf of communities and add field context.",
  },
  {
    id: "panchayat",
    label: "Panchayat Official",
    org: "Kathikund Block, Dumka",
    blurb: "Field-verify reported issues before they enter the solution pipeline.",
  },
  {
    id: "university",
    label: "University / Student Team",
    org: "BIT Sindri, Dhanbad",
    blurb: "Pick verified problem statements and progress a solution.",
  },
  {
    id: "industry",
    label: "Industry Partner",
    org: "Tata Steel Foundation, Jamshedpur",
    blurb: "Pledge funds, material or mentorship against milestones.",
  },
  {
    id: "government",
    label: "Government / Admin",
    org: "Dept. of Rural Development, Ranchi",
    blurb: "Oversee districts, approve problem statements, track outcomes.",
  },
];

export type IssueStatus =
  | "reported"
  | "verifying"
  | "rejected"
  | "verified"
  | "ps_draft"
  | "ps_approved"
  | "in_progress"
  | "solved";

export const STATUS_LABEL: Record<IssueStatus, string> = {
  reported: "Reported",
  verifying: "Under field verification",
  rejected: "Not verified",
  verified: "Verified",
  ps_draft: "AI problem statement drafted",
  ps_approved: "Problem statement approved",
  in_progress: "Solution in progress",
  solved: "Solved — impact recorded",
};

export type Category =
  | "Water & Sanitation"
  | "Roads & Transport"
  | "Electricity"
  | "Health"
  | "Education"
  | "Agriculture & Forest"
  | "Waste Management";

export const CATEGORIES: Category[] = [
  "Water & Sanitation",
  "Roads & Transport",
  "Electricity",
  "Health",
  "Education",
  "Agriculture & Forest",
  "Waste Management",
];

export type TimelineEntry = {
  at: string;
  actor: string;
  role: Role | "system";
  text: string;
};

export type Milestone = {
  id: string;
  title: string;
  due: string;
  done: boolean;
  fundedBy?: string;
};

export type Pledge = {
  id: string;
  partner: string;
  kind: "Funding" | "Material" | "Mentorship" | "Deployment";
  detail: string;
  amountInr?: number;
  status: "pledged" | "released";
};

export type ProblemStatement = {
  title: string;
  context: string;
  statement: string;
  objectives: string[];
  constraints: string[];
  skills: string[];
  reviewStatus: "draft" | "approved" | "revision";
  reviewNote?: string;
  reviewedBy?: string;
  generatedAt: string;
};

export type Project = {
  university: string;
  team: string;
  members: string[];
  mentor: string;
  stage: "Adopted" | "Field study" | "Prototype" | "Pilot" | "Deployed";
  progress: number;
  updates: { at: string; text: string }[];
  milestones: Milestone[];
  pledges: Pledge[];
};

export type Issue = {
  id: string;
  title: string;
  category: Category;
  description: string;
  district: string;
  block: string;
  panchayat: string;
  village: string;
  lat: number;
  lng: number;
  reporterName: string;
  reporterKind: "citizen" | "ngo";
  reporterPhone: string;
  anonymous: boolean;
  peopleAffected: number;
  photos: string[];
  reportedAt: string;
  status: IssueStatus;
  verification?: {
    officer: string;
    at: string;
    outcome: "verified" | "rejected";
    severity: "Low" | "Moderate" | "High" | "Critical";
    notes: string;
  };
  ps?: ProblemStatement;
  project?: Project;
  impact?: string;
  timeline: TimelineEntry[];
};

export type Notification = {
  id: string;
  to: Role[];
  text: string;
  at: string;
  issueId?: string | undefined;
  read: boolean;
};
