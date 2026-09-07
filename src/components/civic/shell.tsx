import { Link, type LinkProps } from "@tanstack/react-router";
import { Bell, Landmark } from "lucide-react";
import { useCivic } from "@/lib/civic-store";
import { ROLES, type Role } from "@/lib/civic-types";

type NavTo = NonNullable<LinkProps["to"]>;

const NAV: Record<Role, { to: NavTo; label: string }[]> = {
  citizen: [
    { to: "/", label: "Overview" },
    { to: "/report", label: "Report an issue" },
    { to: "/issues", label: "Issue register" },
  ],
  ngo: [
    { to: "/", label: "Overview" },
    { to: "/report", label: "Report an issue" },
    { to: "/issues", label: "Issue register" },
  ],
  panchayat: [
    { to: "/", label: "Overview" },
    { to: "/panchayat", label: "Verification queue" },
    { to: "/issues", label: "Issue register" },
  ],
  university: [
    { to: "/", label: "Overview" },
    { to: "/problem-statements", label: "Problem statements" },
    { to: "/university", label: "Our projects" },
    { to: "/issues", label: "Issue register" },
  ],
  industry: [
    { to: "/", label: "Overview" },
    { to: "/industry", label: "Support & milestones" },
    { to: "/issues", label: "Issue register" },
  ],
  government: [
    { to: "/", label: "Overview" },
    { to: "/problem-statements", label: "AI statement review" },
    { to: "/admin", label: "Oversight & analytics" },
    { to: "/issues", label: "Issue register" },
  ],
};

export function Shell({ children }: { children: React.ReactNode }) {
  const { role, setRole, unread } = useCivic();
  const active = ROLES.find((r) => r.id === role)!;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-card focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center bg-primary text-primary-foreground">
              <Landmark className="size-4" aria-hidden />
            </span>
            <span>
              <span className="block font-serif text-base leading-tight">Jharkhand Civic Connect</span>
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                Citizen reports · Panchayat verification · Research solutions
              </span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground" htmlFor="role-switch">
              Signed in as
            </label>
            <select
              id="role-switch"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="border border-input bg-background px-2 py-1.5 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <Link
              to="/notifications"
              className="relative flex items-center gap-1.5 border border-input px-2 py-1.5 text-sm hover:bg-secondary"
            >
              <Bell className="size-4" aria-hidden />
              <span className="sr-only">Notifications</span>
              <span aria-label={`${unread} unread notifications`}>{unread}</span>
            </Link>
          </div>
        </div>
        <nav aria-label="Main" className="mx-auto max-w-6xl px-4">
          <ul className="-mb-px flex flex-wrap gap-1 text-sm">
            {NAV[role].map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  activeOptions={{ exact: n.to === "/" }}
                  className="inline-block border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[status=active]:border-primary data-[status=active]:font-medium data-[status=active]:text-primary"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="border-b border-border bg-surface">
        <p className="mx-auto max-w-6xl px-4 py-2 text-xs text-muted-foreground">
          <strong className="font-medium text-foreground">{active.label}</strong> — {active.org}. {active.blurb}
        </p>
      </div>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          Demonstration prototype. Data shown is illustrative and held in browser memory only. Citizen
          contact details are never exposed to university or industry users.
        </div>
      </footer>
    </div>
  );
}

export function PageHead({
  title,
  intro,
  aside,
}: {
  title: string;
  intro?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h1 className="font-serif text-2xl">{title}</h1>
        {intro ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{intro}</p> : null}
      </div>
      {aside}
    </div>
  );
}
