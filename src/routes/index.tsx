import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Sparkles, Users } from "lucide-react";
import { useCivic } from "@/lib/civic-store";
import { MapPanel } from "@/components/civic/map-panel";
import { PageHead } from "@/components/civic/shell";
import { Stat, StatusBadge } from "@/components/civic/status-badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jharkhand Civic Connect — verified civic problem solving" },
      {
        name: "description",
        content:
          "Report local problems in Jharkhand, get them verified by your Panchayat, and track university and industry-backed solutions to measured impact.",
      },
      { property: "og:title", content: "Jharkhand Civic Connect" },
      {
        property: "og:description",
        content:
          "Citizen and NGO reports, Panchayat field verification, AI problem statements, university solutions and industry support in one civic pipeline.",
      },
    ],
  }),
  component: Overview,
});

const FLOW = [
  { n: 1, t: "Report", d: "Citizen or NGO files the issue with photo, location and description." },
  { n: 2, t: "Verify", d: "Panchayat official visits the site and records an outcome and severity." },
  { n: 3, t: "Problem statement", d: "Only after verification, an AI draft statement is prepared for government review." },
  { n: 4, t: "Solve", d: "A university team adopts the statement and progresses through field study to deployment." },
  { n: 5, t: "Support", d: "Industry partners pledge funds, material or mentorship against milestones." },
  { n: 6, t: "Impact", d: "Government verifies the outcome and closes the issue with measured impact." },
];

function Overview() {
  const { issues, role } = useCivic();
  const verified = issues.filter((i) => i.verification?.outcome === "verified").length;
  const inProgress = issues.filter((i) => i.status === "in_progress").length;
  const solved = issues.filter((i) => i.status === "solved").length;
  const pledged = issues
    .flatMap((i) => i.project?.pledges ?? [])
    .reduce((s, p) => s + (p.amountInr ?? 0), 0);
  const example = issues.find((i) => i.id === "JCC-2026-0112");

  const next: Record<string, { to: string; label: string }> = {
    citizen: { to: "/report", label: "Report an issue" },
    ngo: { to: "/report", label: "Report an issue" },
    panchayat: { to: "/panchayat", label: "Open verification queue" },
    university: { to: "/problem-statements", label: "Browse problem statements" },
    industry: { to: "/industry", label: "Review support requests" },
    government: { to: "/admin", label: "Open oversight dashboard" },
  };

  return (
    <div className="space-y-8">
      <PageHead
        title="One pipeline from a village complaint to a verified fix"
        intro="Jharkhand Civic Connect connects citizens and NGOs, Panchayat verification, university research teams, industry partners and the state government on a single record per issue."
        aside={
          <Link
            to={next[role]!.to as "/"}
            className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {next[role]!.label} <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Issues on record" value={issues.length} hint="Across 8 districts" />
        <Stat label="Field verified" value={verified} hint="Panchayat-confirmed" />
        <Stat label="Solutions running" value={inProgress + solved} hint={`${solved} closed with impact`} />
        <Stat
          label="Industry commitment"
          value={`Rs ${(pledged / 100000).toFixed(1)} L`}
          hint="Pledged against milestones"
        />
      </div>

      <section aria-labelledby="flow">
        <h2 id="flow" className="font-serif text-xl">
          How a report becomes a solution
        </h2>
        <ol className="mt-3 grid gap-3 md:grid-cols-3">
          {FLOW.map((s) => (
            <li key={s.n} className="rule-top bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Step {s.n}</p>
              <p className="mt-1 font-medium">{s.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-start gap-2 border-l-2 border-primary bg-surface p-3 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            The AI problem statement is locked until a Panchayat official records a verified outcome. Unverified
            or rejected reports never reach universities or industry partners.
          </span>
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {example ? (
          <section className="rule-top bg-card p-5" aria-labelledby="worked">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="worked" className="font-serif text-xl">
                Worked example — Dumka handpump
              </h2>
              <StatusBadge status={example.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{example.title}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2">
                <Users className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Reported by a resident of Bhurkunda Tola, Kathikund block; 42 households, 214 people affected.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden />
                <span>
                  Verified on 18 June 2026 by the Panchayat Sevak — static water level 31 m against a 24 m bore.
                </span>
              </li>
              <li className="flex gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  AI statement generated and approved, adopted by Team Jaldhara (BIT Sindri) with Rs 6.85 lakh of
                  industry support.
                </span>
              </li>
              <li className="flex gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-verified" aria-hidden />
                <span>{example.impact}</span>
              </li>
            </ul>
            <Link
              to="/issues/$issueId"
              params={{ issueId: example.id }}
              className="mt-4 inline-flex items-center gap-2 border border-input px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Open the full case record <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        ) : null}
        <MapPanel issues={issues} title="Where issues are being worked on" />
      </div>
    </div>
  );
}
