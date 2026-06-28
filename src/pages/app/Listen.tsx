import { useMemo, useState } from "react";
import { ContentCard } from "@/components/ContentCard";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import { adaptContent } from "@/lib/api/adapters";
import { useContentList } from "@/lib/api/hooks/useContent";
import type { ContentItem } from "@/lib/mockData";

const tabs = ["All", "Music", "Messages", "Podcasts", "Devotionals"] as const;
const sorts = ["Newest", "Trending", "Longest", "Shortest"];

const typeMap: Record<(typeof tabs)[number], ContentItem["type"] | null> = {
  All: null,
  Music: "music",
  Messages: "message",
  Podcasts: "podcast",
  Devotionals: "devotional",
};

const Listen = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [sort, setSort] = useState("Newest");
  const audioQuery = useContentList({ type: "AUDIO", limit: 50 });
  const podcastQuery = useContentList({ type: "PODCAST", limit: 50 });
  const devotionalQuery = useContentList({ type: "DEVOTIONAL", limit: 50 });

  const items = useMemo(() => {
    const apiItems = [
      ...(audioQuery.data ?? []),
      ...(podcastQuery.data ?? []),
      ...(devotionalQuery.data ?? []),
    ];
    const adapted = apiItems.map(adaptContent).filter((item) => item.medium === "audio");
    const filtered = tab === "All" ? adapted : adapted.filter((item) => item.type === typeMap[tab]);
    return sortItems(filtered, sort);
  }, [audioQuery.data, devotionalQuery.data, podcastQuery.data, sort, tab]);

  const isLoading = audioQuery.isLoading || podcastQuery.isLoading || devotionalQuery.isLoading;
  const hasError = audioQuery.isError || podcastQuery.isError || devotionalQuery.isError;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Audio</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Listen</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Worship, sound teaching, devotionals, and trusted conversations - for every moment of your day.</p>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Some audio content could not refresh. Try again in a moment.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Filters</button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs">
            {sorts.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isLoading && items.length === 0 ? (
        <GridSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {items.map((item) => <ContentCard key={item.id} item={item} />)}
          {items.length === 0 && <p className="text-muted-foreground col-span-full py-12 text-center">No content in this category yet.</p>}
        </div>
      )}
    </div>
  );
};

function sortItems(items: ContentItem[], sort: string): ContentItem[] {
  const next = [...items];
  if (sort === "Longest") return next.sort((a, b) => durationToMinutes(b.duration) - durationToMinutes(a.duration));
  if (sort === "Shortest") return next.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration));
  if (sort === "Trending") return next.sort((a, b) => Number(Boolean(b.tag)) - Number(Boolean(a.tag)));
  return next.sort((a, b) => Date.parse(b.date ?? "") - Date.parse(a.date ?? ""));
}

function durationToMinutes(value: string): number {
  const hours = /([0-9]+)h/.exec(value)?.[1];
  const minutes = /([0-9]+) min/.exec(value)?.[1];
  return Number(hours ?? 0) * 60 + Number(minutes ?? 0);
}

const GridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
    {Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className="h-80 animate-pulse rounded-xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

export default Listen;
