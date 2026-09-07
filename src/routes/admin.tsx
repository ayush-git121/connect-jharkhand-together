import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/civic/shell";
import { MapPanel } from "@/components/civic/map-panel";
import { Stat, StatusBadge } from "@/components/civic/status-badge";
import { useCivic } from "@/lib/civic-store";
import { CATEGORIES } from "@/lib/civic-types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Oversight & analytics — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "District-wise civic issue analytics: verification rates, active solutions, industry commitment and closed impact across Jharkhand.",
      },
      { property: "og:title", content: "Oversight & analytics — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Verification rates, solution stages and committed industry support by district.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { issues } = useCivic();
  const byDistrict = Object.entries(
    issues.reduce<Record<string, number>>((acc, i) => {
      acc[i.district] = (acc[i.district] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxD = Math.max(...byDistrict.map(([, n]) => n), 1);
  const byCategory = CATEGORIES.map(
    (c) => [c, issues.filter((i) => i.category === c).length] as const,
  ).filter(([, n]) => n > 0);
  const maxC = Math.max(...byCategory.map(([, n]) => n), 1);
  const verified = issues.filter((i) => i.verification?.outcome === "verified").length;
  const rejected = issues.filter((i) => i.verification?.outcome === "rejected").length;
  const pledged = issues
    .flatMap((i) => i.project?.pledges ?? [])
    .reduce((s, p) => s + (p.amountInr ?? 0), 0);

  return (
    <div className="space-y-7">
      <PageHead
        title="Oversight and analytics"
        intro="State-level view of the pipeline: what is reported, what field verification confirms, and what has actually been delivered."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total reports" value={issues.length} />
        <Stat
          label="Verification rate"
          value={`${Math.round((verified / Math.max(verified + rejected, 1)) * 100)}%`}
          hint={`${verified} verified, ${rejected} rejected`}
        />
        <Stat
          label="Active solutions"
          value={issues.filter((i) => i.status === "in_progress").length}
          hint={`${issues.filter((i) => i.status === "solved").length} closed with impact`}
        />
        <Stat label="Industry commitment" value={`Rs ${(pledged / 100000).toFixed(2)} L`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rule-top bg-card p-4">
          <h2 className="font-serif text-lg">Reports by district</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {byDistrict.map(([d, n]) => (
              <li key={d} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-2">
                <span>{d}</span>
                <span className="h-3 bg-secondary">
                  <span className="block h-3 bg-primary" style={{ width: `${(n / maxD) * 100}%` }} />
                </span>
                <span className="text-right text-muted-foreground">{n}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rule-top bg-card p-4">
          <h2 className="font-serif text-lg">Reports by category</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {byCategory.map(([c, n]) => (
              <li key={c} className="grid grid-cols-[10rem_1fr_2rem] items-center gap-2">
                <span>{c}</span>
                <span className="h-3 bg-secondary">
                  <span
                    className="block h-3 bg-chart-2"
                    style={{ width: `${(n / maxC) * 100}%`, backgroundColor: "var(--chart-2)" }}
                  />
                </span>
                <span className="text-right text-muted-foreground">{n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <MapPanel issues={issues} title="State-wide issue map" />

      <section className="rule-top bg-card p-4">
        <h2 className="font-serif text-lg">Pipeline register</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <caption className="sr-only">All issues with stage, district and assigned team</caption>
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Reference</th>
                <th className="py-2 pr-3 font-medium">Issue</th>
                <th className="py-2 pr-3 font-medium">District</th>
                <th className="py-2 pr-3 font-medium">Stage</th>
                <th className="py-2 font-medium">Team</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => (
                <tr key={i.id} className="border-b border-border align-top">
                  <td className="py-2 pr-3 font-mono text-xs">{i.id}</td>
                  <td className="max-w-80 py-2 pr-3">
                    <Link to="/issues/$issueId" params={{ issueId: i.id }} className="hover:underline">
                      {i.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{i.district}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {i.project ? `${i.project.team}, ${i.project.university}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
