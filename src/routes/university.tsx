import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead } from "@/components/civic/shell";
import { Stat } from "@/components/civic/status-badge";
import { useCivic } from "@/lib/civic-store";
import type { Issue, Project } from "@/lib/civic-types";

export const Route = createFileRoute("/university")({
  head: () => ({
    meta: [
      { title: "University projects — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "Student teams, faculty mentors and stage-by-stage progress on adopted civic problem statements across Jharkhand.",
      },
      { property: "og:title", content: "University projects — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Team, mentor, milestones and field progress for every adopted problem statement.",
      },
    ],
  }),
  component: UniversityProjects,
});

const STAGES: Project["stage"][] = ["Adopted", "Field study", "Prototype", "Pilot", "Deployed"];

function UniversityProjects() {
  const { issues, role } = useCivic();
  const projects = issues.filter((i) => i.project);

  return (
    <div className="space-y-6">
      <PageHead
        title="Adopted projects"
        intro="Each project runs against a verified field record. Log progress so the Panchayat, the reporter and supporting partners can follow it."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Projects" value={projects.length} />
        <Stat
          label="Milestones cleared"
          value={projects.flatMap((p) => p.project!.milestones).filter((m) => m.done).length}
        />
        <Stat label="Deployed" value={projects.filter((p) => p.project!.stage === "Deployed").length} />
      </div>

      {role !== "university" ? (
        <p className="border border-border bg-surface p-3 text-sm text-muted-foreground">
          Read-only view. Switch to the University role to log progress and tick milestones.
        </p>
      ) : null}

      {projects.map((i) => (
        <ProjectCard key={i.id} issue={i} canAct={role === "university"} />
      ))}
      {projects.length === 0 ? (
        <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No project yet. Adopt an approved problem statement to start one.
        </p>
      ) : null}
    </div>
  );
}

function ProjectCard({ issue, canAct }: { issue: Issue; canAct: boolean }) {
  const { addUpdate, toggleMilestone } = useCivic();
  const p = issue.project!;
  const [stage, setStage] = useState<Project["stage"]>(p.stage);
  const [text, setText] = useState("");

  return (
    <article className="rule-top bg-card p-5">
      <p className="font-mono text-xs text-muted-foreground">{issue.id}</p>
      <h2 className="mt-1 font-serif text-lg">
        <Link to="/issues/$issueId" params={{ issueId: issue.id }} className="hover:underline">
          {issue.ps?.title ?? issue.title}
        </Link>
      </h2>
      <p className="mt-1 text-sm">
        {p.team} · {p.university} · Mentor: {p.mentor}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Members: {p.members.join("; ")}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Stage: {p.stage}</span>
          <span>{p.progress}% complete</span>
        </div>
        <div className="mt-1 h-2 w-full bg-secondary" role="presentation">
          <div className="h-2 bg-primary" style={{ width: `${p.progress}%` }} />
        </div>
        <ol className="mt-2 flex flex-wrap gap-2 text-xs">
          {STAGES.map((s) => (
            <li
              key={s}
              className={`border px-2 py-0.5 ${
                STAGES.indexOf(s) <= STAGES.indexOf(p.stage)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Milestones</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {p.milestones.map((m) => (
              <li key={m.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={m.done}
                  disabled={!canAct}
                  onChange={() => toggleMilestone(issue.id, m.id)}
                  className="mt-1"
                  aria-label={`Mark ${m.title} complete`}
                />
                <span>
                  {m.title}
                  <span className="block text-xs text-muted-foreground">
                    due {m.due}
                    {m.fundedBy ? ` · supported by ${m.fundedBy}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Progress log</h3>
          <ol className="mt-2 space-y-2 text-sm">
            {[...p.updates].reverse().map((u, idx) => (
              <li key={`${u.at}-${idx}`} className="border-l-2 border-border pl-3">
                <span className="block text-xs text-muted-foreground">{u.at}</span>
                {u.text}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {canAct ? (
        <form
          className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim().length < 10) {
              toast.error("Write a short field update first");
              return;
            }
            addUpdate(issue.id, text, stage);
            setText("");
            toast.success("Progress logged; followers notified");
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Stage</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as Project["stage"])}
              className="w-full border border-input bg-background px-2 py-2 text-sm"
            >
              {STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
              Field update
            </span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What changed on site this week"
              className="w-full border border-input bg-background px-2 py-2 text-sm"
            />
          </label>
          <button className="bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90">
            Log update
          </button>
        </form>
      ) : null}
    </article>
  );
}
