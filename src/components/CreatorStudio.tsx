import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Headphones,
  Play,
  Radio,
  Layers,
  BarChart3,
  UserCircle,
  Settings as SettingsIcon,
  ArrowUpRight,
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Calendar,
  Image as ImageIcon,
  Music as MusicIcon,
  Film,
  Check,
  X,
  MoreHorizontal,
  Filter,
  Clock,
  Globe,
  Lock,
  Star,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { content } from "@/lib/mockData";
import { useUser } from "@/lib/user";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { adaptContent, adaptCreatorAnalytics, formatCategory, formatCompactNumber, toApiSocialLinks } from "@/lib/api/adapters";
import {
  useCreateOwnContent,
  useCreateOwnLiveEvent,
  useDeleteOwnLiveEvent,
  useMyCreatorAnalytics,
  useMyDailyCreatorAnalytics,
  useMyCreatorProfile,
  useDeleteOwnContent,
  useOwnCreatorContent,
  useOwnCreatorLiveEvents,
  useUpdateMyCreatorProfile,
  useUpdateOwnContent,
  useUpdateOwnLiveEvent,
} from "@/lib/api/hooks/useCreators";
import { uploadFileToPresignedUrl, useConfirmUpload, usePresignUpload } from "@/lib/api/hooks/useUpload";
import { useAddBucketItem, useBuckets } from "@/lib/api/hooks/useBuckets";
import { BucketsLibrary } from "@/components/studio/BucketsLibrary";
import type {
  ApiContent,
  ApiLiveEvent,
  ContentCategory,
  ContentStatus,
  ContentType,
  ContentVisibility,
  CreatorSocialPlatform,
  LiveEventType,
  UploadAssetRole,
} from "@/lib/api/types";

type Section = "overview" | "upload" | "audio" | "video" | "buckets" | "live" | "analytics" | "profile" | "settings";
type UploadKind = "audio" | "video" | "live" | null;
type StudioContentItem = {
  id: string;
  title: string;
  image: string;
  category: string;
  categoryValue: ContentCategory;
  duration: string;
  status: "Published" | "Draft";
  contentStatus: ContentStatus;
  plays: string;
  views: string;
  published: string;
  type: ContentType;
};

type StudioLiveItem = {
  id: string;
  title: string;
  banner: string;
  type: string;
  date: string;
  status: "Scheduled" | "Live" | "Ended" | "Draft" | "Cancelled" | "Review" | "Rejected";
  regs: string;
  viewers: string;
};

const categoryOptions: { label: string; value: ContentCategory }[] = [
  { label: "Worship", value: "WORSHIP" },
  { label: "Sermon", value: "SERMON" },
  { label: "Podcast", value: "PODCAST" },
  { label: "Film", value: "FILM" },
  { label: "Devotional", value: "DEVOTIONAL" },
  { label: "Music", value: "MUSIC" },
  { label: "Prayer", value: "PRAYER" },
  { label: "Testimony", value: "TESTIMONY" },
  { label: "Bible Study", value: "BIBLE_STUDY" },
  { label: "Other", value: "OTHER" },
];

const socialPlatforms: { key: CreatorSocialPlatform; label: string; placeholder: string }[] = [
  { key: "WEBSITE", label: "Website", placeholder: "https://yoursite.com" },
  { key: "YOUTUBE", label: "YouTube", placeholder: "https://youtube.com/@yourhandle" },
  { key: "INSTAGRAM", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "FACEBOOK", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "TIKTOK", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "X", label: "X", placeholder: "https://x.com/yourhandle" },
];

const liveEventTypeOptions: { label: string; value: LiveEventType }[] = [
  { label: "Worship night", value: "WORSHIP_NIGHT" },
  { label: "Conference", value: "CONFERENCE" },
  { label: "Vigil", value: "VIGIL" },
  { label: "Concert", value: "CONCERT" },
  { label: "Prayer meeting", value: "PRAYER_MEETING" },
  { label: "Premiere", value: "PREMIERE" },
  { label: "Retreat", value: "RETREAT" },
  { label: "Church event", value: "CHURCH_EVENT" },
];

const nav: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "upload", label: "Upload Content", icon: Upload },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "video", label: "Video", icon: Play },
  { id: "buckets", label: "Buckets", icon: Layers },
  { id: "live", label: "Live Events", icon: Radio },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "profile", label: "Creator Profile", icon: UserCircle },
  { id: "settings", label: "Creator Settings", icon: SettingsIcon },
];

/* ---------- Shared primitives ---------- */

const inputCls =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold/60 transition";

