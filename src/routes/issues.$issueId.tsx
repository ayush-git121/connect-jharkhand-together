import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/civic/shell";
import { StatusBadge } from "@/components/civic/status-badge";
import { reporterLabel, useCivic } from "@/lib/civic-store";

export const Route = createFileRoute("/issues/$issueId")({
  head: () => ({
    meta: [
      { title: "Issue record — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "Full civic case record: report, Panchayat verification, problem statement, solution progress and verified impact.",
      },
      { property: "og:title", content: "Issue record — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Report, verification, problem statement, solution and impact on one page.",
      },
    ],
  }),
  component: IssueDetail,
});

function IssueDetail() {
  const { issueId } = Route.useParams();
  const { issues, role, generatePS, closeIssue } = useCivic();
  const issue = issues.find((i) => i.id === issueId);

  if (!issue) {
    return (
      <div className="space-y-4">
        <p className="text-sm">No issue found with reference {issueId}.</p>
        <Link to="/issues" className="text-sm text-primary underline">
          Back to the issue register
        </Link>
      </div>
    );
  }

  const rep = reporterLabel(issue, role);
  const canSeeContact = rep.contact !== "Withheld";

  return (
    <div className="space-y-6">
      <Link to="/issues" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Issue register
      </Link>
      <PageHead
        title={issue.title}
        intro={`${issue.village}, ${issue.panchayat} Panchayat, ${issue.block} block, ${issue.district} · ${issue.category}`}
        aside={<StatusBadge status={issue.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-5">
          <section className="rule-top bg-card p-4">
            <h2 className="font-serif text-lg">The report</h2>
            <p className="mt-2 text-sm">{issue.description}</p>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reference</dt>
                <dd className="font-mono">{issue.id}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reported</dt>
                <dd>{issue.reportedAt.slice(0, 10)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reported by</dt>
                <dd>{rep.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Contact</dt>
                <dd>{canSeeContact ? rep.contact : "Withheld to protect the reporter"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">People affected</dt>
                <dd>{issue.peopleAffected}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Location pin</dt>
                <dd className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  {issue.lat.toFixed(4)}°N, {issue.lng.toFixed(4)}°E
                </dd>
              </div>
            </dl>
            {issue.photos.length ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {issue.photos.map((p) => (
                  <li key={p} className="flex items-center gap-2 border border-border bg-surface p-3 text-sm">
                    <Camera className="size-4 text-muted-foreground" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No photograph attached.</p>
            )}
          </section>

          <section className="rule-top bg-card p-4">
            <h2 className="font-serif text-lg">Panchayat verification</h2>
            {issue.verification ? (
              <div className="mt-2 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <ShieldCheck
                    className={`size-4 ${issue.verification.outcome === "verified" ? "text-verified" : "text-destructive"}`}
                    aria-hidden
                  />
                  <span className="font-medium">
                    {issue.verification.outcome === "verified" ? "Verified on site" : "Not verified"}
                  </span>
                  <span className="text-muted-foreground">
                    · {issue.verification.officer} · {issue.verification.at.slice(0, 10)}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Severity:</span> {issue.verification.severity}
                </p>
                <p>{issue.verification.notes}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Awaiting a field visit. No problem statement can be generated until an official records an
                outcome.
              </p>
            )}
            {role === "panchayat" && !issue.verification ? (
              <Link
                to="/panchayat"
                className="mt-3 inline-block bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
              >
                Record verification
              </Link>
            ) : null}
          </section>

          <section className="rule-top bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-lg">AI problem statement</h2>
              {issue.ps ? (
                <span className="border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {issue.ps.reviewStatus === "approved"
                    ? `Approved by ${issue.ps.reviewedBy}`
                    : issue.ps.reviewStatus === "revision"
                      ? "Revision requested"
                      : "Draft — awaiting government review"}
                </span>
              ) : null}
            </div>
            {issue.ps ? (
              <div className="mt-3 space-y-3 text-sm">
                <p className="font-medium">{issue.ps.title}</p>
                <p className="text-muted-foreground">{issue.ps.context}</p>
                <p className="border-l-2 border-primary bg-surface p-3">{issue.ps.statement}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Objectives</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {issue.ps.objectives.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Constraints</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {issue.ps.constraints.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Skills sought: {issue.ps.skills.join(", ")} · generated {issue.ps.generatedAt.slice(0, 10)}
                </p>
              </div>
            ) : issue.status === "verified" ? (
              <div className="mt-2 space-y-3 text-sm">
                <p className="text-muted-foreground">
                  This issue is verified. A problem statement can now be generated from the field record.
                </p>
                {role === "government" ? (
                  <button
                    onClick={() => {
                      generatePS(issue.id);
                      toast.success("Problem statement drafted for review");
                    }}
                    className="inline-flex items-center gap-2 bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90"
                  >
                    <Sparkles className="size-4" aria-hidden /> Generate problem statement
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Locked. Problem statements are generated only from verified field records.
              </p>
            )}
          </section>

          {issue.project ? (
            <section className="rule-top bg-card p-4">
              <h2 className="font-serif text-lg">Solution work</h2>
              <p className="mt-2 text-sm">
                {issue.project.team} · {issue.project.university} · Mentor: {issue.project.mentor}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Members: {issue.project.members.join("; ")}
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Stage: {issue.project.stage}</span>
                  <span>{issue.project.progress}%</span>
                </div>
                <div className="mt-1 h-2 w-full bg-secondary">
                  <div className="h-2 bg-primary" style={{ width: `${issue.project.progress}%` }} />
                </div>
              </div>
              <ol className="mt-4 space-y-2 text-sm">
                {issue.project.milestones.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
                    <span
                      className={`size-2 rounded-full ${m.done ? "bg-verified" : "bg-pending"}`}
                      aria-hidden
                    />
                    <span className={m.done ? "line-through decoration-border" : ""}>{m.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      due {m.due}
                      {m.fundedBy ? ` · supported by ${m.fundedBy}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
              {issue.project.pledges.length ? (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Industry support</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {issue.project.pledges.map((p) => (
                      <li key={p.id}>
                        {p.partner} — {p.kind}: {p.detail}
                        {p.amountInr ? ` (Rs ${p.amountInr.toLocaleString("en-IN")})` : ""} · {p.status}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {issue.impact ? (
            <section className="rule-top bg-accent p-4">
              <h2 className="font-serif text-lg text-accent-foreground">Verified impact</h2>
              <p className="mt-2 text-sm text-accent-foreground">{issue.impact}</p>
            </section>
          ) : role === "government" && issue.project?.progress === 100 ? (
            <button
              onClick={() => {
                closeIssue(issue.id, "Outcome verified by the district office; issue closed.");
                toast.success("Issue closed with recorded impact");
              }}
              className="bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Verify impact and close issue
            </button>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <section className="rule-top bg-card p-4">
            <h2 className="font-serif text-lg">Case timeline</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {issue.timeline.map((t, idx) => (
                <li key={`${t.at}-${idx}`} className="border-l-2 border-border pl-3">
                  <p className="text-xs text-muted-foreground">
                    {t.at} · {t.actor}
                  </p>
                  <p>{t.text}</p>
                </li>
              ))}
            </ol>
          </section>
          <p className="mt-3 border border-border bg-surface p-3 text-xs text-muted-foreground">
            Privacy: reporter names and phone numbers are visible only to the verifying Panchayat official and
            the government admin. University and industry users see the case without personal details.
          </p>
        </aside>
      </div>
    </div>
  );
}
