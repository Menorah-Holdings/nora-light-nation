import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import {
  LayoutDashboard, FileVideo, UserCog, Radio, Users as UsersIcon,
  CreditCard, ShieldAlert, BarChart3, Settings as SettingsIcon,
  Search, Check, X, Eye, Star, Trash2, Pause, Play, TrendingUp, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useUser, MOCK_USERS, creatorBadgeLabel } from "@/lib/user";
import { CreatorStatusBadge } from "@/components/CreatorStatusBadge";
import { content as mockContent, liveEvents } from "@/lib/mockData";
import { useCreatorsList } from "@/lib/api/hooks/useCreators";
import {
  useAdminApplications,
  useRefreshAdminAnalytics,
  useReviewAdminApplication,
  useUpdateAdminCreatorStatus,
} from "@/lib/api/hooks/useAdmin";
import { buildAdminReviewApplicationInput } from "@/lib/api/adminPayloads";
import type { ApiCreatorApplication } from "@/lib/api/types";

type Section =
  | "dashboard" | "content" | "creators" | "live" | "users"
  | "subscriptions" | "reports" | "analytics" | "settings";

const nav: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "content", label: "Content Management", icon: FileVideo },
  { id: "creators", label: "Creator Management", icon: UserCog },
  { id: "live", label: "Live Event Management", icon: Radio },
  { id: "users", label: "User Management", icon: UsersIcon },
  { id: "subscriptions", label: "Subscription Management", icon: CreditCard },
  { id: "reports", label: "Reports & Moderation", icon: ShieldAlert },
  { id: "analytics", label: "Platform Analytics", icon: BarChart3 },
  { id: "settings", label: "Platform Settings", icon: SettingsIcon },
];

/* ---------- Reusable bits ---------- */

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl bg-card-gradient ring-1 ring-border/60 p-6", className)}>{children}</div>
);

const Stat = ({ label, value, sub, icon: Icon, tone = "gold" }: {
  label: string; value: string; sub?: string; icon: any; tone?: "gold" | "red";
}) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="mt-3 font-display text-3xl">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
      <div className={cn(
        "h-11 w-11 grid place-items-center rounded-xl ring-1",
        tone === "gold" ? "bg-gold/10 ring-gold/30 text-gold" : "bg-red/10 ring-red/30 text-red"
      )}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </Card>
);

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.25em] text-gold">NoraPlus Admin</p>
    <h1 className="mt-2 font-display text-3xl md:text-4xl">{title}</h1>
    {subtitle && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
  </div>
);

const Pill = ({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "gold" | "red" | "green" | "muted" }) => {
  const map = {
    default: "bg-secondary/60 text-foreground ring-border",
    gold: "bg-gold/15 text-gold ring-gold/30",
    red: "bg-red/15 text-red ring-red/30",
    green: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
    muted: "bg-muted text-muted-foreground ring-border",
  } as const;
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ring-1", map[tone])}>{children}</span>;
};

const Toolbar = ({ placeholder, children }: { placeholder: string; children?: React.ReactNode }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="relative max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const RowAction = ({ icon: Icon, label, onClick, tone = "default" }: { icon: any; label: string; onClick: () => void; tone?: "default" | "red" | "gold" }) => (
  <button
    onClick={onClick}
    title={label}
    className={cn(
      "inline-flex items-center justify-center h-8 w-8 rounded-lg ring-1 transition-colors",
      tone === "red" && "ring-red/40 text-red hover:bg-red/10",
      tone === "gold" && "ring-gold/40 text-gold hover:bg-gold/10",
      tone === "default" && "ring-border text-muted-foreground hover:text-foreground hover:bg-secondary/60",
    )}
  >
    <Icon className="h-3.5 w-3.5" />
  </button>
);

/* ---------- Sections ---------- */

