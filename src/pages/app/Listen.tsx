import { useState } from "react";
import { content } from "@/lib/mockData";
import { ContentCard } from "@/components/ContentCard";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

const tabs = ["All", "Music", "Messages", "Podcasts", "Devotionals"] as const;
const sorts = ["Newest", "Trending", "Longest", "Shortest"];

const typeMap: Record<string, string> = { Music: "music", Messages: "message", Podcasts: "podcast", Devotionals: "devotional" };

const Listen = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [sort, setSort] = useState("Newest");
  const items = content.filter(c => c.medium === "audio" && (tab === "All" || c.type === typeMap[tab]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Audio</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Listen</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Worship, sound teaching, devotionals, and trusted conversations — for every moment of your day.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div className="flex flex-wrap gap-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Filters</button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs">
            {sorts.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {items.map(i => <ContentCard key={i.id} item={i} />)}
        {items.length === 0 && <p className="text-muted-foreground col-span-full py-12 text-center">No content in this category yet.</p>}
      </div>
    </div>
  );
};

export default Listen;
