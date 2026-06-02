import { useState } from "react";
import { content } from "@/lib/mockData";
import { ContentCard } from "@/components/ContentCard";
import { cn } from "@/lib/utils";

const tabs = ["All", "Music Videos", "Messages", "Skits", "Podcast Videos", "Movies"] as const;
const map: Record<string, string> = { "Music Videos": "music-video", Messages: "message", Skits: "skit", "Podcast Videos": "podcast-video", Movies: "movie" };

const Watch = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const items = content.filter(c => c.medium === "video" && (tab === "All" || c.type === map[tab]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Video</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Watch</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Films, music videos, teachings, and stories that point hearts to truth.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-y border-border py-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map(i => <ContentCard key={i.id} item={i} />)}
        {items.length === 0 && <p className="text-muted-foreground col-span-full py-12 text-center">Nothing here yet.</p>}
      </div>
    </div>
  );
};

export default Watch;
