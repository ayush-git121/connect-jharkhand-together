import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/civic/shell";
import { Stat } from "@/components/civic/status-badge";
import { useCivic } from "@/lib/civic-store";
import type { Issue } from "@/lib/civic-types";

export const Route = createFileRoute("/problem-statements")({
  head: () => ({
    meta: [
      { title: "Problem statements — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "AI-drafted problem statements generated from verified field records, reviewed by government and opened for university adoption.",
      },
      { property: "og:title", content: "Problem statements — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Verified field records turned into researchable problem statements.",
      },
    ],
  }),
  component: ProblemStatements;
});

function ProblemStatements() {
  const { issues, role, generatePS, reviewPS, adoptPS } = useCivic();
  const ready = issues.filter((i) => i.status === "verified");
  const drafts = issues.filter((i) => i.ps && i.ps.reviewStatus !== "approved");
  const approved = issues.filter((i) => i.ps?.reviewStatus === "approved");
  const open = approved.filter((i) => !i.project);

  return (
    <div className="space-y-7">
      <PageHead
        title={role === "government" ? "AI problem statement review" : "Approved problem statements"}
        intro={
          role === "government"
            ? "Statements are drafted only from verified field records. Approve, or send back for revision with a note."
            : "Every statement here is backed by a Panchayat-verified site visit. Adopt one to start a project."
        }
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Verified, no statement" value={ready.length} />
        <Stat label="Drafts in review" value={drafts.length} />
        <Stat label="Approved" value={approved.length} />
        <Stat label="Open for adoption" value={open.length} />
      </div>

      {role === "government" ? (
        <>
          <section className="space-y-3">
            <h2 className="font-serif text-xl">Verified issues awaiting a statement</h2>
            {ready.map((i) => (
              <article key={i.id} className="rule-top flex flex-wrap items-center gap-3 bg-card p-4">
                <div className="min-w-60 flex-1">
                  <p className="font-mono text-xs text-muted-foreground">{i.id}</p>
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Verified {i.verification?.at.slice(0, 10)} · severity {i.verification?.severity}
                  </p>
                </div>
                <button
                  onClick={() => {
                    generatePS(i.id);
                    toast.success("Draft statement generated from the field record");
                  }}
                  className="inline-flex items-center gap-2 bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="size-4" aria-hidden /> Generate statement
                </button>
              </article>
            ))}
            {ready.length === 0 ? (
              <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No verified issues are waiting. Verified reports appear here automatically.
              </p>
            ) : null}
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl">Drafts awaiting review</h2>
            {drafts.map((i) => (
              <ReviewCard key={i.id} issue={i} onReview={reviewPS} />
            ))}
            {drafts.length === 0 ? (
              <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nothing in review.
              </p>
            ) : null}
          </section>
        </>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-serif text-xl">
          {role === "university" ? "Open for adoption" : "Approved statements"}
        </h2>
        {(role === "university" ? open : approved).map((i) => (
          <article key={i.id} className="rule-top bg-card p-5">
            <p className="font-mono text-xs text-muted-foreground">{i.id}</p>
            <h3 className="mt-1 font-serif text-lg">{i.ps!.title}</h3>
            <p className="mt-2 text-sm">{i.ps!.statement}</p>
            <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Objectives</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {i.ps!.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Constraints</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {i.ps!.constraints.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {i.village}, {i.block} block, {i.district} · skills: {i.ps!.skills.join(", ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/issues/$issueId"
                params={{ issueId: i.id }}
                className="border border-input px-3 py-1.5 text-sm hover:bg-secondary"
              >
                Open case record
              </Link>
              {role === "university" && !i.project ? <AdoptForm issueId={i.id} onAdopt={adoptPS} /> : null}
              {i.project ? (
                <span className="px-3 py-1.5 text-sm text-muted-foreground">
                  Adopted by {i.project.team}, {i.project.university}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function ReviewCard({
  issue,
  onReview,
}: {
  issue: Issue;
  onReview: ReturnType<typeof useCivic>["reviewPS"];
}) {
  const [note, setNote] = useState("");
  return (
    <article className="rule-top bg-card p-5">
      <p className="font-mono text-xs text-muted-foreground">{issue.id}</p>
      <h3 className="mt-1 font-serif text-lg">{issue.ps!.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{issue.ps!.context}</p>
      <p className="mt-2 border-l-2 border-primary bg-surface p-3 text-sm">{issue.ps!.statement}</p>
      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
          Reviewer note (required for revision)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full border border-input bg-background px-2 py-2 text-sm"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            onReview(issue.id, "approved", note);
            toast.success("Approved and published to universities");
          }}
          className="bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Approve and publish
        </button>
        <button
          onClick={() => {
            if (note.trim().length < 5) {
              toast.error("Add a note explaining the revision needed");
              return;
            }
            onReview(issue.id, "revision", note);
            toast("Revision requested");
          }}
          className="border border-input px-3 py-1.5 text-sm hover:bg-secondary"
        >
          Request revision
        </button>
      </div>
    </article>
  );
}

function AdoptForm({
  issueId,
  onAdopt,
}: {
  issueId: string;
  onAdopt: ReturnType<typeof useCivic>["adoptPS"];
}) {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState("");
  const [mentor, setMentor] = useState("");
  const [members, setMembers] = useState("");

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Adopt this statement
      </button>
    );

  return (
    <form
      className="mt-2 w-full space-y-3 border border-border bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!team || !mentor || !members) {
          toast.error("Team name, mentor and at least one member are needed");
          return;
        }
        onAdopt(issueId, {
          university: "BIT Sindri, Dhanbad",
          team,
          mentor,
          members: members.split(",").map((m) => m.trim()).filter(Boolean),
        });
        toast.success(`${team} has adopted the statement`);
        setOpen(false);
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Team name</span>
        <input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="w-full border border-input bg-background px-2 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
          Faculty mentor
        </span>
        <input
          value={mentor}
          onChange={(e) => setMentor(e.target.value)}
          placeholder="Dr. name, department"
          className="w-full border border-input bg-background px-2 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
          Members (comma separated)
        </span>
        <input
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          className="w-full border border-input bg-background px-2 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <button className="bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
          Confirm adoption
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-input px-3 py-1.5 text-sm hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
