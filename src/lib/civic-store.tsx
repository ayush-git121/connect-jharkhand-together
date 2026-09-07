import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedIssues, seedNotifications } from "./civic-data";
import type {
  Issue,
  IssueStatus,
  Notification,
  Pledge,
  ProblemStatement,
  Role,
} from "./civic-types";

type NewIssue = Omit<Issue, "id" | "status" | "timeline" | "reportedAt">;

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  issues: Issue[];
  notifications: Notification[];
  unread: number;
  markAllRead: () => void;
  addIssue: (i: NewIssue) => string;
  verifyIssue: (
    id: string,
    v: NonNullable<Issue["verification"]>,
  ) => void;
  generatePS: (id: string) => void;
  reviewPS: (id: string, decision: "approved" | "revision", note: string) => void;
  adoptPS: (
    id: string,
    p: { university: string; team: string; members: string[]; mentor: string },
  ) => void;
  addUpdate: (id: string, text: string, stage: NonNullable<Issue["project"]>["stage"]) => void;
  toggleMilestone: (id: string, mid: string) => void;
  addPledge: (id: string, p: Omit<Pledge, "id">) => void;
  closeIssue: (id: string, impact: string) => void;
};

const CivicContext = createContext<Ctx | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

function draftPS(issue: Issue): ProblemStatement {
  const v = issue.verification;
  return {
    title: `${issue.category}: ${issue.village}, ${issue.block} (${issue.district})`,
    context: `Field-verified on ${v?.at.slice(0, 10)} by ${v?.officer}. Severity assessed as ${v?.severity}. Approximately ${issue.peopleAffected} residents of ${issue.village} are affected. Verification note: ${v?.notes}`,
    statement: `Design and demonstrate a locally maintainable solution to the following verified problem in ${issue.panchayat} Panchayat, ${issue.block} block, ${issue.district}: ${issue.description}`,
    objectives: [
      "Restore the affected service to a measurable, agreed standard.",
      "Keep recurring cost within Panchayat-sustainable limits.",
      "Ensure operation and minor repair can be done locally.",
      "Define indicators to be re-measured 90 days after handover.",
    ],
    constraints: [
      "Intermittent grid power and seasonal road access.",
      "Community contribution available as labour, not cash.",
      "Solution must use spares available within the district.",
    ],
    skills: ["Field survey", "Engineering design", "Cost estimation", "Community operations"],
    reviewStatus: "draft",
    generatedAt: new Date().toISOString(),
  };
}

