import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead } from "@/components/civic/shell";
import { Stat } from "@/components/civic/status-badge";
import { useCivic } from "@/lib/civic-store";
import type { Issue, Pledge } from "@/lib/civic-types";

export const Route = createFileRoute("/industry")({
  head: () => ({
    meta: [
      { title: "Industry support — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "Pledge funding, material, mentorship or deployment support against verified civic project milestones in Jharkhand.",
      },
      { property: "og:title", content: "Industry support — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Back specific milestones on verified, university-led civic projects.",
      },
    ],
  }),
  component: IndustryPage,
});

const KINDS: Pledge["kind"][] = ["Funding", "Material", "Mentorship", "Deployment"];

function IndustryPage() {
  const { issues, role } = useCivic();
  const projects = issues.filter((i) => i.project);
  const pledges = projects.flatMap((i) => i.project!.pledges);
  const total = pledges.reduce((s, p) => s + (p.amountInr ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHead
        title="Support requests and milestones"
        intro="Every project here has a Panchayat-verified problem behind it. Pledges attach to named milestones, not to general funds. Reporter identities are not shared with partners."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Open projects" value={projects.length} />
        <Stat label="Pledges recorded" value={pledges.length} />
        <Stat label="Committed value" value={`Rs ${(total / 100000).toFixed(2)} L`} />
      </div>

      {role !== "industry" ? (
        <p className="border border-border bg-surface p-3 text-sm text-muted-foreground">
          Read-only view. Switch to the Industry Partner role to record a pledge.
        </p>
      ) : null}

      {projects.map((i) => (
        <SupportCard key={i.id} issue={i} canAct={role === "industry"} />
      ))}
    </div>
  );
}

function SupportCard({ issue, canAct }: { issue: Issue; canAct: boolean }) {
  const { addPledge } = useCivic();
  const p = issue.project!;
  const [kind, setKind] = useState<Pledge["kind"]>("Funding");
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <article className="rule-top bg-card p-5">
      <p className="font-mono text-xs text-muted-foreground">{issue.id}</p>
      <h2 className="mt-1 font-serif text-lg">
        <Link to="/issues/$issueId" params={{ issueId: issue.id }} className="hover:underline">
          {issue.ps?.title ?? issue.title}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {p.team}, {p.university} · {issue.village}, {issue.block} block, {issue.district} · stage {p.stage}
      </p>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Milestones needing support</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {p.milestones.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
                <span className={`size-2 rounded-full ${m.done ? "bg-verified" : "bg-pending"}`} aria-hidden />
                <span>{m.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {m.fundedBy ? `supported by ${m.fundedBy}` : "unsupported"} · due {m.due}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Pledges on record</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {p.pledges.map((pl) => (
              <li key={pl.id}>
                {pl.partner} — {pl.kind}: {pl.detail}
                {pl.amountInr ? ` (Rs ${pl.amountInr.toLocaleString("en-IN")})` : ""} · {pl.status}
              </li>
            ))}
            {p.pledges.length === 0 ? <li className="text-muted-foreground">No pledges yet.</li> : null}
          </ul>
        </div>
      </div>

      {canAct ? (
        <form
          className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (detail.trim().length < 5) {
              toast.error("Describe what you are pledging");
              return;
            }
            addPledge(issue.id, {
              partner: "Tata Steel Foundation",
              kind,
              detail,
              status: "pledged",
              ...(amount ? { amountInr: Number(amount) } : {}),
            });
            setDetail("");
            setAmount("");
            toast.success("Pledge recorded against this project");
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Type</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Pledge["kind"])}
              className="w-full border border-input bg-background px-2 py-2 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
              What you are committing
            </span>
            <input
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full border border-input bg-background px-2 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
              Value (Rs, optional)
            </span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min={0}
              className="w-40 border border-input bg-background px-2 py-2 text-sm"
            />
          </label>
          <button className="bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90">
            Record pledge
          </button>
        </form>
      ) : null}
    </article>
  );
}
