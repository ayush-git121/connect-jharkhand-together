import { STATUS_LABEL, type IssueStatus } from "@/lib/civic-types";
import { cn } from "@/lib/utils";

const TONE: Record<IssueStatus, string> = {
  reported: "bg-muted text-muted-foreground border-border",
  verifying: "bg-pending/20 text-pending-foreground border-pending/40",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  verified: "bg-verified/12 text-verified border-verified/35",
  ps_draft: "bg-accent text-accent-foreground border-accent-foreground/25",
  ps_approved: "bg-primary/10 text-primary border-primary/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  solved: "bg-verified text-verified-foreground border-verified",
};

export function StatusBadge({ status, className }: { status: IssueStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        TONE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rule-top bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
