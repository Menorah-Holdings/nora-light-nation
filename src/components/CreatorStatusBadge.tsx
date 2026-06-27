import { CreatorStatus, creatorBadgeLabel } from "@/lib/user";
import { BadgeCheck, Clock, Headphones, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const CreatorStatusBadge = ({ status, className }: { status: CreatorStatus; className?: string }) => {
  const label = creatorBadgeLabel(status);
  const map: Record<CreatorStatus, { icon: typeof BadgeCheck; cls: string }> = {
    "Approved": { icon: BadgeCheck, cls: "bg-gold/15 text-gold ring-gold/40" },
    "Under Review": { icon: Clock, cls: "bg-red/15 text-red-foreground ring-red/40 text-foreground" },
    "Not Applied": { icon: Headphones, cls: "bg-secondary/60 text-muted-foreground ring-border" },
    "Rejected": { icon: XCircle, cls: "bg-destructive/15 text-destructive ring-destructive/40" },
  };
  const { icon: Icon, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1", cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};
