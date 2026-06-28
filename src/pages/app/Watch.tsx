import { useMemo, useState } from "react";
import { ContentCard } from "@/components/ContentCard";
import { cn } from "@/lib/utils";
import { adaptContent } from "@/lib/api/adapters";
import { useContentList } from "@/lib/api/hooks/useContent";
import type { ContentItem } from "@/lib/mockData";

const tabs = ["All", "Music Videos", "Messages", "Skits", "Podcast Videos", "Movies"] as const;
const map: Record<(typeof tabs)[number], ContentItem["type"] | null> = {
  All: null,
  "Music Videos": "music-video",
  Messages: "message",
  Skits: "skit",
  "Podcast Videos": "podcast-video",
  Movies: "movie",
};

const Watch = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const contentQuery = useContentList({ type: "VIDEO", limit: 50 });

  const items = useMemo(() => {
    const adapted = (contentQuery.data ?? []).map(adaptContent).filter((item) => item.medium === "video");
    return tab === "All" ? adapted : adapted.filter((item) => item.type === map[tab]);
  }, [contentQuery.data, tab]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Video</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Watch</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Films, music videos, teachings, and stories that point hearts to truth.</p>
      </div>

      {contentQuery.isError && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Video content could not refresh. Try again in a moment.
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-y border-border py-4">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}>{t}</button>
        ))}
      </div>

      {contentQuery.isLoading && items.length === 0 ? (
        <GridSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => <ContentCard key={item.id} item={item} />)}
          {items.length === 0 && <p className="text-muted-foreground col-span-full py-12 text-center">Nothing here yet.</p>}
        </div>
      )}
    </div>
  );
};

const GridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-80 animate-pulse rounded-xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

export default Watch;