const Field = ({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) => (
  <label className="block">
    <span className="text-sm text-foreground/90">
      {label}
      {required && <span className="text-gold"> *</span>}
    </span>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
  </label>
);

const StatusBadge = ({ status }: { status: "Published" | "Draft" | "Scheduled" | "Review" | "Live" | "Ended" | "Cancelled" | "Rejected" }) => {
  const map: Record<string, string> = {
    Published: "bg-gold/15 text-gold ring-gold/30",
    Draft: "bg-muted text-muted-foreground ring-border",
    Scheduled: "bg-red/15 text-red-foreground ring-red/30",
    Review: "bg-secondary text-muted-foreground ring-border",
    Live: "bg-red-gradient text-primary-foreground ring-red/40 shadow-red-glow",
    Ended: "bg-muted text-muted-foreground ring-border",
    Cancelled: "bg-muted text-muted-foreground ring-border",
    Rejected: "bg-destructive/15 text-destructive ring-destructive/30",
  };
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1", map[status])}
    >
      {status === "Live" && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
      {status}
    </span>
  );
};

const SectionHeader = ({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="text-xs uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
      <h1 className="mt-2 font-display text-3xl md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon: Icon, title, cta, onCta }: { icon: typeof Upload; title: string; cta: string; onCta: () => void }) => (
  <div className="rounded-3xl border border-dashed border-border bg-card-gradient p-12 text-center ring-1 ring-border/40">
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-gradient shadow-red-glow">
      <Icon className="h-6 w-6 text-primary-foreground" />
    </div>
    <p className="mt-5 font-display text-xl">{title}</p>
    <button
      onClick={onCta}
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow hover:shadow-glow transition"
    >
      <Plus className="h-4 w-4" /> {cta}
    </button>
  </div>
);

/* ---------- Mock data ---------- */

function toStudioContentItem(item: ApiContent): StudioContentItem {
  const adapted = adaptContent(item);
  const count = formatCompactNumber(item.viewCount ?? 0);

  return {
    id: item.id,
    title: item.title,
    image: adapted.image,
    category: formatCategory(item.category),
    categoryValue: item.category,
    duration: adapted.duration,
    status: item.status === "PUBLISHED" ? "Published" : "Draft",
    contentStatus: item.status,
    plays: count,
    views: count,
    published: item.status === "PUBLISHED" ? formatStudioDate(item.publishedAt ?? item.createdAt) : "Draft",
    type: item.type,
  };
}

function formatStudioDate(value?: string) {
  if (!value) return "Draft";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Draft";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDetectedDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

async function readMediaDurationSeconds(file: File): Promise<number | null> {
  if (typeof window === "undefined") return null;

  const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
  const objectUrl = URL.createObjectURL(file);
  media.preload = "metadata";
  media.src = objectUrl;

  return new Promise((resolve) => {
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      media.removeAttribute("src");
      media.load();
    };

    media.onloadedmetadata = () => {
      const value = Number.isFinite(media.duration) && media.duration > 0 ? Math.round(media.duration) : null;
      cleanup();
      resolve(value);
    };

    media.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

function compactStringRecord<T extends string>(record: Partial<Record<T, string>>) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => typeof value === "string" && value.trim().length > 0)) as Partial<
    Record<T, string>
  >;
}

function toStudioLiveItem(event: ApiLiveEvent): StudioLiveItem {
  return {
    id: event.id,
    title: event.title,
    banner: event.bannerUrl || event.thumbnailUrl || content[2].image,
    type: formatLiveEventType(event.eventType),
    date: formatLiveDate(event.startTime ?? event.scheduledAt),
    status: mapStudioLiveStatus(event.status),
    regs: event.registrationRequired ? "Required" : "Open",
    viewers: formatCompactNumber(event.viewerCount ?? 0),
  };
}

function mapStudioLiveStatus(status: ApiLiveEvent["status"]): StudioLiveItem["status"] {
  if (status === "LIVE") return "Live";
  if (status === "ENDED") return "Ended";
  if (status === "DRAFT") return "Draft";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "REJECTED") return "Rejected";
  if (status === "UNDER_REVIEW") return "Review";
  return "Scheduled";
}

function formatLiveDate(value?: string | null) {
  if (!value) return "Date TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBD";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLiveEventType(type?: LiveEventType | null) {
  if (!type) return "Live Event";
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/* ---------- Overview ---------- */

const Overview = ({ goto, openUpload, items }: { goto: (s: Section) => void; openUpload: (k: UploadKind) => void; items: StudioContentItem[] }) => {
  const { user } = useUser();
  const analyticsQuery = useMyCreatorAnalytics();
  const analytics = analyticsQuery.data;
  const publishedCount = items.filter((item) => item.contentStatus === "PUBLISHED").length;
  const draftCount = items.length - publishedCount;
  const recentItems = items.slice(0, 4);
  const summary = [
    { label: "Uploads", value: String(items.length) },
    { label: "Published", value: String(publishedCount) },
    { label: "Drafts", value: String(draftCount) },
    { label: "Followers", value: formatCompactNumber(analytics?.followersCount ?? 0) },
    { label: "Total Plays", value: formatCompactNumber(analytics?.totalPlays ?? 0) },
    { label: "Upcoming Live", value: formatCompactNumber(analytics?.upcomingLiveEvents ?? 0) },
  ];
  const activity = recentItems.map((item) => ({
    t: `${item.status === "Published" ? "Published" : "Draft saved"} "${item.title}"`,
    at: item.published,
  }));

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Creator Studio"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Here's what's happening across your content today."
        action={
          <button
            onClick={() => goto("upload")}
            className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"
          >
            <Upload className="h-4 w-4" /> Upload Content
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card-gradient p-5 ring-1 ring-border/60 hover:ring-gold/30 transition">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl">Quick actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { k: "audio" as const, icon: Headphones, title: "Upload Audio", desc: "Messages, music, podcasts and devotionals." },
            { k: "video" as const, icon: Play, title: "Upload Video", desc: "Films, music videos, podcast videos and skits." },
            { k: "live" as const, icon: Radio, title: "Create Live Event", desc: "Stream services, worship nights and conferences." },
          ].map((a) => (
            <button
              key={a.k}
              onClick={() => openUpload(a.k)}
              className="group relative overflow-hidden text-left rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60 hover:ring-gold/50 transition-all"
            >
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-red/20 blur-3xl group-hover:bg-gold/20 transition-colors" />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-red-gradient grid place-items-center shadow-red-glow">
                  <a.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="mt-5 font-display text-xl">{a.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{a.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold">
                  Start <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-display text-lg">Recent uploads</h3>
            <button onClick={() => goto("audio")} className="text-xs text-gold hover:underline">
              View library
            </button>
          </div>
          <div className="divide-y divide-border/60">
            {recentItems.length === 0 && <div className="px-6 py-8 text-sm text-muted-foreground">Your uploaded content will appear here.</div>}
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <img src={item.image} alt="" className="h-14 w-14 rounded-lg object-cover ring-1 ring-border/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatCategory(item.categoryValue)} - {item.published} - {item.plays} plays
                  </p>
                </div>
                <StatusBadge status={item.status} />
                <div className="hidden sm:flex items-center gap-1">
                  <RowActions item={item} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-display text-lg">Recent activity</h3>
          </div>
          {activity.length === 0 && <div className="px-6 py-8 text-sm text-muted-foreground">Your recent activity will appear here.</div>}
          <ul className="divide-y divide-border/60">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 px-6 py-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
                <div className="flex-1">
                  <p className="text-sm">{a.t}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.at}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ---------- Library tables ---------- */

const Toolbar = ({
  placeholder,
  value,
  onChange,
  filters,
  activeFilter,
  onFilterClick,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  filters: string[];
  activeFilter?: string | null;
  onFilterClick?: (filter: string) => void;
}) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="relative flex-1 min-w-[220px] max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </div>
    {filters.map((f) => (
      <button
        key={f}
        onClick={() => onFilterClick?.(f)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition",
          activeFilter === f
            ? "border-gold/50 bg-gold/10 text-gold"
            : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40 hover:text-foreground",
        )}
      >
        <Filter className="h-3.5 w-3.5" /> {f}
      </button>
    ))}
  </div>
);

const RowActions = ({ item }: { item: StudioContentItem }) => {
  const updateContent = useUpdateOwnContent();
  const deleteContent = useDeleteOwnContent();
  const pending = updateContent.isPending || deleteContent.isPending;

  const togglePublished = () => {
    updateContent.mutate(
      { contentId: item.id, input: { status: item.contentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } },
      {
        onSuccess: () => toast({ title: item.contentStatus === "PUBLISHED" ? "Moved to drafts" : "Published" }),
        onError: (error) =>
          toast({
            title: "Could not update content",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const remove = () => {
    deleteContent.mutate(item.id, {
      onSuccess: () => toast({ title: "Content deleted" }),
      onError: (error) =>
        toast({
          title: "Could not delete content",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        }),
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link title="View" to={`/app/content/${item.id}`} className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60">
        <Eye className="h-4 w-4 text-muted-foreground" />
      </Link>
      <button
        disabled={pending}
        onClick={togglePublished}
        title={item.contentStatus === "PUBLISHED" ? "Move to draft" : "Publish"}
        className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-50"
      >
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </button>
      <button
        disabled={pending}
        onClick={remove}
        title="Delete"
        className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};

function useLibraryTableControls(items: StudioContentItem[]) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Published" | "Draft" | null>(null);
  const [sortDesc, setSortDesc] = useState(true);

  const cycleStatus = () =>
    setStatusFilter((prev) => (prev === null ? "Published" : prev === "Published" ? "Draft" : null));

  const filtered = useMemo(() => {
    let next = items.filter((item) => item.title.toLowerCase().includes(search.trim().toLowerCase()));
    if (statusFilter) next = next.filter((item) => item.status === statusFilter);
    if (!sortDesc) next = next.slice().reverse();
    return next;
  }, [items, search, statusFilter, sortDesc]);

  const activeFilter = statusFilter ? "Status" : !sortDesc ? "Sort" : null;
  const onFilterClick = (filter: string) => {
    if (filter === "Status") cycleStatus();
    if (filter === "Sort") setSortDesc((prev) => !prev);
  };

  return { search, setSearch, filtered, activeFilter, onFilterClick };
}

const AudioLibrary = ({ openUpload, items }: { openUpload: (k: UploadKind) => void; items: StudioContentItem[] }) => {
  const { search, setSearch, filtered, activeFilter, onFilterClick } = useLibraryTableControls(items);
  if (items.length === 0) {
    return <EmptyState icon={Headphones} title="No audio uploaded yet." cta="Upload Audio" onCta={() => openUpload("audio")} />;
  }
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Library"
        title="Audio"
        subtitle="Manage your audio uploads, drafts and scheduled releases."
        action={
          <button
            onClick={() => openUpload("audio")}
            className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"
          >
            <Plus className="h-4 w-4" /> Upload Audio
          </button>
        }
      />
      <Toolbar
        placeholder="Search audio…"
        value={search}
        onChange={setSearch}
        filters={["Status", "Sort"]}
        activeFilter={activeFilter}
        onFilterClick={onFilterClick}
      />
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No audio matches your search.</p>
      ) : (
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
              <tr>
                <th className="px-6 py-3 font-normal">Title</th>
                <th className="px-6 py-3 font-normal">Category</th>
                <th className="px-6 py-3 font-normal">Duration</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 font-normal">Plays</th>
                <th className="px-6 py-3 font-normal">Published</th>
                <th className="px-6 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-border/60 hover:bg-background/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-10 w-10 rounded object-cover" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.duration}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.plays}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.published}</td>
                  <td className="px-6 py-4">
                    <RowActions item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

const VideoLibrary = ({ openUpload, items }: { openUpload: (k: UploadKind) => void; items: StudioContentItem[] }) => {
  const { search, setSearch, filtered, activeFilter, onFilterClick } = useLibraryTableControls(items);
  if (items.length === 0) {
    return <EmptyState icon={Play} title="No videos uploaded yet." cta="Upload Video" onCta={() => openUpload("video")} />;
  }
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Library"
        title="Video"
        subtitle="Films, music videos, podcasts and skits."
        action={
          <button
            onClick={() => openUpload("video")}
            className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"
          >
            <Plus className="h-4 w-4" /> Upload Video
          </button>
        }
      />
      <Toolbar
        placeholder="Search video…"
        value={search}
        onChange={setSearch}
        filters={["Status", "Sort"]}
        activeFilter={activeFilter}
        onFilterClick={onFilterClick}
      />
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No video matches your search.</p>
      ) : (
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
              <tr>
                <th className="px-6 py-3 font-normal">Title</th>
                <th className="px-6 py-3 font-normal">Category</th>
                <th className="px-6 py-3 font-normal">Duration</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 font-normal">Views</th>
                <th className="px-6 py-3 font-normal">Published</th>
                <th className="px-6 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-border/60 hover:bg-background/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-10 w-16 rounded object-cover" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.duration}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.views}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.published}</td>
                  <td className="px-6 py-4">
                    <RowActions item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

const LiveManager = ({ openUpload }: { openUpload: (k: UploadKind) => void }) => {
  const liveQuery = useOwnCreatorLiveEvents({ limit: 50 });
  const deleteLive = useDeleteOwnLiveEvent();
  const updateLive = useUpdateOwnLiveEvent();
  const allItems = useMemo(() => (liveQuery.data ?? []).map(toStudioLiveItem), [liveQuery.data]);
  const [liveSearch, setLiveSearch] = useState("");
  const items = useMemo(
    () => allItems.filter((e) => e.title.toLowerCase().includes(liveSearch.trim().toLowerCase())),
    [allItems, liveSearch],
  );

  const editEvent = (event: StudioLiveItem) => {
    const title = window.prompt("Event title", event.title)?.trim();
    if (!title || title === event.title) return;

    updateLive.mutate(
      { id: event.id, input: { title } },
      {
        onSuccess: () => toast({ title: "Live event updated", description: title }),
        onError: (error) =>
          toast({
            title: "Could not update event",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const cancelEvent = (event: StudioLiveItem) => {
    deleteLive.mutate(event.id, {
      onSuccess: () => toast({ title: "Live event cancelled", description: event.title }),
      onError: (error) =>
        toast({
          title: "Could not cancel event",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        }),
    });
  };

  if (!liveQuery.isLoading && allItems.length === 0) {
    return <EmptyState icon={Radio} title="No live events scheduled." cta="Create Live Event" onCta={() => openUpload("live")} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Manager"
        title="Live Events"
        subtitle="Schedule, stream and review your live experiences."
        action={
          <button
            onClick={() => openUpload("live")}
            className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"
          >
            <Plus className="h-4 w-4" /> New Event
          </button>
        }
      />
      <Toolbar placeholder="Search events…" value={liveSearch} onChange={setLiveSearch} filters={[]} />
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
              <tr>
                <th className="px-6 py-3 font-normal">Event</th>
                <th className="px-6 py-3 font-normal">Date</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 font-normal">Viewers</th>
                <th className="px-6 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {liveQuery.isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Loading live events...
                  </td>
                </tr>
              )}
              {!liveQuery.isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No events match your search.
                  </td>
                </tr>
              )}
              {items.map((e) => (
                <tr key={e.id} className="border-t border-border/60 hover:bg-background/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={e.banner} alt="" className="h-10 w-16 rounded object-cover" />
                      <span className="font-medium">{e.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{e.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{e.regs}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.viewers}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {e.status !== "Ended" && e.status !== "Cancelled" && (
                        <button
                          title="Edit event"
                          onClick={() => editEvent(e)}
                          disabled={updateLive.isPending}
                          className="inline-flex items-center gap-1 rounded-full border border-gold/40 px-3 py-1 text-[11px] text-gold hover:bg-gold/10 disabled:opacity-50"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                      )}
                      {e.status === "Live" && (
                        <button
                          title="Cancel event"
                          onClick={() => cancelEvent(e)}
                          disabled={deleteLive.isPending}
                          className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-[11px] text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          Cancel Event
                        </button>
                      )}
                      {e.status !== "Live" && e.status !== "Cancelled" && e.status !== "Ended" && (
                        <button
                          title="Cancel event"
                          onClick={() => cancelEvent(e)}
                          disabled={deleteLive.isPending}
                          className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------- Analytics ---------- */

const Analytics = () => {
  const analyticsQuery = useMyCreatorAnalytics();
  const dailyQuery = useMyDailyCreatorAnalytics("30d");
  const analytics = analyticsQuery.data;
  const stats = adaptCreatorAnalytics(analytics);
  const dailyPoints = dailyQuery.data ?? [];
  const maxPlays = Math.max(1, ...dailyPoints.map((p) => p.totalPlays));

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Insights" title="Analytics" subtitle="Track how your content is performing across NoraPlus." />
      {analyticsQuery.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Analytics could not be loaded right now.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-3 font-display text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-gold inline-flex items-center gap-1">
              {s.trend} <ArrowUpRight className="h-3 w-3" />
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-8">
        <h3 className="font-display text-lg">Plays over the last 30 days</h3>
        {dailyPoints.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Not enough data yet — this chart fills in day by day as your content gets plays.
          </p>
        ) : (
          <div className="mt-6 h-48 flex items-end gap-2">
            {dailyPoints.map((p) => (
              <div
                key={p.date}
                title={`${new Date(p.date).toLocaleDateString()}: ${p.totalPlays} plays`}
                className="flex-1 rounded-t-md bg-gradient-to-t from-red/60 to-gold/60"
                style={{ height: `${Math.max(4, (p.totalPlays / maxPlays) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Creator Profile preview ---------- */

const CreatorProfileView = () => {
  const { user } = useUser();
  const profileQuery = useMyCreatorProfile();
  const updateProfile = useUpdateMyCreatorProfile();
  const profile = profileQuery.data;
  const [socialLinks, setSocialLinks] = useState<Partial<Record<CreatorSocialPlatform, string>>>({});
  const [selectedCategories, setSelectedCategories] = useState<ContentCategory[]>([]);
  const [bio, setBio] = useState("");
  const [individualProfile, setIndividualProfile] = useState({ fullName: "", stageName: "", primaryRole: "" });
  const [organizationProfile, setOrganizationProfile] = useState({
    organizationName: "",
    contactPersonName: "",
    officialEmail: "",
    organizationType: "",
  });

  useEffect(() => {
    if (!profile) return;

    setSelectedCategories((profile.contentCategories?.map((item) => item.category) ?? [profile.category]).filter(Boolean));
    setSocialLinks(Object.fromEntries((profile.socialLinkRows ?? []).map((link) => [link.platform, link.url])));
    setIndividualProfile({
      fullName: profile.individualProfile?.fullName ?? "",
      stageName: profile.individualProfile?.stageName ?? "",
      primaryRole: profile.individualProfile?.primaryRole ?? "",
    });
    setOrganizationProfile({
      organizationName: profile.ministryOrganizationProfile?.organizationName ?? "",
      contactPersonName: profile.ministryOrganizationProfile?.contactPersonName ?? "",
      officialEmail: profile.ministryOrganizationProfile?.officialEmail ?? "",
      organizationType: profile.ministryOrganizationProfile?.organizationType ?? "",
    });
    setBio(profile.bio ?? "");
  }, [profile]);

  const displayName = profile?.displayName ?? user.name;
  const handle = profile?.handle ?? user.handle;
  const avatarInitial = displayName.trim()[0]?.toUpperCase() ?? user.avatarInitial;

  const toggleCategory = (category: ContentCategory) => {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.length > 1 ? current.filter((item) => item !== category) : current;
      }
      return [...current, category].slice(0, 8);
    });
  };

  const saveProfile = () => {
    if (!profile) return;
    const cleanSocialLinks = compactStringRecord(socialLinks);
    const cleanIndividualProfile = compactStringRecord(individualProfile);
    const cleanOrganizationProfile = compactStringRecord(organizationProfile);

    updateProfile.mutate(
      {
        contentCategories: selectedCategories,
        ...(Object.keys(cleanSocialLinks).length > 0 && { socialLinks: toApiSocialLinks(cleanSocialLinks) }),
        ...(profile.creatorType === "INDIVIDUAL"
          ? { individualProfile: cleanIndividualProfile }
          : { ministryOrganizationProfile: cleanOrganizationProfile }),
      },
      {
        onSuccess: () => toast({ title: "Profile saved" }),
        onError: (error) =>
          toast({
            title: "Could not save profile",
            description: error instanceof Error ? error.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Public profile" title="Creator Profile" subtitle="This is how listeners see your NoraPlus presence." />
      <div className="rounded-3xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-[hsl(350_55%_22%)] via-[hsl(350_45%_15%)] to-background" />
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row md:items-end gap-6">
          <div className="h-24 w-24 rounded-2xl bg-gold-gradient grid place-items-center font-display text-3xl text-primary-foreground ring-4 ring-background shadow-glow">
            {avatarInitial}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl">{displayName}</h2>
            <p className="text-sm text-muted-foreground">noraplus.io/@{handle}</p>
          </div>
          <Link
            to={`/app/creators`}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold hover:bg-gold/10 transition"
          >
            <ExternalLink className="h-4 w-4" /> View public page
          </Link>
        </div>
      </div>
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-6">
        <h3 className="font-display text-lg">Edit profile</h3>
        {profileQuery.isError && <p className="mt-3 text-sm text-destructive">Profile could not be loaded right now.</p>}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Display Name" hint="Managed by NoraPlus after creator approval.">
            <input className={inputCls} value={displayName} disabled readOnly />
          </Field>
          <Field label="Handle" hint="Handles are assigned from your approved application.">
            <input className={inputCls} value={handle} disabled readOnly />
          </Field>
          <div className="md:col-span-2">
            <Field label="Focus categories">
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleCategory(option.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs ring-1 transition",
                      selectedCategories.includes(option.value)
                        ? "bg-gold/10 text-gold ring-gold/40"
                        : "bg-secondary/40 text-muted-foreground ring-border hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          {profile?.creatorType === "INDIVIDUAL" ? (
            <>
              <Field label="Full name">
                <input
                  className={inputCls}
                  value={individualProfile.fullName}
                  onChange={(e) => setIndividualProfile((p) => ({ ...p, fullName: e.target.value }))}
                />
              </Field>
              <Field label="Stage name">
                <input
                  className={inputCls}
                  value={individualProfile.stageName}
                  onChange={(e) => setIndividualProfile((p) => ({ ...p, stageName: e.target.value }))}
                />
              </Field>
              <Field label="Primary role">
                <input
                  className={inputCls}
                  value={individualProfile.primaryRole}
                  onChange={(e) => setIndividualProfile((p) => ({ ...p, primaryRole: e.target.value }))}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Organization name">
                <input
                  className={inputCls}
                  value={organizationProfile.organizationName}
                  onChange={(e) => setOrganizationProfile((p) => ({ ...p, organizationName: e.target.value }))}
                />
              </Field>
              <Field label="Contact person">
                <input
                  className={inputCls}
                  value={organizationProfile.contactPersonName}
                  onChange={(e) => setOrganizationProfile((p) => ({ ...p, contactPersonName: e.target.value }))}
                />
              </Field>
              <Field label="Official email">
                <input
                  type="email"
                  className={inputCls}
                  value={organizationProfile.officialEmail}
                  onChange={(e) => setOrganizationProfile((p) => ({ ...p, officialEmail: e.target.value }))}
                />
              </Field>
              <Field label="Organization type">
                <input
                  className={inputCls}
                  value={organizationProfile.organizationType}
                  onChange={(e) => setOrganizationProfile((p) => ({ ...p, organizationType: e.target.value }))}
                />
              </Field>
            </>
          )}
          {socialPlatforms.map((platform) => (
            <Field key={platform.key} label={`${platform.label} link`}>
              <input
                className={inputCls}
                value={socialLinks[platform.key] ?? ""}
                onChange={(e) => setSocialLinks((current) => ({ ...current, [platform.key]: e.target.value }))}
                placeholder={platform.placeholder}
              />
            </Field>
          ))}
          <div className="md:col-span-2">
            <Field label="Bio">
              <textarea
                rows={4}
                className={cn(inputCls, "resize-none")}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your audience about your ministry or creative work…"
              />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            disabled={!profile || updateProfile.isPending}
            onClick={saveProfile}
            className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
          >
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreatorSettings = () => (
  <div className="space-y-8">
    <SectionHeader eyebrow="Studio" title="Creator Settings" subtitle="Tune the studio to your workflow." />
    <div className="grid gap-6 md:grid-cols-2">
      {[
        { title: "Default visibility", desc: "Set the default visibility for new uploads.", opt: ["Public", "Subscribers Only", "Premium Only"] },
        { title: "Notifications", desc: "Get alerts for plays, comments and live registrations.", opt: ["All activity", "Mentions only", "Off"] },
        { title: "Monetization", desc: "Manage your payout method and tip jar.", opt: ["Enabled", "Disabled"] },
        { title: "Collaborators", desc: "Invite teammates to manage uploads with you.", opt: ["Invite only", "Off"] },
      ].map((s) => (
        <div key={s.title} className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-6">
          <h3 className="font-display text-lg">{s.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.opt.map((o, i) => (
              <span
                key={o}
                className={cn(
                  "rounded-full px-3 py-1 text-xs ring-1",
                  i === 0 ? "bg-gold/10 text-gold ring-gold/40" : "bg-secondary/40 text-muted-foreground ring-border",
                )}
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Upload landing + modals ---------- */

const UploadLanding = ({ openUpload }: { openUpload: (k: UploadKind) => void }) => (
  <div className="space-y-8">
    <SectionHeader eyebrow="Create" title="Upload Content" subtitle="Choose what you'd like to share with the NoraPlus community." />
    <div className="grid gap-5 md:grid-cols-3">
      {[
        { k: "audio" as const, icon: Headphones, title: "Upload Audio", desc: "Messages, music, podcasts, devotionals.", img: content[3].image },
        { k: "video" as const, icon: Film, title: "Upload Video", desc: "Films, music videos, podcast videos, skits.", img: content[4].image },
        { k: "live" as const, icon: Radio, title: "Create Live Event", desc: "Schedule a live stream or service.", img: content[2].image },
      ].map((c) => (
        <button
          key={c.k}
          onClick={() => openUpload(c.k)}
          className="group relative overflow-hidden text-left rounded-3xl ring-1 ring-border/60 hover:ring-gold/50 transition-all h-72"
        >
          <img
            src={c.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="relative h-full p-6 flex flex-col justify-end">
            <div className="h-12 w-12 rounded-xl bg-red-gradient grid place-items-center shadow-red-glow mb-4">
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl">{c.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold">
              Start <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const FileDrop = ({
  label,
  icon: Icon,
  tall,
  accept,
  file,
  onFile,
}: {
  label: string;
  icon: typeof Upload;
  tall?: boolean;
  accept?: string;
  file?: File | null;
  onFile?: (file: File | null) => void;
}) => (
  <label
    className={cn(
      "flex items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-secondary/30 px-4 text-center hover:border-gold transition-colors cursor-pointer",
      tall ? "h-44" : "h-28",
    )}
  >
    {onFile && <input type="file" accept={accept} className="sr-only" onChange={(event) => onFile(event.target.files?.[0] ?? null)} />}
    <div className="text-center">
      <Icon className="mx-auto h-6 w-6 text-gold" />
      <p className="mt-2 break-words text-xs text-muted-foreground">{file?.name ?? label}</p>
    </div>
  </label>
);

const VisibilityField = ({ visibility, onChange }: { visibility: ContentVisibility; onChange: (value: ContentVisibility) => void }) => (
  <Field label="Visibility" required>
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Public", value: "PUBLIC" as const, icon: Globe },
        { label: "Subscribers Only", value: "SUBSCRIBERS_ONLY" as const, icon: Star },
        { label: "Premium Only", value: "PREMIUM_ONLY" as const, icon: Lock },
      ].map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition",
            visibility === o.value ? "border-gold bg-gold/10 text-gold" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40",
          )}
        >
          <o.icon className="h-3.5 w-3.5" /> {o.label}
        </button>
      ))}
    </div>
  </Field>
);

const ReleaseField = ({ status, onChange }: { status: ContentStatus; onChange: (value: ContentStatus) => void }) => (
  <Field label="Release option" required>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Publish Now", value: "PUBLISHED" as const },
        { label: "Save Draft", value: "DRAFT" as const },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border px-3 py-2 text-xs transition",
            status === o.value ? "border-gold bg-gold/10 text-gold" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  </Field>
);

const UploadModal = ({ kind, onClose, onSubmit }: { kind: UploadKind; onClose: () => void; onSubmit: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ContentCategory>("SERMON");
  const [tags, setTags] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [detectedDurationSeconds, setDetectedDurationSeconds] = useState<number | null>(null);
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<ContentVisibility>("PUBLIC");
  const [releaseStatus, setReleaseStatus] = useState<ContentStatus>("PUBLISHED");
  const [eventType, setEventType] = useState<LiveEventType>("WORSHIP_NIGHT");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [streamUrl, setStreamUrl] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [bucketId, setBucketId] = useState("");
  const createContent = useCreateOwnContent();
  const createLiveEvent = useCreateOwnLiveEvent();
  const updateContent = useUpdateOwnContent();
  const presignUpload = usePresignUpload();
  const confirmUpload = useConfirmUpload();
  const addBucketItem = useAddBucketItem();
  const bucketsQuery = useBuckets();

  useEffect(() => {
    let cancelled = false;
    setDetectedDurationSeconds(null);

    if (!mediaFile || kind === "live") {
      setIsDetectingDuration(false);
      return;
    }

    setIsDetectingDuration(true);
    void readMediaDurationSeconds(mediaFile).then((seconds) => {
      if (cancelled) return;
      setDetectedDurationSeconds(seconds);
      setIsDetectingDuration(false);
    });

    return () => {
      cancelled = true;
    };
  }, [kind, mediaFile]);

  if (!kind) return null;
  const titles: Record<Exclude<UploadKind, null>, string> = {
    audio: "Upload Audio",
    video: "Upload Video",
    live: "Create Live Event",
  };
  const isBusy =
    createContent.isPending ||
    createLiveEvent.isPending ||
    updateContent.isPending ||
    presignUpload.isPending ||
    confirmUpload.isPending ||
    addBucketItem.isPending;
  const contentType: ContentType = kind === "video" ? "VIDEO" : "AUDIO";
  const mediaFolder = kind === "video" ? "videos" : "audio";
  const mediaAccept = kind === "video" ? "video/mp4,video/webm,video/quicktime" : "audio/mpeg,audio/mp4,audio/wav,audio/ogg";
  const eligibleBuckets = (bucketsQuery.data ?? []).filter((bucket) => bucket.type === contentType);

  const submitContent = async (targetStatus: ContentStatus) => {
    if (kind === "live") {
      if (!title.trim() || !eventDate || !eventStartTime) {
        toast({ title: "Title, date, and start time are required", variant: "destructive" });
        return;
      }

      try {
        const scheduledAt = new Date(`${eventDate}T${eventStartTime}`).toISOString();
        const endTime = eventEndTime ? new Date(`${eventDate}T${eventEndTime}`).toISOString() : undefined;
        await createLiveEvent.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          eventType,
          scheduledAt,
          startTime: scheduledAt,
          endTime,
          timezone: timezone.trim() || undefined,
          streamUrl: streamUrl.trim() || undefined,
          registrationRequired,
          visibility,
        });
        onSubmit();
      } catch (error) {
        toast({
          title: "Live event could not be created",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (targetStatus === "PUBLISHED" && !mediaFile) {
      toast({ title: "Choose a media file before publishing", variant: "destructive" });
      return;
    }

    try {
      const created = await createContent.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        type: contentType,
        mediaType: kind === "video" ? "VIDEO" : "AUDIO",
        category,
        durationSeconds: detectedDurationSeconds ?? undefined,
        visibility,
        status: "DRAFT",
        tags: splitTags(tags),
      });

      if (thumbnailFile) {
        const thumbnail = await presignUpload.mutateAsync({
          fileName: thumbnailFile.name,
          contentType: thumbnailFile.type,
          fileSize: thumbnailFile.size,
          folder: "thumbnails",
        });
        await uploadFileToPresignedUrl(thumbnailFile, thumbnail.uploadUrl);
        await confirmUpload.mutateAsync({ key: thumbnail.key, contentId: created.id, assetRole: "thumbnail" });
      }

      if (mediaFile) {
        const assetRole: UploadAssetRole = kind === "video" ? "primary_video" : "primary_audio";
        const media = await presignUpload.mutateAsync({
          fileName: mediaFile.name,
          contentType: mediaFile.type,
          fileSize: mediaFile.size,
          folder: mediaFolder,
        });
        await uploadFileToPresignedUrl(mediaFile, media.uploadUrl);
        await confirmUpload.mutateAsync({ key: media.key, contentId: created.id, assetRole });
      }

      if (bucketId) {
        await addBucketItem.mutateAsync({ bucketId, contentId: created.id });
      }

      if (targetStatus === "PUBLISHED") {
        await updateContent.mutateAsync({ contentId: created.id, input: { status: "PUBLISHED" } });
      }

      onSubmit();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto scrollbar-theme bg-background/80 p-2 backdrop-blur-xl animate-fade-in sm:p-4">
      <div className="relative mx-auto my-4 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-card-gradient ring-1 ring-gold/30 shadow-glow sm:my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-background/60 hover:bg-secondary/70"
          aria-label="Close upload dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="border-b border-border/70 px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8 md:px-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Creator Studio</p>
          <h2 className="mt-2 pr-12 font-display text-2xl sm:text-3xl">{titles[kind]}</h2>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-6 md:px-10">
          {kind === "audio" && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Audio file" required>
                  <FileDrop
                    label="Drop your audio or click to browse - MP3, WAV, AAC"
                    icon={MusicIcon}
                    tall
                    accept={mediaAccept}
                    file={mediaFile}
                    onFile={setMediaFile}
                  />
                </Field>
              </div>
              <p className="md:col-span-2 -mt-2 text-xs text-muted-foreground">
                {isDetectingDuration
                  ? "Detecting audio duration..."
                  : detectedDurationSeconds
                    ? `Detected duration: ${formatDetectedDuration(detectedDurationSeconds)}`
                    : "Duration will be detected automatically from the uploaded media."}
              </p>
              <Field label="Cover art">
                <FileDrop
                  label="Upload cover art - 1:1 recommended"
                  icon={ImageIcon}
                  accept="image/jpeg,image/png,image/webp"
                  file={thumbnailFile}
                  onFile={setThumbnailFile}
                />
              </Field>
              <Field label="Title" required>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Encountering Truth" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    rows={3}
                    className={cn(inputCls, "resize-none")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this audio about?"
                  />
                </Field>
              </div>
              <Field label="Category" required>
                <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as ContentCategory)}>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tags">
                <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="worship, faith, prayer" />
              </Field>
              <Field label="Language" required>
                <input className={inputCls} placeholder="English" />
              </Field>
              <Field label="Add to bucket" hint="Optional — group this into an album">
                <select
                  className={inputCls}
                  value={bucketId}
                  onChange={(e) => setBucketId(e.target.value)}
                  disabled={eligibleBuckets.length === 0}
                >
                  <option value="">{eligibleBuckets.length === 0 ? "No albums yet" : "No bucket"}</option>
                  {eligibleBuckets.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.title}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <VisibilityField visibility={visibility} onChange={setVisibility} />
              </div>
              <div className="md:col-span-2">
                <ReleaseField status={releaseStatus} onChange={setReleaseStatus} />
              </div>
            </div>
          )}

          {kind === "video" && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Video file" required>
                  <FileDrop
                    label="Drop your video or click to browse - MP4, MOV"
                    icon={Film}
                    tall
                    accept={mediaAccept}
                    file={mediaFile}
                    onFile={setMediaFile}
                  />
                </Field>
              </div>
              <p className="md:col-span-2 -mt-2 text-xs text-muted-foreground">
                {isDetectingDuration
                  ? "Detecting video duration..."
                  : detectedDurationSeconds
                    ? `Detected duration: ${formatDetectedDuration(detectedDurationSeconds)}`
                    : "Duration will be detected automatically from the uploaded media."}
              </p>
              <Field label="Thumbnail">
                <FileDrop
                  label="Upload thumbnail - 16:9"
                  icon={ImageIcon}
                  accept="image/jpeg,image/png,image/webp"
                  file={thumbnailFile}
                  onFile={setThumbnailFile}
                />
              </Field>
              <Field label="Trailer (optional)">
                <FileDrop label="Upload short trailer" icon={Film} />
              </Field>
              <Field label="Title" required>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Narrow Way" />
              </Field>
              <Field label="Category" required>
                <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as ContentCategory)}>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    rows={3}
                    className={cn(inputCls, "resize-none")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this video about?"
                  />
                </Field>
              </div>
              <Field label="Tags">
                <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kingdom, story, film" />
              </Field>
              <Field label="Language" required>
                <input className={inputCls} placeholder="English" />
              </Field>
              <Field label="Add to bucket" hint="Optional — group this into a series">
                <select
                  className={inputCls}
                  value={bucketId}
                  onChange={(e) => setBucketId(e.target.value)}
                  disabled={eligibleBuckets.length === 0}
                >
                  <option value="">{eligibleBuckets.length === 0 ? "No series yet" : "No bucket"}</option>
                  {eligibleBuckets.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.title}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <VisibilityField visibility={visibility} onChange={setVisibility} />
              </div>
              <div className="md:col-span-2">
                <ReleaseField status={releaseStatus} onChange={setReleaseStatus} />
              </div>
            </div>
          )}

          {kind === "live" && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Event banner" required>
                  <FileDrop label="Upload event banner - 16:9" icon={ImageIcon} tall />
                </Field>
              </div>
              <Field label="Event title" required>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Worship Night Lagos" />
              </Field>
              <Field label="Event type" required>
                <select className={inputCls} value={eventType} onChange={(e) => setEventType(e.target.value as LiveEventType)}>
                  {liveEventTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea
                    rows={3}
                    className={cn(inputCls, "resize-none")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What can guests expect?"
                  />
                </Field>
              </div>
              <Field label="Date" required>
                <input type="date" className={inputCls} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </Field>
              <Field label="Time zone" required>
                <input className={inputCls} value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Africa/Lagos" />
              </Field>
              <Field label="Start time" required>
                <input type="time" className={inputCls} value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} />
              </Field>
              <Field label="End time" required>
                <input type="time" className={inputCls} value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Streaming URL">
                  <input className={inputCls} value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="rtmp:// or https://" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center justify-between rounded-2xl border border-border bg-secondary/30 p-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">Require registration</p>
                    <p className="text-xs text-muted-foreground">Guests register to receive a reminder and link.</p>
                  </div>
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={registrationRequired}
                    onChange={(e) => setRegistrationRequired(e.target.checked)}
                  />
                  <span className={cn("relative h-6 w-11 rounded-full transition", registrationRequired ? "bg-gold-gradient" : "bg-muted")}>
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-background transition",
                        registrationRequired ? "right-0.5" : "left-0.5",
                      )}
                    />
                  </span>
                </label>
              </div>
              <div className="md:col-span-2">
                <VisibilityField visibility={visibility} onChange={setVisibility} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card-gradient/95 px-5 py-4 sm:px-8 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={onClose} className="rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                disabled={isBusy}
                onClick={() => submitContent("DRAFT")}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold hover:bg-gold/10 disabled:opacity-50"
              >
                {isBusy ? "Working..." : "Save Draft"}
              </button>
              <button
                disabled={isBusy}
                onClick={() => submitContent(releaseStatus)}
                className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
              >
                {kind === "live" ? (
                  <>
                    <Calendar className="h-4 w-4" /> Schedule Event
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> {releaseStatus === "PUBLISHED" ? "Publish" : "Save Draft"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ onClose, onAnother }: { onClose: () => void; onAnother: () => void }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-xl p-4 animate-fade-in">
    <div className="relative w-full max-w-md rounded-3xl bg-card-gradient ring-1 ring-gold/40 p-10 text-center shadow-glow">
      <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-red/20 blur-3xl" />
      <div className="relative">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-gradient shadow-glow">
          <Check className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="mt-6 font-display text-2xl">Content Submitted</h2>
        <p className="mt-3 text-sm text-muted-foreground">Your content has been uploaded successfully and is now being prepared for NoraPlus.</p>
        <div className="mt-7 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"
          >
            View Content
          </button>
          <button
            onClick={onAnother}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold hover:bg-gold/10"
          >
            Upload Another
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ---------- Shell ---------- */

export const CreatorStudio = () => {
  const [section, setSection] = useState<Section>("overview");
  const [upload, setUpload] = useState<UploadKind>(null);
  const [success, setSuccess] = useState(false);
  const ownContentQuery = useOwnCreatorContent({ limit: 50 });
  const studioItems = useMemo(() => (ownContentQuery.data ?? []).map(toStudioContentItem), [ownContentQuery.data]);
  const audioItemsForStudio = studioItems.filter((item) => item.type !== "VIDEO");
  const videoItemsForStudio = studioItems.filter((item) => item.type === "VIDEO");

  const openUpload = (k: UploadKind) => setUpload(k);
  const finishUpload = () => {
    setUpload(null);
    setSuccess(true);
  };

  const body = useMemo(() => {
    switch (section) {
      case "overview":
        return <Overview goto={setSection} openUpload={openUpload} items={studioItems} />;
      case "upload":
        return <UploadLanding openUpload={openUpload} />;
      case "audio":
        return <AudioLibrary openUpload={openUpload} items={audioItemsForStudio} />;
      case "video":
        return <VideoLibrary openUpload={openUpload} items={videoItemsForStudio} />;
      case "buckets":
        return <BucketsLibrary />;
      case "live":
        return <LiveManager openUpload={openUpload} />;
      case "analytics":
        return <Analytics />;
      case "profile":
        return <CreatorProfileView />;
      case "settings":
        return <CreatorSettings />;
    }
  }, [audioItemsForStudio, section, studioItems, videoItemsForStudio]);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 self-start">
        <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-3">
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gold">Creator Studio</p>
          <nav className="mt-1 space-y-0.5">
            {nav.map((n) => {
              const active = section === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-red-gradient text-primary-foreground shadow-red-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  <n.icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-gold")} />
                  {n.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">{body}</div>

      <UploadModal kind={upload} onClose={() => setUpload(null)} onSubmit={finishUpload} />
      {success && (
        <SuccessModal
          onClose={() => {
            setSuccess(false);
            setSection("audio");
          }}
          onAnother={() => {
            setSuccess(false);
            setSection("upload");
          }}
        />
      )}
    </div>
  );
};

export default CreatorStudio;
