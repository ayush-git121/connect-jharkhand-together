import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/civic/shell";
import { useCivic } from "@/lib/civic-store";
import { ROLES } from "@/lib/civic-types";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "Role-specific alerts: new reports to verify, statements to review, projects to adopt and milestones needing support.",
      },
      { property: "og:title", content: "Notifications — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Every step in the civic pipeline notifies the role that must act next.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, role, markAllRead } = useCivic();
  const mine = notifications.filter((n) => n.to.includes(role));
  const roleLabel = ROLES.find((r) => r.id === role)!.label;

  return (
    <div className="space-y-6">
      <PageHead
        title="Notifications"
        intro={`Alerts addressed to the ${roleLabel} role. Switching roles in the header changes what you see here.`}
        aside={
          <button
            onClick={markAllRead}
            className="border border-input px-3 py-1.5 text-sm hover:bg-secondary"
          >
            Mark all as read
          </button>
        }
      />
      <ul className="space-y-2">
        {mine.map((n) => (
          <li
            key={n.id}
            className={`border p-4 text-sm ${n.read ? "border-border bg-card" : "border-primary/40 bg-accent"}`}
          >
            <p className="text-xs text-muted-foreground">{n.at.slice(0, 10)}</p>
            <p className="mt-1">{n.text}</p>
            {n.issueId ? (
              <Link
                to="/issues/$issueId"
                params={{ issueId: n.issueId }}
                className="mt-1 inline-block text-sm text-primary hover:underline"
              >
                Open {n.issueId}
              </Link>
            ) : null}
          </li>
        ))}
        {mine.length === 0 ? (
          <li className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nothing for this role yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
