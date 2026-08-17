import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileVideo,
  UserCog,
  Radio,
  Users as UsersIcon,
  CreditCard,
  ShieldAlert,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Check,
  X,
  Eye,
  Star,
  Trash2,
  Pause,
  Play,
  Plus,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/lib/user";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreatorDetail, useCreatorsList } from "@/lib/api/hooks/useCreators";
import { useContentDetail } from "@/lib/api/hooks/useContent";
import {
  useAdminAnnouncements,
  useAdminApplications,
  useAdminDailyAnalytics,
  useAdminContent,
  useAdminGuideline,
  useAdminLanguages,
  useAdminLiveEvents,
  useAdminNotificationTemplates,
  useAdminRegions,
  useAdminReports,
  useAdminStats,
  useAdminUser,
  useAdminUsers,
  useCreateAdminAnnouncement,
  useCreateAdminLanguage,
  useCreateAdminNotificationTemplate,
  useCreateAdminRegion,
  useDeleteAdminAnnouncement,
  useDeleteAdminContent,
  useDeleteAdminLanguage,
  useDeleteAdminNotificationTemplate,
  useDeleteAdminRegion,
  useRefreshAdminAnalytics,
  useReviewAdminApplication,
  useReviewReport,
  useUpdateAdminAnnouncement,
  useUpdateAdminContent,
  useUpdateAdminCreatorStatus,
  useUpdateAdminLanguage,
  useUpdateAdminLiveEvent,
  useUpdateAdminRegion,
  useUpdateAdminUser,
  useUpsertAdminGuideline,
} from "@/lib/api/hooks/useAdmin";
import { buildAdminReviewApplicationInput } from "@/lib/api/adminPayloads";
import { adaptContent, adaptCreator, formatCategory } from "@/lib/api/adapters";
import type {
  ApiCreatorApplication,
  ApiLiveEvent,
  ApiPlatformAnnouncement,
  ApiPlatformListItem,
  ApiReport,
  ApiUser,
} from "@/lib/api/types";

type Section = "dashboard" | "content" | "creators" | "live" | "users" | "subscriptions" | "reports" | "analytics" | "settings";

