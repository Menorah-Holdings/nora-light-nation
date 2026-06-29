import { useMemo, useState } from "react";
import {
  LayoutDashboard, Upload, Headphones, Play, Radio, BarChart3, UserCircle, Settings as SettingsIcon,
  ArrowUpRight, Eye, Pencil, Trash2, Search, Plus, Calendar, Image as ImageIcon, Music as MusicIcon,
  Film, Check, X, MoreHorizontal, Filter, Clock, Globe, Lock, Star, ExternalLink, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { content } from "@/lib/mockData";
import { useUser } from "@/lib/user";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { adaptContent, formatCategory, formatCompactNumber } from "@/lib/api/adapters";
import {
  useCreateOwnContent,
  useDeleteOwnContent,
  useOwnCreatorContent,
  useUpdateOwnContent,
} from "@/lib/api/hooks/useCreators";
import {
  uploadFileToPresignedUrl,
  useConfirmUpload,
  usePresignUpload,
} from "@/lib/api/hooks/useUpload";
import type { ApiContent, ContentCategory, ContentType } from "@/lib/api/types";

type Section = "overview" | "upload" | "audio" | "video" | "live" | "analytics" | "profile" | "settings";
type UploadKind = "audio" | "video" | "live" | null;
type StudioContentItem = {
  id: string;
  title: string;
  image: string;
  category: string;
  categoryValue: ContentCategory;
  duration: string;
  status: "Published" | "Draft";
  plays: string;
  views: string;
  published: string;
  isPublished: boolean;
  type: ContentType;
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

const nav: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "upload", label: "Upload Content", icon: Upload },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "video", label: "Video", icon: Play },
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
    <span className="text-sm text-foreground/90">{label}{required && <span className="text-gold"> *</span>}</span>
    <div className="mt-2">{children}</div>
    {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
  </label>
);

