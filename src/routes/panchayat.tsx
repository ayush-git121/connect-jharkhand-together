import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHead } from "@/components/civic/shell";
import { Stat, StatusBadge } from "@/components/civic/status-badge";
import { reporterLabel, useCivic } from "@/lib/civic-store";

export const Route = createFileRoute("/panchayat")({
  head: () => ({
    meta: [
      { title: "Verification queue — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "Panchayat field verification queue: visit the site, record severity and confirm or reject each reported issue.",
      },
      { property: "og:title", content: "Verification queue — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Record field outcomes that unlock problem statements for research teams.",
      },
    ],
  }),
  component: PanchayatQueue,
});

const SEVERITIES = ["Low", "Moderate", "High", "Critical"] as const;

function PanchayatQueue() {
  const { issues, role, verifyIssue } = useCivic();
  const pending = issues.filter((i) => i.status === "reported" || i.status === "verifying");
  const done = issues.filter((i) => i.verification);

  return (
    <div className="space-y-6">
      <PageHead
        title="Field verification queue"
        intro="Each report needs a site visit. Your outcome decides whether the issue enters the solution pipeline — nothing moves forward without it."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Awaiting field visit" value={pending.length} />
        <Stat label="Verified by this office" value={done.filter((i) => i.verification?.outcome === "verified").length} />
        <Stat label="Rejected with reason" value={done.filter((i) => i.verification?.outcome === "rejected").length} />
      </div>

      {role !== "panchayat" ? (
        <p className="border border-border bg-surface p-3 text-sm text-muted-foreground">
          You are viewing this queue in read-only mode. Switch to the Panchayat Official role to record outcomes.
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-serif text-xl">Pending reports</h2>
        {pending.map((i) => (
          <VerifyCard key={i.id} id={i.id} canAct={role === "panchayat"} onVerify={verifyIssue} />
        ))}
        {pending.length === 0 ? (
          <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nothing pending. New reports appear here immediately.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Recently recorded</h2>
        {done.map((i) => (
          <article key={i.id} className="border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{i.id}</span>
              <StatusBadge status={i.status} />
              <span>
                {i.verification?.officer} · {i.verification?.at.slice(0, 10)} · severity{" "}
                {i.verification?.severity}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium">
              <Link to="/issues/$issueId" params={{ issueId: i.id }} className="hover:underline">
                {i.title}
              </Link>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{i.verification?.notes}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function VerifyCard({
  id,
  canAct,
  onVerify,
}: {
  id: string;
  canAct: boolean;
  onVerify: ReturnType<typeof useCivic>["verifyIssue"];
}) {
  const { issues, role } = useCivic();
  const issue = issues.find((i) => i.id === id)!;
  const rep = reporterLabel(issue, role);
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("Moderate");
  const [notes, setNotes] = useState("");

  return (
    <article className="rule-top bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">{issue.id}</span>
        <StatusBadge status={issue.status} />
        <span className="border border-border px-1.5 py-0.5">{issue.category}</span>
      </div>
      <h3 className="mt-2 font-serif text-lg">
        <Link to="/issues/$issueId" params={{ issueId: issue.id }} className="hover:underline">
          {issue.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {issue.village}, {issue.panchayat} Panchayat, {issue.block} block · {issue.lat.toFixed(4)}°N,{" "}
        {issue.lng.toFixed(4)}°E
      </p>
      <p className="mt-2 text-sm">{issue.description}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Reporter: {rep.name} · contact {rep.contact} · {issue.photos.length} photo(s) ·{" "}
        {issue.peopleAffected} affected
      </p>

      {canAct ? (
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_2fr]">
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Severity</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as (typeof SEVERITIES)[number])}
              className="w-full border border-input bg-background px-2 py-2 text-sm"
            >
              {SEVERITIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
              Field observation
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What you measured, who you spoke to, what you confirmed"
              className="w-full border border-input bg-background px-2 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (notes.trim().length < 10) {
                  toast.error("Add a field observation before recording an outcome");
                  return;
                }
                onVerify(issue.id, {
                  officer: "Rajesh Mahto, Panchayat Sevak",
                  at: new Date().toISOString(),
                  outcome: "verified",
                  severity,
                  notes,
                });
                toast.success("Verified. Government can now generate a problem statement.");
              }}
              className="bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Mark verified
            </button>
            <button
              onClick={() => {
                if (notes.trim().length < 10) {
                  toast.error("A rejection needs a written reason for the reporter");
                  return;
                }
                onVerify(issue.id, {
                  officer: "Rajesh Mahto, Panchayat Sevak",
                  at: new Date().toISOString(),
                  outcome: "rejected",
                  severity: "Low",
                  notes,
                });
                toast("Recorded as not verified; reporter has been informed.");
              }}
              className="border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              Cannot verify
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