const nav: { id: Section; label: string; icon: React.ElementType }[] = [
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

const Stat = ({
  label,
  value,
  sub,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  tone?: "gold" | "red";
}) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="mt-3 font-display text-3xl">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
      <div
        className={cn(
          "h-11 w-11 grid place-items-center rounded-xl ring-1",
          tone === "gold" ? "bg-gold/10 ring-gold/30 text-gold" : "bg-red/10 ring-red/30 text-red",
        )}
      >
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

const Toolbar = ({
  placeholder,
  value,
  onChange,
  children,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="relative max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const RowAction = ({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone?: "default" | "red" | "gold";
}) => (
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

const EmptyRow = ({ colSpan, message = "Loading…" }: { colSpan: number; message?: string }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-8 text-center text-sm text-muted-foreground">
      {message}
    </td>
  </tr>
);

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 border-t border-border/60 first:border-t-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm text-right">{value}</span>
  </div>
);

const ContentDetailDialog = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const query = useContentDetail(id ?? undefined);
  const content = query.data ? adaptContent(query.data) : null;

  return (
    <Dialog open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content?.title ?? "Content"}</DialogTitle>
        </DialogHeader>
        {query.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
        ) : query.data ? (
          <div>
            {content?.image && <img src={content.image} alt="" className="mb-3 h-40 w-full rounded-xl object-cover" />}
            <DetailRow label="Creator" value={query.data.creator?.displayName ?? "—"} />
            <DetailRow label="Type" value={query.data.type} />
            <DetailRow label="Category" value={formatCategory(query.data.category)} />
            <DetailRow label="Status" value={query.data.status} />
            <DetailRow label="Visibility" value={query.data.visibility} />
            <DetailRow label="Views" value={query.data.viewCount ?? 0} />
            <DetailRow label="Published" value={query.data.publishedAt ? new Date(query.data.publishedAt).toLocaleDateString() : "—"} />
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Could not load this content.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CreatorDetailDialog = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const query = useCreatorDetail(id ?? undefined);
  const creator = query.data ? adaptCreator(query.data) : null;

  return (
    <Dialog open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{creator?.name ?? "Creator"}</DialogTitle>
        </DialogHeader>
        {query.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
        ) : query.data ? (
          <div>
            {creator?.image && <img src={creator.image} alt="" className="mb-3 h-24 w-24 rounded-full object-cover" />}
            <DetailRow label="Handle" value={query.data.handle ? `@${query.data.handle}` : "—"} />
            <DetailRow label="Type" value={query.data.creatorType} />
            <DetailRow label="Category" value={formatCategory(query.data.category)} />
            <DetailRow label="Followers" value={query.data.followerCount} />
            <DetailRow label="Verified" value={query.data.isVerified ? "Yes" : "No"} />
            <DetailRow label="Status" value={query.data.isActive === false ? "Inactive" : "Active"} />
            <DetailRow label="Joined" value={new Date(query.data.createdAt).toLocaleDateString()} />
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Could not load this creator.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

const UserDetailDialog = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const query = useAdminUser(id ?? undefined);
  const user = query.data;

  return (
    <Dialog open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user?.name || user?.email || "User"}</DialogTitle>
        </DialogHeader>
        {query.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
        ) : user ? (
          <div>
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Role" value={user.role ?? "USER"} />
            <DetailRow label="Subscription" value={user.subscriptionTier ?? "FREE"} />
            <DetailRow label="Status" value={user.isActive === false ? "Suspended" : "Active"} />
            <DetailRow label="Email verified" value={user.emailVerified ? "Yes" : "No"} />
            <DetailRow label="Phone" value={user.phone || "—"} />
            <DetailRow label="Country" value={user.country || "—"} />
            <DetailRow label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} />
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">Could not load this user.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Sections ---------- */

const applicationActivityTone = (status: ApiCreatorApplication["status"]) =>
  status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "gold";

const applicationActivityLabel = (status: ApiCreatorApplication["status"]) =>
  status === "APPROVED" ? "Creator application approved" : status === "REJECTED" ? "Creator application declined" : "Creator application submitted";

const DashboardView = () => {
  const { data: stats } = useAdminStats();
  const recentApplicationsQuery = useAdminApplications({ limit: 5 });
  const activity = (recentApplicationsQuery.data ?? []).map((app) => ({
    t: applicationActivityLabel(app.status),
    who: app.displayName,
    time: new Date(app.reviewedAt ?? app.submittedAt).toLocaleDateString(),
    tone: applicationActivityTone(app.status),
  }));
  return (
    <div className="space-y-8">
      <SectionHeader title="Platform Dashboard" subtitle="A live snapshot of activity across the NoraPlus platform." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Users" value={stats ? stats.users.total.toLocaleString() : "—"} sub="+412 this week" icon={UsersIcon} />
        <Stat label="Total Creators" value={stats ? stats.creators.total.toLocaleString() : "—"} sub="+27 this week" icon={UserCog} />
        <Stat
          label="Active Subscribers"
          value={stats ? stats.users.premium.toLocaleString() : "—"}
          sub="78% retention"
          icon={CreditCard}
          tone="red"
        />
        <Stat label="Revenue (MTD)" value="$184,250" sub="+12.4% MoM" icon={DollarSign} tone="gold" />
        <Stat label="Live Events" value={stats ? String(stats.live.active) : "—"} sub="currently live" icon={Radio} tone="red" />
        <Stat label="Published Content" value={stats ? stats.content.total.toLocaleString() : "—"} sub="audio / video / live" icon={FileVideo} />
        <Stat
          label="Pending Applications"
          value={stats ? String(stats.applications.pending) : "—"}
          sub="awaiting review"
          icon={UserCog}
          tone="gold"
        />
        <Stat label="Pending Content Reviews" value={"0"} sub="moderation queue" icon={ShieldAlert} tone="red" />
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Recent Creator Applications</h3>
          <Pill tone="muted">Most recent 5</Pill>
        </div>
        {recentApplicationsQuery.isLoading && (
          <p className="mt-5 text-center text-sm text-muted-foreground">Loading...</p>
        )}
        {!recentApplicationsQuery.isLoading && activity.length === 0 && (
          <p className="mt-5 text-center text-sm text-muted-foreground">No applications yet.</p>
        )}
        <ul className="mt-5 divide-y divide-border/60">
          {activity.map((a, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    a.tone === "gold" && "bg-gold",
                    a.tone === "red" && "bg-red",
                    a.tone === "green" && "bg-emerald-400",
                  )}
                />
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
  const [search, setSearch] = useState("");
  const [viewContentId, setViewContentId] = useState<string | null>(null);
  const typeQuery = filter === "audio" ? { type: "AUDIO" } : filter === "video" ? { type: "VIDEO" } : undefined;
  const { data: items = [], isLoading } = useAdminContent({ ...typeQuery, search: search.trim() || undefined });
  const deleteContent = useDeleteAdminContent();
  const updateContent = useUpdateAdminContent();

  return (
    <div className="space-y-6">
      <SectionHeader title="Content Management" subtitle="Approve, moderate, feature and manage every piece of content on NoraPlus." />
      <Toolbar placeholder="Search content, creators, titles..." value={search} onChange={setSearch}>
        {(["all", "audio", "video", "live"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-xs capitalize ring-1 transition-colors",
              filter === f ? "bg-gold/10 text-gold ring-gold/40" : "ring-border text-muted-foreground hover:text-foreground",
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
              {isLoading ? (
                <EmptyRow colSpan={5} />
              ) : items.length === 0 ? (
                <EmptyRow colSpan={5} message="No content found." />
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.thumbnailUrl && <img src={c.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                        <span className="font-medium">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{c.creator?.displayName ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Pill tone="muted">{c.type}</Pill>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={c.status === "PUBLISHED" ? "green" : "muted"}>{c.status === "PUBLISHED" ? "Published" : "Draft"}</Pill>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <RowAction icon={Eye} label="View" onClick={() => setViewContentId(c.id)} />
                        <RowAction
                          icon={Star}
                          label={c.isFeatured ? "Unfeature" : "Feature"}
                          tone="gold"
                          onClick={() =>
                            updateContent.mutate(
                              { id: c.id, input: { isFeatured: !c.isFeatured } },
                              {
                                onSuccess: () =>
                                  toast({ title: c.isFeatured ? "Unfeatured" : "Featured", description: c.title }),
                                onError: () =>
                                  toast({ title: "Could not update content", variant: "destructive" }),
                              },
                            )
                          }
                        />
                        <RowAction
                          icon={Trash2}
                          label="Delete"
                          tone="red"
                          onClick={() =>
                            deleteContent.mutate(c.id, {
                              onSuccess: () => toast({ title: "Deleted", description: c.title }),
                            })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <ContentDetailDialog id={viewContentId} onClose={() => setViewContentId(null)} />
    </div>
  );
};

const CreatorsView = () => {
  const [search, setSearch] = useState("");
  const [viewCreatorId, setViewCreatorId] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<ApiCreatorApplication | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const applicationsQuery = useAdminApplications({ status: "PENDING", limit: 50 });
  const creatorsQuery = useCreatorsList({ limit: 50, search: search.trim() || undefined });
  const reviewApplication = useReviewAdminApplication();
  const updateCreatorStatus = useUpdateAdminCreatorStatus();

  const submitReview = (application: ApiCreatorApplication, status: "APPROVED" | "REJECTED", reason?: string) => {
    reviewApplication.mutate(
      {
        id: application.id,
        input: buildAdminReviewApplicationInput(application, status, reason),
      },
      {
        onSuccess: () => {
          toast({ title: status === "APPROVED" ? "Application approved" : "Application declined" });
          if (status === "REJECTED") {
            setDeclineTarget(null);
            setDeclineReason("");
          }
        },
        onError: (error) =>
          toast({
            title: "Review failed",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const approve = (application: ApiCreatorApplication) => submitReview(application, "APPROVED");

  const confirmDecline = () => {
    if (!declineTarget || !declineReason.trim()) return;
    submitReview(declineTarget, "REJECTED", declineReason.trim());
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
      <Toolbar placeholder="Search creators or applicants..." value={search} onChange={setSearch} />
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
              {applicationsQuery.isLoading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    Loading applications...
                  </td>
                </tr>
              )}
              {!applicationsQuery.isLoading && (applicationsQuery.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No pending applications.
                  </td>
                </tr>
              )}
              {(applicationsQuery.data ?? []).map((app) => (
                <tr key={app.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gold-gradient grid place-items-center text-xs font-semibold text-primary-foreground">
                        {app.displayName[0]?.toUpperCase() ?? "C"}
                      </div>
                      <div>
                        <p className="font-medium">{app.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{app.requestedHandle ?? "pending-handle"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{app.creatorType === "INDIVIDUAL" ? "Individual" : "Organization"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{app.category}</td>
                  <td className="px-5 py-3">
                    <Pill tone="gold">Pending</Pill>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Check} label="Approve" tone="gold" onClick={() => approve(app)} />
                      <RowAction icon={X} label="Decline" tone="red" onClick={() => { setDeclineTarget(app); setDeclineReason(""); }} />
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
              {creatorsQuery.isLoading && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    Loading creators...
                  </td>
                </tr>
              )}
              {(creatorsQuery.data ?? []).map((creator) => (
                <tr key={creator.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 font-medium">{creator.displayName}</td>
                  <td className="px-5 py-3 text-muted-foreground">@{creator.handle ?? creator.id}</td>
                  <td className="px-5 py-3">
                    <Pill tone={creator.isActive === false ? "muted" : "green"}>{creator.isActive === false ? "Inactive" : "Active"}</Pill>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Eye} label="View profile" onClick={() => setViewCreatorId(creator.id)} />
                      <RowAction
                        icon={creator.isActive === false ? Play : Pause}
                        label={creator.isActive === false ? "Activate" : "Deactivate"}
                        tone={creator.isActive === false ? "gold" : "red"}
                        onClick={() => toggleCreator(creator.id, creator.isActive !== false)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <CreatorDetailDialog id={viewCreatorId} onClose={() => setViewCreatorId(null)} />
      <Dialog open={Boolean(declineTarget)} onOpenChange={(open) => !open && setDeclineTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline application</DialogTitle>
            <DialogDescription>
              Let {declineTarget?.displayName ?? "the applicant"} know why this application wasn't approved. They'll see this reason and can reapply.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="decline-reason">Reason</Label>
            <Textarea
              id="decline-reason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. We need more information about your content and rights ownership."
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setDeclineTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDecline}
              disabled={!declineReason.trim() || reviewApplication.isPending}
            >
              {reviewApplication.isPending ? "Declining..." : "Decline Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LiveView = () => {
  const [search, setSearch] = useState("");
  const liveQuery = useAdminLiveEvents({ limit: 50, search: search.trim() || undefined });
  const updateLiveEvent = useUpdateAdminLiveEvent();
  const events = liveQuery.data ?? [];

  const setStatus = (event: ApiLiveEvent, status: string, successTitle: string) => {
    updateLiveEvent.mutate(
      { id: event.id, input: { status } },
      {
        onSuccess: () => toast({ title: successTitle, description: event.title }),
        onError: (error) =>
          toast({
            title: "Could not update event",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const toggleFeatured = (event: ApiLiveEvent) => {
    updateLiveEvent.mutate(
      { id: event.id, input: { isFeatured: !event.isFeatured } },
      {
        onSuccess: () => toast({ title: event.isFeatured ? "Unfeatured" : "Featured", description: event.title }),
        onError: (error) =>
          toast({
            title: "Could not update event",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Live Event Management" subtitle="Approve, monitor and moderate scheduled and active live events." />
      <Toolbar placeholder="Search live events..." value={search} onChange={setSearch} />
      {liveQuery.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading live events...</p>
      ) : events.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No live events found.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => (
            <Card key={e.id} className="p-0 overflow-hidden">
              {(e.thumbnailUrl || e.bannerUrl) && (
                <img src={e.thumbnailUrl || e.bannerUrl || ""} alt="" className="h-40 w-full object-cover" />
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Pill tone={e.status === "LIVE" ? "red" : e.status === "ENDED" ? "muted" : "gold"}>
                    {e.status === "LIVE" ? "Live now" : e.status === "ENDED" ? "Ended" : e.status}
                  </Pill>
                  <Pill tone={e.visibility === "PUBLIC" ? "muted" : "gold"}>{e.visibility === "PUBLIC" ? "Free" : "Paid"}</Pill>
                </div>
                <div>
                  <p className="font-display text-lg">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {e.creator?.displayName ?? "Unassigned"} / {new Date(e.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {e.status === "UNDER_REVIEW" && (
                    <RowAction icon={Check} label="Approve" tone="gold" onClick={() => setStatus(e, "SCHEDULED", "Event approved")} />
                  )}
                  <RowAction
                    icon={Star}
                    label={e.isFeatured ? "Unfeature" : "Feature"}
                    tone="gold"
                    onClick={() => toggleFeatured(e)}
                  />
                  <RowAction icon={Eye} label="Monitor" onClick={() => toast({ title: `Monitoring ${e.title}` })} />
                  {e.status !== "ENDED" && e.status !== "CANCELLED" && (
                    <RowAction
                      icon={X}
                      label="End / Cancel"
                      tone="red"
                      onClick={() => setStatus(e, e.status === "LIVE" ? "ENDED" : "CANCELLED", e.status === "LIVE" ? "Event ended" : "Event cancelled")}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const UsersView = () => {
  const [search, setSearch] = useState("");
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const usersQuery = useAdminUsers({ limit: 50, search: search.trim() || undefined });
  const updateUserMutation = useUpdateAdminUser();

  const setActiveStatus = (user: ApiUser, isActive: boolean) => {
    updateUserMutation.mutate(
      { id: user.id, input: { isActive } },
      {
        onSuccess: () =>
          toast({
            title: isActive ? "User reactivated" : "User suspended",
            description: user.name || user.email,
          }),
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
      <SectionHeader title="User Management" subtitle="Search, suspend, reactivate and manage listener accounts." />
      <Toolbar placeholder="Search users by name, email or ID..." value={search} onChange={setSearch} />
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">User</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Subscription</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {usersQuery.isLoading && <EmptyRow colSpan={5} message="Loading users..." />}
              {!usersQuery.isLoading && (usersQuery.data ?? []).length === 0 && <EmptyRow colSpan={5} message="No users found." />}
              {(usersQuery.data ?? []).map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gold-gradient grid place-items-center text-xs font-semibold text-primary-foreground">
                        {(u.name?.[0] || u.email[0] || "U").toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name || "Unnamed user"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <Pill tone="muted">{u.role ?? "USER"}</Pill>
                  </td>
                  <td className="px-5 py-3">
                    <Pill tone={u.subscriptionTier === "PREMIUM" ? "gold" : "muted"}>{u.subscriptionTier ?? "FREE"}</Pill>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Eye} label="View" onClick={() => setViewUserId(u.id)} />
                      {u.isActive === false ? (
                        <RowAction icon={Play} label="Reactivate" tone="gold" onClick={() => setActiveStatus(u, true)} />
                      ) : (
                        <RowAction icon={Pause} label="Suspend" tone="red" onClick={() => setActiveStatus(u, false)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <UserDetailDialog id={viewUserId} onClose={() => setViewUserId(null)} />
    </div>
  );
};

const SubscriptionsView = () => (
  <div className="space-y-6">
    <SectionHeader title="Subscription Management" subtitle="View subscribers, manage plans, refunds and payment history." />
    <Card>
      <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
        Subscription operations are deferred for this launch window.
      </div>
    </Card>
  </div>
);

const ReportsView = () => {
  const pendingQuery = useAdminReports({ status: "PENDING", limit: 50 });
  const resolvedQuery = useAdminReports({ status: "RESOLVED", limit: 100 });
  const dismissedQuery = useAdminReports({ status: "DISMISSED", limit: 100 });
  const reviewReport = useReviewReport();
  const reports = pendingQuery.data ?? [];

  const review = (report: ApiReport, status: "RESOLVED" | "DISMISSED") => {
    const resolutionNote =
      status === "DISMISSED" ? window.prompt("Dismissal note (optional)")?.trim() || undefined : undefined;

    reviewReport.mutate(
      { id: report.id, input: { status, resolutionNote } },
      {
        onSuccess: () => toast({ title: status === "RESOLVED" ? "Marked resolved" : "Report dismissed" }),
        onError: (error) =>
          toast({
            title: "Could not update report",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Reports & Moderation" subtitle="Triage reports, copyright claims and community safety violations." />
      <div className="grid gap-5 md:grid-cols-3">
        <Stat label="Open Reports" value={pendingQuery.isLoading ? "—" : String(reports.length)} icon={ShieldAlert} tone="red" />
        <Stat label="Resolved" value={resolvedQuery.data ? String(resolvedQuery.data.length) : "—"} icon={Check} />
        <Stat label="Dismissed" value={dismissedQuery.data ? String(dismissedQuery.data.length) : "—"} icon={X} tone="gold" />
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Subject</th>
                <th className="px-5 py-3 text-left">Reason</th>
                <th className="px-5 py-3 text-left">Reported by</th>
                <th className="px-5 py-3 text-left">Filed</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {pendingQuery.isLoading && <EmptyRow colSpan={5} message="Loading reports..." />}
              {!pendingQuery.isLoading && reports.length === 0 && <EmptyRow colSpan={5} message="No pending reports." />}
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 font-medium">{r.targetTitle ?? r.targetId}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.reason}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.reporter?.name || r.reporter?.email || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction icon={Check} label="Resolve" tone="gold" onClick={() => review(r, "RESOLVED")} />
                      <RowAction icon={X} label="Dismiss" tone="red" onClick={() => review(r, "DISMISSED")} />
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
  const dailyQuery = useAdminDailyAnalytics("30d");
  const dailyPoints = dailyQuery.data ?? [];
  const maxPlays = Math.max(1, ...dailyPoints.map((p) => p.totalPlays));
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
          <h3 className="font-display text-xl">Plays - Last 30 days</h3>
        </div>
        {dailyPoints.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Not enough data yet — this chart fills in day by day as creators' content gets plays.
          </p>
        ) : (
          <div className="mt-6 flex h-48 items-end gap-2">
            {dailyPoints.map((p) => (
              <div
                key={p.date}
                title={`${new Date(p.date).toLocaleDateString()}: ${p.totalPlays} plays`}
                className="w-full rounded-t-md bg-red-gradient transition-all"
                style={{ height: `${Math.max(4, (p.totalPlays / maxPlays) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg">Top Creators</h3>
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">Data unavailable</div>
        </Card>
        <Card>
          <h3 className="font-display text-lg">Most Popular Content</h3>
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">Data unavailable</div>
        </Card>
      </div>
    </div>
  );
};

type SettingsPanel =
  | "languages"
  | "regions"
  | "notification-templates"
  | "creator-guidelines"
  | "community-guidelines"
  | "announcements";

const errText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

const PlatformListRows = ({
  items,
  isLoading,
  onToggleActive,
  onDelete,
}: {
  items: ApiPlatformListItem[];
  isLoading: boolean;
  onToggleActive: (item: ApiPlatformListItem) => void;
  onDelete: (id: string) => void;
}) => (
  <tbody className="divide-y divide-border/60">
    {isLoading && <EmptyRow colSpan={4} message="Loading..." />}
    {!isLoading && items.length === 0 && <EmptyRow colSpan={4} message="No items yet." />}
    {items.map((item) => (
      <tr key={item.id} className="hover:bg-secondary/30">
        <td className="px-5 py-3 font-medium">{item.name}</td>
        <td className="px-5 py-3 text-muted-foreground">{item.code || "—"}</td>
        <td className="px-5 py-3">
          <Pill tone={item.isActive ? "green" : "muted"}>{item.isActive ? "Active" : "Inactive"}</Pill>
        </td>
        <td className="px-5 py-3">
          <div className="flex justify-end gap-2">
            <RowAction
              icon={item.isActive ? Pause : Play}
              label={item.isActive ? "Deactivate" : "Activate"}
              onClick={() => onToggleActive(item)}
            />
            <RowAction icon={Trash2} label="Delete" tone="red" onClick={() => onDelete(item.id)} />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

const PanelBack = ({ onBack }: { onBack: () => void }) => (
  <button onClick={onBack} className="text-sm text-gold hover:underline">
    ← Platform Settings
  </button>
);

const LanguagesPanel = ({ onBack }: { onBack: () => void }) => {
  const listQuery = useAdminLanguages();
  const create = useCreateAdminLanguage();
  const update = useUpdateAdminLanguage();
  const del = useDeleteAdminLanguage();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const addItem = () => {
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), code: code.trim() || undefined },
      {
        onSuccess: () => {
          setName("");
          setCode("");
          toast({ title: "Language added" });
        },
        onError: (error) => toast({ title: "Could not add language", description: errText(error, "Please try again."), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelBack onBack={onBack} />
      <SectionHeader title="Languages" subtitle="Supported listener and creator languages." />
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. French"
            className="mt-1 block rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Code (optional)</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="fr"
            className="mt-1 block w-24 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </label>
        <button
          onClick={addItem}
          disabled={!name.trim() || create.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <PlatformListRows
              items={listQuery.data ?? []}
              isLoading={listQuery.isLoading}
              onToggleActive={(item) => update.mutate({ id: item.id, input: { isActive: !item.isActive } })}
              onDelete={(id) =>
                del.mutate(id, {
                  onSuccess: () => toast({ title: "Deleted" }),
                  onError: (error) => toast({ title: "Could not delete", description: errText(error, "Please try again."), variant: "destructive" }),
                })
              }
            />
          </table>
        </div>
      </Card>
    </div>
  );
};

const RegionsPanel = ({ onBack }: { onBack: () => void }) => {
  const listQuery = useAdminRegions();
  const create = useCreateAdminRegion();
  const update = useUpdateAdminRegion();
  const del = useDeleteAdminRegion();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const addItem = () => {
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), code: code.trim() || undefined },
      {
        onSuccess: () => {
          setName("");
          setCode("");
          toast({ title: "Region added" });
        },
        onError: (error) => toast({ title: "Could not add region", description: errText(error, "Please try again."), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelBack onBack={onBack} />
      <SectionHeader title="Regions" subtitle="Supported regions and localization rules." />
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. West Africa"
            className="mt-1 block rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Code (optional)</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="NG"
            className="mt-1 block w-24 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </label>
        <button
          onClick={addItem}
          disabled={!name.trim() || create.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <PlatformListRows
              items={listQuery.data ?? []}
              isLoading={listQuery.isLoading}
              onToggleActive={(item) => update.mutate({ id: item.id, input: { isActive: !item.isActive } })}
              onDelete={(id) =>
                del.mutate(id, {
                  onSuccess: () => toast({ title: "Deleted" }),
                  onError: (error) => toast({ title: "Could not delete", description: errText(error, "Please try again."), variant: "destructive" }),
                })
              }
            />
          </table>
        </div>
      </Card>
    </div>
  );
};

const NotificationTemplatesPanel = ({ onBack }: { onBack: () => void }) => {
  const listQuery = useAdminNotificationTemplates();
  const create = useCreateAdminNotificationTemplate();
  const del = useDeleteAdminNotificationTemplate();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const addTemplate = () => {
    if (!key.trim() || !name.trim() || !subject.trim() || !body.trim()) return;
    create.mutate(
      { key: key.trim(), name: name.trim(), subject: subject.trim(), body: body.trim() },
      {
        onSuccess: () => {
          setKey("");
          setName("");
          setSubject("");
          setBody("");
          toast({ title: "Template created" });
        },
        onError: (error) => toast({ title: "Could not create template", description: errText(error, "Please try again."), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelBack onBack={onBack} />
      <SectionHeader title="Notification Templates" subtitle="Email and in-app notification copy." />
      <Card className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key (e.g. welcome_email)" className="rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm" />
        </div>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" rows={3} className="w-full rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm resize-none" />
        <button
          onClick={addTemplate}
          disabled={!key.trim() || !name.trim() || !subject.trim() || !body.trim() || create.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Create Template
        </button>
      </Card>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Key</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Subject</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {listQuery.isLoading && <EmptyRow colSpan={4} message="Loading..." />}
              {!listQuery.isLoading && (listQuery.data ?? []).length === 0 && <EmptyRow colSpan={4} message="No templates yet." />}
              {(listQuery.data ?? []).map((t) => (
                <tr key={t.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.key}</td>
                  <td className="px-5 py-3 font-medium">{t.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{t.subject}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction
                        icon={Trash2}
                        label="Delete"
                        tone="red"
                        onClick={() =>
                          del.mutate(t.id, {
                            onSuccess: () => toast({ title: "Deleted" }),
                          })
                        }
                      />
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

const GuidelinePanel = ({ type, title, onBack }: { type: "CREATOR" | "COMMUNITY"; title: string; onBack: () => void }) => {
  const guidelineQuery = useAdminGuideline(type);
  const upsert = useUpsertAdminGuideline(type);
  const [guidelineTitle, setGuidelineTitle] = useState("");
  const [guidelineBody, setGuidelineBody] = useState("");

  useEffect(() => {
    if (!guidelineQuery.data) return;
    setGuidelineTitle(guidelineQuery.data.title);
    setGuidelineBody(guidelineQuery.data.body);
  }, [guidelineQuery.data]);

  const save = () => {
    if (!guidelineTitle.trim() || !guidelineBody.trim()) return;
    upsert.mutate(
      { title: guidelineTitle.trim(), body: guidelineBody.trim() },
      {
        onSuccess: () => toast({ title: "Guidelines saved" }),
        onError: (error) => toast({ title: "Could not save", description: errText(error, "Please try again."), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PanelBack onBack={onBack} />
      <SectionHeader title={title} subtitle="Shown to users where applicable across NoraPlus." />
      <Card className="space-y-3">
        <input
          value={guidelineTitle}
          onChange={(e) => setGuidelineTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm"
        />
        <textarea
          value={guidelineBody}
          onChange={(e) => setGuidelineBody(e.target.value)}
          placeholder="Body"
          rows={10}
          className="w-full rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm resize-none"
        />
        <button
          onClick={save}
          disabled={upsert.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
        >
          {upsert.isPending ? "Saving..." : "Save"}
        </button>
      </Card>
    </div>
  );
};

const AnnouncementsPanel = ({ onBack }: { onBack: () => void }) => {
  const listQuery = useAdminAnnouncements();
  const create = useCreateAdminAnnouncement();
  const update = useUpdateAdminAnnouncement();
  const del = useDeleteAdminAnnouncement();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const addAnnouncement = () => {
    if (!title.trim() || !body.trim()) return;
    create.mutate(
      { title: title.trim(), body: body.trim() },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          toast({ title: "Announcement created" });
        },
        onError: (error) => toast({ title: "Could not create announcement", description: errText(error, "Please try again."), variant: "destructive" }),
      },
    );
  };

  const toggleActive = (announcement: ApiPlatformAnnouncement) => {
    update.mutate({ id: announcement.id, input: { isActive: !announcement.isActive } });
  };

  return (
    <div className="space-y-6">
      <PanelBack onBack={onBack} />
      <SectionHeader title="Platform Announcements" subtitle="Global in-app and email announcements." />
      <Card className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" rows={3} className="w-full rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm resize-none" />
        <button
          onClick={addAnnouncement}
          disabled={!title.trim() || !body.trim() || create.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Create Announcement
        </button>
      </Card>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Body</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {listQuery.isLoading && <EmptyRow colSpan={4} message="Loading..." />}
              {!listQuery.isLoading && (listQuery.data ?? []).length === 0 && <EmptyRow colSpan={4} message="No announcements yet." />}
              {(listQuery.data ?? []).map((a) => (
                <tr key={a.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 font-medium">{a.title}</td>
                  <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">{a.body}</td>
                  <td className="px-5 py-3">
                    <Pill tone={a.isActive ? "green" : "muted"}>{a.isActive ? "Active" : "Inactive"}</Pill>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <RowAction
                        icon={a.isActive ? Pause : Play}
                        label={a.isActive ? "Deactivate" : "Activate"}
                        onClick={() => toggleActive(a)}
                      />
                      <RowAction
                        icon={Trash2}
                        label="Delete"
                        tone="red"
                        onClick={() =>
                          del.mutate(a.id, {
                            onSuccess: () => toast({ title: "Deleted" }),
                          })
                        }
                      />
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

const SettingsView = () => {
  const [panel, setPanel] = useState<SettingsPanel | null>(null);
  const back = () => setPanel(null);

  if (panel === "languages") return <LanguagesPanel onBack={back} />;
  if (panel === "regions") return <RegionsPanel onBack={back} />;
  if (panel === "notification-templates") return <NotificationTemplatesPanel onBack={back} />;
  if (panel === "creator-guidelines") return <GuidelinePanel type="CREATOR" title="Creator Guidelines" onBack={back} />;
  if (panel === "community-guidelines") return <GuidelinePanel type="COMMUNITY" title="Community Guidelines" onBack={back} />;
  if (panel === "announcements") return <AnnouncementsPanel onBack={back} />;

  const groups: { id: SettingsPanel | null; title: string; desc: string }[] = [
    { id: null, title: "Subscription Plans", desc: "Not part of this release." },
    { id: "languages", title: "Languages", desc: "Supported listener and creator languages" },
    { id: "regions", title: "Regions", desc: "Supported regions and localization rules" },
    { id: "notification-templates", title: "Notification Templates", desc: "Email and in-app notification copy" },
    { id: "creator-guidelines", title: "Creator Guidelines", desc: "Eligibility, content rules, monetization terms" },
    { id: "community-guidelines", title: "Community Guidelines", desc: "Behavior standards across NoraPlus" },
    { id: null, title: "Content Categories", desc: "Fixed taxonomy — not editable here." },
    { id: null, title: "Homepage Featured Content", desc: "Use \"Feature\" in Content Management." },
    { id: "announcements", title: "Platform Announcements", desc: "Global in-app and email announcements" },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader title="Platform Settings" subtitle="Global NoraPlus configuration managed by the NoraPlus team." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <button
            key={g.title}
            disabled={!g.id}
            onClick={() => g.id && setPanel(g.id)}
            className={cn(
              "text-left rounded-2xl bg-card-gradient ring-1 ring-border/60 p-5 transition-all",
              g.id ? "hover:ring-gold/40" : "opacity-50 cursor-not-allowed",
            )}
          >
            <p className="font-display text-base">{g.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
            {g.id && <span className="mt-4 inline-block text-xs text-gold">Configure -&gt;</span>}
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
            {nav.map((n) => {
              const active = section === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-secondary text-gold ring-1 ring-gold/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
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
