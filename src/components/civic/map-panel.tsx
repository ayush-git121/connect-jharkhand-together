import { Link } from "@tanstack/react-router";
import type { Issue } from "@/lib/civic-types";

// Approximate Jharkhand bounding box, used for a schematic (non-tiled) locator map.
const BOX = { minLat: 21.9, maxLat: 25.5, minLng: 83.2, maxLng: 88.1 };

const pos = (lat: number, lng: number) => ({
  left: `${((lng - BOX.minLng) / (BOX.maxLng - BOX.minLng)) * 100}%`,
  top: `${((BOX.maxLat - lat) / (BOX.maxLat - BOX.minLat)) * 100}%`,
});

const TONE: Record<string, string> = {
  solved: "bg-verified",
  in_progress: "bg-primary",
  ps_approved: "bg-primary/70",
  ps_draft: "bg-accent-foreground",
  verified: "bg-verified/70",
  verifying: "bg-pending",
  reported: "bg-muted-foreground",
  rejected: "bg-destructive",
};

export function MapPanel({ issues, title = "Issue locations" }: { issues: Issue[]; title?: string }) {
  return (
    <section className="rule-top bg-card p-4" aria-label={title}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Schematic locator for Jharkhand (21.9–25.5°N, 83.2–88.1°E). Each marker is a reported location.
      </p>
      <div className="relative mt-3 aspect-[4/3] w-full border bg-surface">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          {[25, 50, 75].map((v) => (
            <div key={`h${v}`} className="absolute w-full border-t border-border" style={{ top: `${v}%` }} />
          ))}
          {[25, 50, 75].map((v) => (
            <div key={`v${v}`} className="absolute h-full border-l border-border" style={{ left: `${v}%` }} />
          ))}
        </div>
        {issues.map((i) => (
          <Link
            key={i.id}
            to="/issues/$issueId"
            params={{ issueId: i.id }}
            className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:z-10"
            style={pos(i.lat, i.lng)}
            title={`${i.village}, ${i.district} — ${i.title}`}
            aria-label={`${i.village}, ${i.district}: ${i.title}`}
          >
            <span className={`block size-3 rounded-full ring-2 ring-card ${TONE[i.status]}`} />
          </Link>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {[
          ["Reported", "bg-muted-foreground"],
          ["Verifying", "bg-pending"],
          ["Verified", "bg-verified/70"],
          ["In progress", "bg-primary"],
          ["Solved", "bg-verified"],
          ["Not verified", "bg-destructive"],
        ].map(([label, tone]) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${tone}`} aria-hidden /> {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