const DashboardView = () => {
  const pendingApps = MOCK_USERS.filter(u => u.creator_status === "Under Review");
  const activity = [
    { t: "Creator application", who: "Ada Okafor", time: "2m ago", tone: "gold" as const },
    { t: "Content published", who: "Sounds of Heaven - Anchored Live Sessions", time: "18m ago", tone: "green" as const },
    { t: "Subscription upgraded", who: "u-1842 -> Premium", time: "1h ago", tone: "default" as const },
    { t: "Report filed", who: "Comment on \"The Narrow Way\"", time: "3h ago", tone: "red" as const },
    { t: "Live event started", who: "Youth Revival - Nairobi", time: "5h ago", tone: "red" as const },
  ];
  return (
    <div className="space-y-8">
      <SectionHeader title="Platform Dashboard" subtitle="A live snapshot of activity across the NoraPlus platform." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Users" value="48,210" sub="+412 this week" icon={UsersIcon} />
        <Stat label="Total Creators" value="1,284" sub="+27 this week" icon={UserCog} />
        <Stat label="Active Subscribers" value="12,940" sub="78% retention" icon={CreditCard} tone="red" />
        <Stat label="Revenue (MTD)" value="$184,250" sub="+12.4% MoM" icon={DollarSign} tone="gold" />
        <Stat label="Live Events" value="6" sub="2 streaming now" icon={Radio} tone="red" />
        <Stat label="Published Content" value="9,418" sub="audio / video / live" icon={FileVideo} />
        <Stat label="Pending Applications" value={String(pendingApps.length)} sub="awaiting review" icon={UserCog} tone="gold" />
        <Stat label="Pending Content Reviews" value="14" sub="moderation queue" icon={ShieldAlert} tone="red" />
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Recent Platform Activity</h3>
          <Pill tone="muted">Last 24 hours</Pill>
        </div>
        <ul className="mt-5 divide-y divide-border/60">
          {activity.map((a, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  a.tone === "gold" && "bg-gold",
                  a.tone === "red" && "bg-red",
                  a.tone === "green" && "bg-emerald-400",
                  a.tone === "default" && "bg-muted-foreground",
                )} />
                <div>
                  <p className="text-sm">{a.t}</p>
                  <p className="text-xs text-muted-foreground">{a.who}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

const ContentView = () => {
  const [filter, setFilter] = useState<"all" | "audio" | "video" | "live">("all");
  const items = useMemo(() => {
    if (filter === "all") return mockContent;
    if (filter === "live") return mockContent.filter(c => c.medium === "live");
    return mockContent.filter(c => c.medium === filter);
  }, [filter]);
  const act = (label: string, title: string) => toast({ title: label, description: title });

  return (
    <div className="space-y-6">
      <SectionHeader title="Content Management" subtitle="Approve, moderate, feature and manage every piece of content on NoraPlus." />
      <Toolbar placeholder="Search content, creators, titles...">
        {(["all", "audio", "video", "live"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-xs capitalize ring-1 transition-colors",
              filter === f ? "bg-gold/10 text-gold ring-gold/40" : "ring-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </Toolbar>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Creator</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map(c => (
                <tr key={c.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.creator}</td>
                  <td className="px-5 py-3"><Pill tone="muted">{c.type}</Pill></td>
                  <td className="px-5 py-3"><Pill tone="green">Published</Pill></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Eye} label="View" onClick={() => act("Viewing", c.title)} />
                      <RowAction icon={Star} label="Feature" tone="gold" onClick={() => act("Featured", c.title)} />
                      <RowAction icon={Check} label="Approve" onClick={() => act("Approved", c.title)} />
                      <RowAction icon={X} label="Reject" tone="red" onClick={() => act("Rejected", c.title)} />
                      <RowAction icon={Trash2} label="Delete" tone="red" onClick={() => act("Deleted", c.title)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const CreatorsView = () => {
  const applicationsQuery = useAdminApplications({ status: "PENDING", limit: 50 });
  const creatorsQuery = useCreatorsList({ limit: 50 });
  const reviewApplication = useReviewAdminApplication();
  const updateCreatorStatus = useUpdateAdminCreatorStatus();

  const review = (application: ApiCreatorApplication, status: "APPROVED" | "REJECTED") => {
    const declineReason = status === "REJECTED" ? window.prompt("Decline reason")?.trim() : undefined;
    if (status === "REJECTED" && !declineReason) return;

    reviewApplication.mutate(
      {
        id: application.id,
        input: buildAdminReviewApplicationInput(application, status, declineReason),
      },
      {
        onSuccess: () => toast({ title: status === "APPROVED" ? "Application approved" : "Application declined" }),
        onError: (error) =>
          toast({
            title: "Review failed",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const toggleCreator = (id: string, isActive: boolean | undefined) => {
    updateCreatorStatus.mutate(
      { id, input: { isActive: !isActive } },
      {
        onSuccess: () => toast({ title: isActive ? "Creator deactivated" : "Creator activated" }),
        onError: (error) =>
          toast({
            title: "Status update failed",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Creator Management" subtitle="Review applications, approve creators, and manage activation." />
      <Toolbar placeholder="Search creators or applicants..." />
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border/60 px-5 py-4">
          <h3 className="font-display text-lg">Pending Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Applicant</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {applicationsQuery.isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading applications...</td></tr>}
              {!applicationsQuery.isLoading && (applicationsQuery.data ?? []).length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No pending applications.</td></tr>}
              {(applicationsQuery.data ?? []).map(app => (
                <tr key={app.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gold-gradient grid place-items-center text-xs font-semibold text-primary-foreground">{app.displayName[0]?.toUpperCase() ?? "C"}</div>
                      <div>
                        <p className="font-medium">{app.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{app.requestedHandle ?? "pending-handle"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{app.creatorType === "INDIVIDUAL" ? "Individual" : "Organization"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{app.category}</td>
                  <td className="px-5 py-3"><Pill tone="gold">Pending</Pill></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Check} label="Approve" tone="gold" onClick={() => review(app, "APPROVED")} />
                      <RowAction icon={X} label="Decline" tone="red" onClick={() => review(app, "REJECTED")} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border/60 px-5 py-4">
          <h3 className="font-display text-lg">Active Creator Profiles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Creator</th>
                <th className="px-5 py-3 text-left">Handle</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {creatorsQuery.isLoading && <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Loading creators...</td></tr>}
              {(creatorsQuery.data ?? []).map(creator => (
                <tr key={creator.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 font-medium">{creator.displayName}</td>
                  <td className="px-5 py-3 text-muted-foreground">@{creator.handle ?? creator.id}</td>
                  <td className="px-5 py-3"><Pill tone={creator.isActive === false ? "muted" : "green"}>{creator.isActive === false ? "Inactive" : "Active"}</Pill></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Eye} label="View profile" onClick={() => toast({ title: `Viewing ${creator.displayName}` })} />
                      <RowAction icon={creator.isActive === false ? Play : Pause} label={creator.isActive === false ? "Activate" : "Deactivate"} tone={creator.isActive === false ? "gold" : "red"} onClick={() => toggleCreator(creator.id, creator.isActive !== false)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const LiveView = () => (
  <div className="space-y-6">
    <SectionHeader title="Live Event Management" subtitle="Approve, monitor and moderate scheduled and active live events." />
    <Toolbar placeholder="Search live events..." />
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {liveEvents.map(e => (
        <Card key={e.id} className="p-0 overflow-hidden">
          <img src={e.image} alt="" className="h-40 w-full object-cover" />
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Pill tone={e.status === "live" ? "red" : e.status === "replay" ? "muted" : "gold"}>
                {e.status === "live" ? "Live now" : e.status === "replay" ? "Replay" : "Scheduled"}
              </Pill>
              <Pill tone={e.access === "Paid" ? "gold" : "muted"}>{e.access}</Pill>
            </div>
            <div>
              <p className="font-display text-lg">{e.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{e.host} / {e.date} / {e.time}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RowAction icon={Check} label="Approve" tone="gold" onClick={() => toast({ title: `${e.title} approved` })} />
              <RowAction icon={Star} label="Feature" tone="gold" onClick={() => toast({ title: `${e.title} featured` })} />
              <RowAction icon={Eye} label="Monitor" onClick={() => toast({ title: `Monitoring ${e.title}` })} />
              <RowAction icon={X} label="End / Cancel" tone="red" onClick={() => toast({ title: `${e.title} ended` })} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const UsersView = () => (
  <div className="space-y-6">
    <SectionHeader title="User Management" subtitle="Search, suspend, reactivate and manage listener accounts." />
    <Toolbar placeholder="Search users by name, email or ID..." />
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Creator Status</th>
              <th className="px-5 py-3 text-left">Subscription</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {MOCK_USERS.map((u, i) => (
              <tr key={u.id} className="hover:bg-secondary/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gold-gradient grid place-items-center text-xs font-semibold text-primary-foreground">{u.avatarInitial}</div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3 text-muted-foreground">{creatorBadgeLabel(u.creator_status)}</td>
                <td className="px-5 py-3"><Pill tone={i % 3 === 0 ? "gold" : i % 3 === 1 ? "muted" : "green"}>{["Premium", "Free", "Essential"][i % 3]}</Pill></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <RowAction icon={Eye} label="View" onClick={() => toast({ title: `Viewing ${u.name}` })} />
                    <RowAction icon={Pause} label="Suspend" tone="red" onClick={() => toast({ title: `${u.name} suspended` })} />
                    <RowAction icon={Play} label="Reactivate" tone="gold" onClick={() => toast({ title: `${u.name} reactivated` })} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

const SubscriptionsView = () => (
  <div className="space-y-6">
    <SectionHeader title="Subscription Management" subtitle="View subscribers, manage plans, refunds and payment history." />
    <div className="grid gap-5 md:grid-cols-4">
      <Stat label="Free Trial" value="3,210" icon={CreditCard} />
      <Stat label="Free" value="32,070" icon={CreditCard} />
      <Stat label="Essential" value="8,124" icon={CreditCard} tone="gold" />
      <Stat label="Premium" value="4,816" icon={CreditCard} tone="red" />
    </div>
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Subscriber</th>
              <th className="px-5 py-3 text-left">Plan</th>
              <th className="px-5 py-3 text-left">Renews</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {MOCK_USERS.map((u, i) => (
              <tr key={u.id} className="hover:bg-secondary/30">
                <td className="px-5 py-3">{u.name}</td>
                <td className="px-5 py-3"><Pill tone={i % 2 ? "gold" : "muted"}>{["Essential", "Premium", "Free", "Free Trial", "Premium"][i % 5]}</Pill></td>
                <td className="px-5 py-3 text-muted-foreground">Jul {10 + i}, 2026</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <RowAction icon={TrendingUp} label="Upgrade" tone="gold" onClick={() => toast({ title: `Upgraded ${u.name}` })} />
                    <RowAction icon={DollarSign} label="Refund" onClick={() => toast({ title: `Refund issued to ${u.name}` })} />
                    <RowAction icon={X} label="Cancel" tone="red" onClick={() => toast({ title: `Cancelled ${u.name}'s subscription` })} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

const ReportsView = () => {
  const reports = [
    { kind: "Reported content", subject: "Comment on \"The Narrow Way\"", reason: "Harassment", severity: "high" as const },
    { kind: "Copyright claim", subject: "Sounds of Worship Vol. 1", reason: "DMCA notice", severity: "high" as const },
    { kind: "Reported user", subject: "@kingdomvoice22", reason: "Spam", severity: "med" as const },
    { kind: "Community guideline", subject: "Live chat - Youth Revival", reason: "Hate speech", severity: "high" as const },
    { kind: "Reported content", subject: "Grace in the Marketplace", reason: "Misleading", severity: "low" as const },
  ];
  const tone = (s: "high" | "med" | "low") => s === "high" ? "red" : s === "med" ? "gold" : "muted";
  return (
    <div className="space-y-6">
      <SectionHeader title="Reports & Moderation" subtitle="Triage reports, copyright claims and community safety violations." />
      <div className="grid gap-5 md:grid-cols-3">
        <Stat label="Open Reports" value="38" icon={ShieldAlert} tone="red" />
        <Stat label="In Review" value="11" icon={Eye} tone="gold" />
        <Stat label="Resolved (7d)" value="142" icon={Check} />
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Subject</th>
                <th className="px-5 py-3 text-left">Reason</th>
                <th className="px-5 py-3 text-left">Severity</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 text-muted-foreground">{r.kind}</td>
                  <td className="px-5 py-3 font-medium">{r.subject}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.reason}</td>
                  <td className="px-5 py-3"><Pill tone={tone(r.severity)}>{r.severity.toUpperCase()}</Pill></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Eye} label="Review" onClick={() => toast({ title: "Opening review queue" })} />
                      <RowAction icon={Check} label="Resolve" tone="gold" onClick={() => toast({ title: "Marked resolved" })} />
                      <RowAction icon={X} label="Dismiss" tone="red" onClick={() => toast({ title: "Report dismissed" })} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const AnalyticsView = () => {
  const refreshAnalytics = useRefreshAdminAnalytics();
  const bars = [42, 58, 49, 73, 65, 84, 91, 78, 96, 88, 102, 118];
  const max = Math.max(...bars);
  const refresh = () => {
    refreshAnalytics.mutate(undefined, {
      onSuccess: (result) => toast({ title: "Analytics refresh queued", description: `${result.refreshed} records refreshed.` }),
      onError: (error) =>
        toast({
          title: "Refresh failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SectionHeader title="Platform Analytics" subtitle="Daily and monthly engagement, growth and revenue across NoraPlus." />
        <button
          onClick={refresh}
          disabled={refreshAnalytics.isPending}
          className="inline-flex items-center justify-center rounded-full border border-gold/40 px-4 py-2 text-sm text-gold transition hover:bg-gold/10 disabled:opacity-50"
        >
          Refresh Analytics
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Daily Active Users" value="22,418" sub="+6.4% WoW" icon={UsersIcon} />
        <Stat label="Monthly Active Users" value="184,920" sub="+11.2% MoM" icon={TrendingUp} tone="gold" />
        <Stat label="Audio Plays (30d)" value="3.42M" icon={Play} />
        <Stat label="Video Views (30d)" value="1.18M" icon={FileVideo} tone="red" />
        <Stat label="Live Attendance" value="84,210" icon={Radio} tone="red" />
        <Stat label="Subscription Growth" value="+842" sub="net new (30d)" icon={CreditCard} tone="gold" />
        <Stat label="Revenue (30d)" value="$184,250" icon={DollarSign} tone="gold" />
        <Stat label="Top Region" value="West Africa" sub="38% of plays" icon={TrendingUp} />
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Plays - Last 12 months</h3>
          <Pill tone="gold">Trending up</Pill>
        </div>
        <div className="mt-6 flex h-48 items-end gap-3">
          {bars.map((b, i) => (
            <div key={i} className="group relative flex-1">
              <div className="w-full rounded-t-md bg-red-gradient transition-all" style={{ height: `${(b / max) * 100}%` }} />
              <p className="mt-2 text-center text-[10px] text-muted-foreground">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg">Top Creators</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {["Sounds of Heaven", "Pastor David Adeleke", "Lightwave Films", "Kingdom Conversations", "Grace Iweka"].map((n, i) => (
              <li key={n} className="flex items-center justify-between">
                <span><span className="text-gold mr-2">{i + 1}.</span>{n}</span>
                <span className="text-muted-foreground text-xs">{(48 - i * 6)}.{i}M plays</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-display text-lg">Most Popular Content</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {mockContent.slice(0, 5).map((c, i) => (
              <li key={c.id} className="flex items-center justify-between">
                <span><span className="text-gold mr-2">{i + 1}.</span>{c.title}</span>
                <span className="text-muted-foreground text-xs">{(2.4 - i * 0.3).toFixed(1)}M</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const SettingsView = () => {
  const groups = [
    { title: "Subscription Plans", desc: "Free Trial, Free, Essential, Premium" },
    { title: "Languages", desc: "Supported listener and creator languages" },
    { title: "Regions", desc: "Supported regions and localization rules" },
    { title: "Notification Templates", desc: "Email and in-app notification copy" },
    { title: "Creator Guidelines", desc: "Eligibility, content rules, monetization terms" },
    { title: "Community Guidelines", desc: "Behavior standards across NoraPlus" },
    { title: "Content Categories", desc: "Audio, video and live taxonomies" },
    { title: "Homepage Featured Content", desc: "Hero rails and editor's picks" },
    { title: "Platform Announcements", desc: "Global in-app and email announcements" },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader title="Platform Settings" subtitle="Global NoraPlus configuration managed by the NoraPlus team." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(g => (
          <button key={g.title} onClick={() => toast({ title: `${g.title}`, description: "Settings panel opened." })}
            className="text-left rounded-2xl bg-card-gradient ring-1 ring-border/60 p-5 hover:ring-gold/40 transition-all">
            <p className="font-display text-base">{g.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
            <span className="mt-4 inline-block text-xs text-gold">Configure -&gt;</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------- Page shell ---------- */

const NoraPlusAdmin = () => {
  const { isNoraTeam } = useUser();
  const [section, setSection] = useState<Section>("dashboard");

  if (!isNoraTeam) return <Navigate to="/app" replace />;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-3">
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gold">NoraPlus Admin</p>
          <nav className="space-y-1">
            {nav.map(n => {
              const active = section === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-secondary text-gold ring-1 ring-gold/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
      <div>
        {section === "dashboard" && <DashboardView />}
        {section === "content" && <ContentView />}
        {section === "creators" && <CreatorsView />}
        {section === "live" && <LiveView />}
        {section === "users" && <UsersView />}
        {section === "subscriptions" && <SubscriptionsView />}
        {section === "reports" && <ReportsView />}
        {section === "analytics" && <AnalyticsView />}
        {section === "settings" && <SettingsView />}
      </div>
    </div>
  );
};

export default NoraPlusAdmin;