const StatusBadge = ({ status }: { status: "Published" | "Draft" | "Scheduled" | "Review" | "Live" | "Ended" }) => {
  const map: Record<string, string> = {
    Published: "bg-gold/15 text-gold ring-gold/30",
    Draft: "bg-muted text-muted-foreground ring-border",
    Scheduled: "bg-red/15 text-red-foreground ring-red/30",
    Review: "bg-secondary text-muted-foreground ring-border",
    Live: "bg-red-gradient text-primary-foreground ring-red/40 shadow-red-glow",
    Ended: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1", map[status])}>
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

const audioItems = content.filter(c => c.medium === "audio").slice(0, 6).map((c, i) => ({
  ...c,
  status: (["Published", "Draft", "Scheduled", "Published", "Review", "Published"] as const)[i],
  plays: ["48,210", "—", "—", "12,894", "—", "92,401"][i],
  published: ["May 12, 2026", "—", "Jun 30, 2026", "Apr 02, 2026", "—", "Mar 18, 2026"][i],
  category: ["Worship", "Teaching", "Devotional", "Worship", "Podcast", "Teaching"][i],
}));

const videoItems = content.filter(c => c.medium === "video").slice(0, 5).map((c, i) => ({
  ...c,
  status: (["Published", "Draft", "Published", "Scheduled", "Published"] as const)[i],
  views: ["128K", "—", "84K", "—", "212K"][i],
  published: ["May 04, 2026", "—", "Apr 18, 2026", "Jul 04, 2026", "Feb 22, 2026"][i],
  category: ["Film", "Worship", "Podcast", "Teaching", "Skit"][i],
}));

const liveItems = [
  { id: "le1", title: "Worship Night Lagos", banner: content[2].image, type: "Worship", date: "Jun 28, 2026 · 7:00 PM", status: "Scheduled" as const, regs: "1,204", viewers: "—" },
  { id: "le2", title: "Sunday Service Live", banner: content[0].image, type: "Service", date: "Live now", status: "Live" as const, regs: "8,420", viewers: "12,894" },
  { id: "le3", title: "Kingdom Conference Replay", banner: content[3].image, type: "Conference", date: "May 12, 2026", status: "Ended" as const, regs: "4,128", viewers: "9,401" },
];

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
    status: item.isPublished ? "Published" : "Draft",
    plays: count,
    views: count,
    published: item.isPublished ? formatStudioDate(item.createdAt) : "Draft",
    isPublished: Boolean(item.isPublished),
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

/* ---------- Overview ---------- */

const Overview = ({
  goto,
  openUpload,
  items,
}: {
  goto: (s: Section) => void;
  openUpload: (k: UploadKind) => void;
  items: StudioContentItem[];
}) => {
  const { user } = useUser();
  const publishedCount = items.filter((item) => item.isPublished).length;
  const draftCount = items.length - publishedCount;
  const recentItems = items.slice(0, 4);
  const summary = [
    { label: "Uploads", value: String(items.length) },
    { label: "Published", value: String(publishedCount) },
    { label: "Drafts", value: String(draftCount) },
    { label: "Followers", value: "0" },
    { label: "Total Plays", value: "0" },
    { label: "Upcoming Live", value: "0" },
  ];
  const activity = [
    { t: "Published “Encountering Truth”", at: "2h ago" },
    { t: "1,204 new followers this week", at: "1d ago" },
    { t: "Live Event scheduled · Worship Night Lagos", at: "2d ago" },
    { t: "“Morning Light Devotional” reached 50K plays", at: "4d ago" },
  ];

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
        {summary.map(s => (
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
          ].map(a => (
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
            <button onClick={() => goto("audio")} className="text-xs text-gold hover:underline">View library</button>
          </div>
          <div className="divide-y divide-border/60">
            {recentItems.length === 0 && (
              <div className="px-6 py-8 text-sm text-muted-foreground">
                Your uploaded content will appear here.
              </div>
            )}
            {recentItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <img src={item.image} alt="" className="h-14 w-14 rounded-lg object-cover ring-1 ring-border/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatCategory(item.categoryValue)} - {item.published} - {item.plays} plays</p>
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

const Toolbar = ({ placeholder, filters }: { placeholder: string; filters: string[] }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="relative flex-1 min-w-[220px] max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input placeholder={placeholder} className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold" />
    </div>
    {filters.map(f => (
      <button key={f} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs text-muted-foreground hover:border-gold/40 hover:text-foreground transition">
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
      { contentId: item.id, input: { isPublished: !item.isPublished } },
      {
        onSuccess: () => toast({ title: item.isPublished ? "Moved to drafts" : "Published" }),
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
      <button disabled={pending} onClick={togglePublished} title={item.isPublished ? "Move to draft" : "Publish"} className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-50">
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </button>
      <button disabled={pending} onClick={remove} title="Delete" className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-50">
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};

const AudioLibrary = ({ openUpload, items }: { openUpload: (k: UploadKind) => void; items: StudioContentItem[] }) => {
  if (items.length === 0) {
    return <EmptyState icon={Headphones} title="No audio uploaded yet." cta="Upload Audio" onCta={() => openUpload("audio")} />;
  }
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Library" title="Audio" subtitle="Manage your audio uploads, drafts and scheduled releases."
        action={<button onClick={() => openUpload("audio")} className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"><Plus className="h-4 w-4" /> Upload Audio</button>}
      />
      <Toolbar placeholder="Search audio…" filters={["Category", "Status", "Sort"]} />
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
              {items.map(item => (
                <tr key={item.id} className="border-t border-border/60 hover:bg-background/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-10 w-10 rounded object-cover" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.duration}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{item.plays}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.published}</td>
                  <td className="px-6 py-4"><RowActions item={item} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const VideoLibrary = ({ openUpload, items }: { openUpload: (k: UploadKind) => void; items: StudioContentItem[] }) => {
  if (items.length === 0) {
    return <EmptyState icon={Play} title="No videos uploaded yet." cta="Upload Video" onCta={() => openUpload("video")} />;
  }
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Library" title="Video" subtitle="Films, music videos, podcasts and skits."
        action={<button onClick={() => openUpload("video")} className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"><Plus className="h-4 w-4" /> Upload Video</button>}
      />
      <Toolbar placeholder="Search video…" filters={["Category", "Status", "Sort"]} />
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
              {items.map(item => (
                <tr key={item.id} className="border-t border-border/60 hover:bg-background/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-10 w-16 rounded object-cover" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.duration}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{item.views}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.published}</td>
                  <td className="px-6 py-4"><RowActions item={item} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LiveManager = ({ openUpload }: { openUpload: (k: UploadKind) => void }) => {
  if (liveItems.length === 0) {
    return <EmptyState icon={Radio} title="No live events scheduled." cta="Create Live Event" onCta={() => openUpload("live")} />;
  }
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Manager" title="Live Events" subtitle="Schedule, stream and review your live experiences."
        action={<button onClick={() => openUpload("live")} className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"><Plus className="h-4 w-4" /> New Event</button>}
      />
      <Toolbar placeholder="Search events…" filters={["Event type", "Status", "Upcoming only"]} />
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
              <tr>
                <th className="px-6 py-3 font-normal">Event</th>
                <th className="px-6 py-3 font-normal">Type</th>
                <th className="px-6 py-3 font-normal">Date</th>
                <th className="px-6 py-3 font-normal">Status</th>
                <th className="px-6 py-3 font-normal">Registrations</th>
                <th className="px-6 py-3 font-normal">Viewers</th>
                <th className="px-6 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {liveItems.map(e => (
                <tr key={e.id} className="border-t border-border/60 hover:bg-background/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={e.banner} alt="" className="h-10 w-16 rounded object-cover" />
                      <span className="font-medium">{e.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{e.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.date}</td>
                  <td className="px-6 py-4"><StatusBadge status={e.status} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{e.regs}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.viewers}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {e.status === "Scheduled" && (
                        <button title="Go Live" className="inline-flex items-center gap-1 rounded-full bg-red-gradient px-3 py-1 text-[11px] font-medium text-primary-foreground shadow-red-glow">
                          <Radio className="h-3 w-3" /> Go Live
                        </button>
                      )}
                      {e.status === "Live" && (
                        <button title="End Event" className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-[11px] text-destructive hover:bg-destructive/10">
                          End Event
                        </button>
                      )}
                      <button title="More" className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
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
  const stats = [
    { label: "Total plays", value: "1.24M", trend: "+12.4%" },
    { label: "Watch time", value: "84,210 hr", trend: "+8.2%" },
    { label: "Avg. completion", value: "72%", trend: "+3.1%" },
    { label: "New followers", value: "12,406", trend: "+24%" },
  ];
  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Insights" title="Analytics" subtitle="Track how your content is performing across NoraPlus." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-3 font-display text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-gold inline-flex items-center gap-1">{s.trend} <ArrowUpRight className="h-3 w-3" /></p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-8">
        <h3 className="font-display text-lg">Plays over the last 30 days</h3>
        <div className="mt-6 h-48 flex items-end gap-2">
          {[40, 55, 38, 62, 70, 48, 80, 92, 76, 88, 95, 72, 84, 100, 90].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-red/60 to-gold/60" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Creator Profile preview ---------- */

const CreatorProfileView = () => {
  const { user } = useUser();
  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Public profile" title="Creator Profile" subtitle="This is how listeners see your NoraPlus presence." />
      <div className="rounded-3xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-[hsl(350_55%_22%)] via-[hsl(350_45%_15%)] to-background" />
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row md:items-end gap-6">
          <div className="h-24 w-24 rounded-2xl bg-gold-gradient grid place-items-center font-display text-3xl text-primary-foreground ring-4 ring-background shadow-glow">
            {user.avatarInitial}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl">{user.name}</h2>
            <p className="text-sm text-muted-foreground">noraplus.io/@{user.handle}</p>
          </div>
          <Link to={`/app/creators`} className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold hover:bg-gold/10 transition">
            <ExternalLink className="h-4 w-4" /> View public page
          </Link>
        </div>
      </div>
      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-6">
        <h3 className="font-display text-lg">Edit profile</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Display Name"><input className={inputCls} defaultValue={user.name} /></Field>
          <Field label="Handle"><input className={inputCls} defaultValue={user.handle} /></Field>
          <div className="md:col-span-2">
            <Field label="Bio"><textarea rows={4} className={cn(inputCls, "resize-none")} placeholder="Tell your audience about your ministry or creative work…" /></Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => toast({ title: "Profile saved" })} className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow">Save changes</button>
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
      ].map(s => (
        <div key={s.title} className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-6">
          <h3 className="font-display text-lg">{s.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.opt.map((o, i) => (
              <span key={o} className={cn("rounded-full px-3 py-1 text-xs ring-1", i === 0 ? "bg-gold/10 text-gold ring-gold/40" : "bg-secondary/40 text-muted-foreground ring-border")}>{o}</span>
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
      ].map(c => (
        <button
          key={c.k}
          onClick={() => openUpload(c.k)}
          className="group relative overflow-hidden text-left rounded-3xl ring-1 ring-border/60 hover:ring-gold/50 transition-all h-72"
        >
          <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="relative h-full p-6 flex flex-col justify-end">
            <div className="h-12 w-12 rounded-xl bg-red-gradient grid place-items-center shadow-red-glow mb-4">
              <c.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl">{c.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold">Start <ArrowUpRight className="h-3.5 w-3.5" /></span>
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
  <label className={cn("flex items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-secondary/30 hover:border-gold transition-colors cursor-pointer", tall ? "h-44" : "h-28")}>
    {onFile && (
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
    )}
    <div className="text-center">
      <Icon className="mx-auto h-6 w-6 text-gold" />
      <p className="mt-2 text-xs text-muted-foreground">{file?.name ?? label}</p>
    </div>
  </label>
);

const VisibilityField = ({ isPremium, onChange }: { isPremium: boolean; onChange: (value: boolean) => void }) => (
  <Field label="Visibility" required>
    <div className="grid grid-cols-3 gap-2">
      {[
        { v: "Public", icon: Globe, premium: false },
        { v: "Subscribers Only", icon: Star, premium: false },
        { v: "Premium Only", icon: Lock, premium: true },
      ].map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.premium)} className={cn("inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition", isPremium === o.premium ? "border-gold bg-gold/10 text-gold" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40")}>
          <o.icon className="h-3.5 w-3.5" /> {o.v}
        </button>
      ))}
    </div>
  </Field>
);

const ReleaseField = ({ isPublished, onChange }: { isPublished: boolean; onChange: (value: boolean) => void }) => (
  <Field label="Release option" required>
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Publish Now", value: true },
        { label: "Save Draft", value: false },
        { label: "Schedule Release", value: false },
      ].map((o) => (
        <button key={o.label} type="button" onClick={() => onChange(o.value)} className={cn("rounded-xl border px-3 py-2 text-xs transition", isPublished === o.value ? "border-gold bg-gold/10 text-gold" : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40")}>{o.label}</button>
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const createContent = useCreateOwnContent();
  const updateContent = useUpdateOwnContent();
  const presignUpload = usePresignUpload();
  const confirmUpload = useConfirmUpload();

  if (!kind) return null;
  const titles: Record<Exclude<UploadKind, null>, string> = {
    audio: "Upload Audio",
    video: "Upload Video",
    live: "Create Live Event",
  };
  const isBusy = createContent.isPending || updateContent.isPending || presignUpload.isPending || confirmUpload.isPending;
  const contentType: ContentType = kind === "video" ? "VIDEO" : "AUDIO";
  const mediaFolder = kind === "video" ? "videos" : "audio";
  const mediaAccept = kind === "video" ? "video/mp4,video/webm,video/quicktime" : "audio/mpeg,audio/mp4,audio/wav,audio/ogg";

  const submitContent = async (publish: boolean) => {
    if (kind === "live") {
      toast({
        title: "Live events are not wired yet",
        description: "Creator live-event endpoints are still tracked as backend work.",
      });
      return;
    }

    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (publish && !mediaFile) {
      toast({ title: "Choose a media file before publishing", variant: "destructive" });
      return;
    }

    try {
      let thumbnailUrl: string | undefined;

      if (thumbnailFile) {
        const thumbnail = await presignUpload.mutateAsync({
          fileName: thumbnailFile.name,
          contentType: thumbnailFile.type,
          fileSize: thumbnailFile.size,
          folder: "thumbnails",
        });
        await uploadFileToPresignedUrl(thumbnailFile, thumbnail.uploadUrl);
        thumbnailUrl = thumbnail.publicUrl;
      }

      const created = await createContent.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        type: contentType,
        category,
        thumbnailUrl,
        isPremium,
        isPublished: false,
        tags: splitTags(tags),
      });

      if (mediaFile) {
        const media = await presignUpload.mutateAsync({
          fileName: mediaFile.name,
          contentType: mediaFile.type,
          fileSize: mediaFile.size,
          folder: mediaFolder,
        });
        await uploadFileToPresignedUrl(mediaFile, media.uploadUrl);
        await confirmUpload.mutateAsync({ key: media.key, contentId: created.id });
      }

      if (publish) {
        await updateContent.mutateAsync({ contentId: created.id, input: { isPublished: true } });
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card-gradient ring-1 ring-gold/30 p-6 md:p-10 shadow-glow">
        <button onClick={onClose} className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full hover:bg-secondary/60"><X className="h-4 w-4" /></button>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Creator Studio</p>
        <h2 className="mt-2 font-display text-3xl">{titles[kind]}</h2>

        {kind === "audio" && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><Field label="Audio file" required><FileDrop label="Drop your audio or click to browse - MP3, WAV, AAC" icon={MusicIcon} tall accept={mediaAccept} file={mediaFile} onFile={setMediaFile} /></Field></div>
            <Field label="Cover art"><FileDrop label="Upload cover art - 1:1 recommended" icon={ImageIcon} accept="image/jpeg,image/png,image/webp" file={thumbnailFile} onFile={setThumbnailFile} /></Field>
            <Field label="Title" required><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Encountering Truth" /></Field>
            <div className="md:col-span-2"><Field label="Description"><textarea rows={3} className={cn(inputCls, "resize-none")} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this audio about?" /></Field></div>
            <Field label="Category" required>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as ContentCategory)}>
                {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Tags"><input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="worship, faith, prayer" /></Field>
            <Field label="Language" required><input className={inputCls} placeholder="English" /></Field>
            <div className="md:col-span-2"><VisibilityField isPremium={isPremium} onChange={setIsPremium} /></div>
            <div className="md:col-span-2"><ReleaseField isPublished={isPublished} onChange={setIsPublished} /></div>
          </div>
        )}

        {kind === "video" && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><Field label="Video file" required><FileDrop label="Drop your video or click to browse - MP4, MOV" icon={Film} tall accept={mediaAccept} file={mediaFile} onFile={setMediaFile} /></Field></div>
            <Field label="Thumbnail"><FileDrop label="Upload thumbnail - 16:9" icon={ImageIcon} accept="image/jpeg,image/png,image/webp" file={thumbnailFile} onFile={setThumbnailFile} /></Field>
            <Field label="Trailer (optional)"><FileDrop label="Upload short trailer" icon={Film} /></Field>
            <Field label="Title" required><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Narrow Way" /></Field>
            <Field label="Category" required>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as ContentCategory)}>
                {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2"><Field label="Description"><textarea rows={3} className={cn(inputCls, "resize-none")} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this video about?" /></Field></div>
            <Field label="Tags"><input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kingdom, story, film" /></Field>
            <Field label="Language" required><input className={inputCls} placeholder="English" /></Field>
            <div className="md:col-span-2"><VisibilityField isPremium={isPremium} onChange={setIsPremium} /></div>
            <div className="md:col-span-2"><ReleaseField isPublished={isPublished} onChange={setIsPublished} /></div>
          </div>
        )}

        {kind === "live" && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><Field label="Event banner" required><FileDrop label="Upload event banner · 16:9" icon={ImageIcon} tall /></Field></div>
            <Field label="Event title" required><input className={inputCls} placeholder="Worship Night Lagos" /></Field>
            <Field label="Event type" required><input className={inputCls} placeholder="Worship · Service · Conference" /></Field>
            <div className="md:col-span-2"><Field label="Description"><textarea rows={3} className={cn(inputCls, "resize-none")} placeholder="What can guests expect?" /></Field></div>
            <Field label="Date" required><input type="date" className={inputCls} /></Field>
            <Field label="Time zone" required><input className={inputCls} placeholder="WAT · GMT+1" /></Field>
            <Field label="Start time" required><input type="time" className={inputCls} /></Field>
            <Field label="End time" required><input type="time" className={inputCls} /></Field>
            <div className="md:col-span-2"><Field label="Streaming URL"><input className={inputCls} placeholder="rtmp:// or https://" /></Field></div>
            <div className="md:col-span-2">
              <label className="flex items-center justify-between rounded-2xl border border-border bg-secondary/30 p-4">
                <div>
                  <p className="text-sm font-medium">Require registration</p>
                  <p className="text-xs text-muted-foreground">Guests register to receive a reminder and link.</p>
                </div>
                <span className="relative h-6 w-11 rounded-full bg-gold-gradient">
                  <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-background" />
                </span>
              </label>
            </div>
            <div className="md:col-span-2"><VisibilityField isPremium={isPremium} onChange={setIsPremium} /></div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <button onClick={onClose} className="rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <div className="flex gap-3">
            <button disabled={isBusy} onClick={() => submitContent(false)} className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold hover:bg-gold/10 disabled:opacity-50">
              {isBusy ? "Working..." : "Save Draft"}
            </button>
            <button disabled={isBusy} onClick={() => submitContent(isPublished)} className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50">
              {kind === "live" ? <><Calendar className="h-4 w-4" /> Schedule Event</> : <><Sparkles className="h-4 w-4" /> {isPublished ? "Publish" : "Save Draft"}</>}
            </button>
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
          <button onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow">View Content</button>
          <button onClick={onAnother} className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold hover:bg-gold/10">Upload Another</button>
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
  const studioItems = useMemo(
    () => (ownContentQuery.data ?? []).map(toStudioContentItem),
    [ownContentQuery.data],
  );
  const audioItemsForStudio = studioItems.filter((item) => item.type !== "VIDEO");
  const videoItemsForStudio = studioItems.filter((item) => item.type === "VIDEO");

  const openUpload = (k: UploadKind) => setUpload(k);
  const finishUpload = () => { setUpload(null); setSuccess(true); };

  const body = useMemo(() => {
    switch (section) {
      case "overview": return <Overview goto={setSection} openUpload={openUpload} items={studioItems} />;
      case "upload": return <UploadLanding openUpload={openUpload} />;
      case "audio": return <AudioLibrary openUpload={openUpload} items={audioItemsForStudio} />;
      case "video": return <VideoLibrary openUpload={openUpload} items={videoItemsForStudio} />;
      case "live": return <LiveManager openUpload={openUpload} />;
      case "analytics": return <Analytics />;
      case "profile": return <CreatorProfileView />;
      case "settings": return <CreatorSettings />;
    }
  }, [audioItemsForStudio, section, studioItems, videoItemsForStudio]);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 self-start">
        <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-3">
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gold">Creator Studio</p>
          <nav className="mt-1 space-y-0.5">
            {nav.map(n => {
              const active = section === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-red-gradient text-primary-foreground shadow-red-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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
          onClose={() => { setSuccess(false); setSection("audio"); }}
          onAnother={() => { setSuccess(false); setSection("upload"); }}
        />
      )}
    </div>
  );
};

export default CreatorStudio;