export function CivicProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("citizen");
  const [issues, setIssues] = useState<Issue[]>(() => seedIssues());
  const [notifications, setNotifications] = useState<Notification[]>(() => seedNotifications());

  const notify = useCallback((to: Role[], text: string, issueId?: string) => {
    setNotifications((prev) => [
      {
        id: `n-${prev.length + 1}-${to.join("")}`,
        to,
        text,
        at: new Date().toISOString(),
        issueId,
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const patch = useCallback(
    (id: string, fn: (i: Issue) => Issue) =>
      setIssues((prev) => prev.map((i) => (i.id === id ? fn(i) : i))),
    [],
  );

  const log = (i: Issue, actor: string, r: Role | "system", text: string): Issue => ({
    ...i,
    timeline: [...i.timeline, { at: today(), actor, role: r, text }],
  });

  const addIssue = useCallback<Ctx["addIssue"]>(
    (data) => {
      const id = `JCC-2026-${500 + Math.floor(Math.random() * 400)}`;
      const issue: Issue = {
        ...data,
        id,
        reportedAt: new Date().toISOString(),
        status: "reported",
        timeline: [
          {
            at: today(),
            actor: data.anonymous ? "Citizen (identity protected)" : data.reporterName,
            role: data.reporterKind,
            text: `Issue reported with ${data.photos.length} photo(s) and GPS location.`,
          },
        ],
      };
      setIssues((prev) => [issue, ...prev]);
      notify(["panchayat"], `New report ${id} in ${data.panchayat} awaits field verification.`, id);
      return id;
    },
    [notify],
  );

  const verifyIssue = useCallback<Ctx["verifyIssue"]>(
    (id, v) => {
      patch(id, (i) =>
        log(
          { ...i, verification: v, status: v.outcome === "verified" ? "verified" : "rejected" },
          v.officer,
          "panchayat",
          v.outcome === "verified"
            ? `Verified on site. Severity: ${v.severity}.`
            : "Not verified. Reporter may re-file with corrections.",
        ),
      );
      if (v.outcome === "verified") {
        notify(["government"], `${id} is verified and ready for AI problem statement generation.`, id);
      } else {
        notify(["citizen", "ngo"], `${id} could not be verified in the field.`, id);
      }
    },
    [notify, patch],
  );

  const generatePS = useCallback<Ctx["generatePS"]>(
    (id) => {
      patch(id, (i) =>
        i.status === "verified"
          ? log({ ...i, ps: draftPS(i), status: "ps_draft" }, "AI assistant", "system", "Problem statement generated from verified field record.")
          : i,
      );
      notify(["government"], `AI problem statement drafted for ${id}; awaiting review.`, id);
    },
    [notify, patch],
  );

  const reviewPS = useCallback<Ctx["reviewPS"]>(
    (id, decision, note) => {
      patch(id, (i) =>
        i.ps
          ? log(
              {
                ...i,
                status: (decision === "approved" ? "ps_approved" : "ps_draft") as IssueStatus,
                ps: {
                  ...i.ps,
                  reviewStatus: decision,
                  reviewNote: note,
                  reviewedBy: "Dept. of Rural Development, Ranchi",
                },
              },
              "Dept. of Rural Development",
              "government",
              decision === "approved"
                ? "Problem statement approved and published to universities."
                : `Revision requested: ${note}`,
            )
          : i,
      );
      if (decision === "approved")
        notify(["university"], `Approved problem statement open for adoption (${id}).`, id);
    },
    [notify, patch],
  );

  const adoptPS = useCallback<Ctx["adoptPS"]>(
    (id, p) => {
      patch(id, (i) =>
        log(
          {
            ...i,
            status: "in_progress",
            project: {
              ...p,
              stage: "Adopted",
              progress: 10,
              updates: [{ at: today(), text: "Problem statement adopted; field visit being scheduled." }],
              milestones: [
                { id: "m1", title: "Field study and baseline report", due: "2026-10-15", done: false },
                { id: "m2", title: "Design review with Panchayat", due: "2026-11-10", done: false },
                { id: "m3", title: "Prototype / pilot build", due: "2026-12-20", done: false },
                { id: "m4", title: "Handover and 30-day monitoring", due: "2027-02-01", done: false },
              ],
              pledges: [],
            },
          },
          p.team,
          "university",
          `${p.team} (${p.university}) adopted the problem statement. Mentor: ${p.mentor}.`,
        ),
      );
      notify(["citizen", "ngo", "panchayat"], `A university team has adopted the problem statement for ${id}.`, id);
      notify(["industry"], `New project open for support: ${id}.`, id);
    },
    [notify, patch],
  );

  const addUpdate = useCallback<Ctx["addUpdate"]>(
    (id, text, stage) => {
      const pct = { Adopted: 10, "Field study": 30, Prototype: 55, Pilot: 80, Deployed: 100 }[stage];
      patch(id, (i) =>
        i.project
          ? log(
              {
                ...i,
                project: {
                  ...i.project,
                  stage,
                  progress: pct,
                  updates: [...i.project.updates, { at: today(), text }],
                },
              },
              i.project.team,
              "university",
              text,
            )
          : i,
      );
      notify(["citizen", "ngo", "panchayat", "government"], `Progress update on ${id}: ${stage}.`, id);
    },
    [notify, patch],
  );

  const toggleMilestone = useCallback<Ctx["toggleMilestone"]>(
    (id, mid) =>
      patch(id, (i) =>
        i.project
          ? {
              ...i,
              project: {
                ...i.project,
                milestones: i.project.milestones.map((m) =>
                  m.id === mid ? { ...m, done: !m.done } : m,
                ),
              },
            }
          : i,
      ),
    [patch],
  );

  const addPledge = useCallback<Ctx["addPledge"]>(
    (id, p) => {
      patch(id, (i) =>
        i.project
          ? log(
              {
                ...i,
                project: {
                  ...i.project,
                  pledges: [...i.project.pledges, { ...p, id: `p-${i.project.pledges.length + 1}` }],
                },
              },
              p.partner,
              "industry",
              `Pledged ${p.kind.toLowerCase()}: ${p.detail}${p.amountInr ? ` (Rs ${p.amountInr.toLocaleString("en-IN")})` : ""}.`,
            )
          : i,
      );
      notify(["university", "government"], `New industry pledge recorded on ${id}.`, id);
    },
    [notify, patch],
  );

  const closeIssue = useCallback<Ctx["closeIssue"]>(
    (id, impact) => {
      patch(id, (i) =>
        log(
          { ...i, status: "solved", impact, project: i.project ? { ...i.project, stage: "Deployed", progress: 100 } : i.project },
          "Dept. of Rural Development",
          "government",
          "Impact verified and issue closed.",
        ),
      );
      notify(["citizen", "ngo", "panchayat", "university", "industry"], `${id} closed with verified impact.`, id);
    },
    [notify, patch],
  );

  const unread = useMemo(
    () => notifications.filter((n) => n.to.includes(role) && !n.read).length,
    [notifications, role],
  );

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => (n.to.includes(role) ? { ...n, read: true } : n))),
    [role],
  );

  const value: Ctx = {
    role,
    setRole,
    issues,
    notifications,
    unread,
    markAllRead,
    addIssue,
    verifyIssue,
    generatePS,
    reviewPS,
    adoptPS,
    addUpdate,
    toggleMilestone,
    addPledge,
    closeIssue,
  };

  return <CivicContext.Provider value={value}>{children}</CivicContext.Provider>;
}

export function useCivic() {
  const ctx = useContext(CivicContext);
  if (!ctx) throw new Error("useCivic must be used inside CivicProvider");
  return ctx;
}

/** Citizen privacy: contact details and names are visible only to the reporter's own
 * role view and to the verifying Panchayat official / Government admin. */
export function reporterLabel(issue: Issue, role: Role) {
  const kind = issue.reporterKind === "ngo" ? "NGO / community group" : "Citizen";
  if (issue.reporterKind === "ngo") return { name: issue.reporterName, contact: role === "panchayat" || role === "government" ? issue.reporterPhone : "Withheld" };
  if (issue.anonymous) return { name: `${kind} (identity protected)`, contact: "Withheld" };
  if (role === "panchayat" || role === "government")
    return { name: issue.reporterName, contact: issue.reporterPhone };
  if (role === "citizen") return { name: issue.reporterName, contact: "Withheld" };
  return { name: `${kind} (identity protected)`, contact: "Withheld" };
}
