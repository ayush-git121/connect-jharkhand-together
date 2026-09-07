import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { MapPanel } from "@/components/civic/map-panel";
import { PageHead } from "@/components/civic/shell";
import { StatusBadge } from "@/components/civic/status-badge";
import { reporterLabel, useCivic } from "@/lib/civic-store";
import { CATEGORIES, STATUS_LABEL, type IssueStatus } from "@/lib/civic-types";
import { DISTRICTS } from "@/lib/civic-data";

export const Route = createFileRoute("/issues")({
  head: () => ({
    meta: [
      { title: "Issue register — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "Search and filter every reported civic issue in Jharkhand by district, category and verification status.",
      },
      { property: "og:title", content: "Issue register — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Every reported issue, its verification outcome and the team working on it.",
      },
    ],
  }),
  component: IssuesLayout,
});

function IssuesLayout() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/issues/$issueId");
  return isChild ? <Outlet /> : <IssueRegister />;
}

const STATUSES = Object.keys(STATUS_LABEL) as IssueStatus[];

function IssueRegister() {
  const { issues, role } = useCivic();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      issues.filter((i) => {
        const hay = `${i.id} ${i.title} ${i.description} ${i.village} ${i.panchayat} ${i.block} ${i.district}`.toLowerCase();
        return (
          hay.includes(q.toLowerCase()) &&
          (district === "all" || i.district === district) &&
          (category === "all" || i.category === category) &&
          (status === "all" || i.status === status)
        );
      }),
    [issues, q, district, category, status],
  );

  return (
    <div className="space-y-6">
      <PageHead
        title="Issue register"
        intro="Every report, with its verification outcome and current stage. Reporter contact details are withheld from research and industry views."
      />

      <form
        className="grid gap-3 border border-border bg-card p-4 md:grid-cols-4"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Search</span>
          <span className="flex items-center gap-2 border border-input bg-background px-2">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Village, block, issue ID or keyword"
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </span>
        </label>
        <Select label="District" value={district} onChange={setDistrict} options={DISTRICTS} />
        <Select label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
        <div className="md:col-span-4">
          <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Stage</span>
          <div className="flex flex-wrap gap-1.5">
            {["all", ...STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`border px-2.5 py-1 text-xs ${
                  status === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-secondary"
                }`}
              >
                {s === "all" ? "All stages" : STATUS_LABEL[s as IssueStatus]}
              </button>
            ))}
          </div>
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} of {issues.length} issues shown
          </p>
          {filtered.map((i) => {
            const rep = reporterLabel(i, role);
            return (
              <article key={i.id} className="rule-top bg-card p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{i.id}</span>
                  <StatusBadge status={i.status} />
                  <span className="border border-border px-1.5 py-0.5">{i.category}</span>
                </div>
                <h2 className="mt-2 font-serif text-lg leading-snug">
                  <Link to="/issues/$issueId" params={{ issueId: i.id }} className="hover:underline">
                    {i.title}
                  </Link>
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden />
                  {i.village}, {i.panchayat} Panchayat, {i.block} block, {i.district}
                </p>
                <p className="mt-2 line-clamp-2 text-sm">{i.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Reported by {rep.name} · {i.peopleAffected} people affected · {i.photos.length} photo(s)
                </p>
              </article>
            );
          })}
          {filtered.length === 0 ? (
            <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No issues match these filters.
            </p>
          ) : null}
        </div>
        <div className="lg:sticky lg:top-4 lg:self-start">
          <MapPanel issues={filtered} title="Filtered locations" />
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label>
      <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-input bg-background px-2 py-2 text-sm"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
