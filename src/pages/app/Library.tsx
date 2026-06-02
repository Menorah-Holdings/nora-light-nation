import { useState } from "react";
import { content, creators } from "@/lib/mockData";
import { ContentCard } from "@/components/ContentCard";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const tabs = ["Saved", "Continue", "Playlists", "Recently played", "Following"] as const;

const Library = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Saved");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Your space</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Library</h1>
      </div>

      <div className="flex flex-wrap gap-1 border-y border-border py-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      {tab === "Following" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {creators.slice(0, 4).map(c => (
            <Link key={c.id} to={`/app/creators/${c.id}`} className="flex items-center gap-4 rounded-2xl bg-card-gradient p-4 ring-1 ring-border/60 hover:ring-gold/40">
              <img src={c.image} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-display truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.category}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : tab === "Playlists" ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Sunday Morning Worship", count: 24 },
            { name: "Long Drive Devotionals", count: 18 },
            { name: "Sermons that anchor me", count: 12 },
          ].map(p => (
            <div key={p.name} className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
              <div className="aspect-square rounded-xl bg-gold-gradient/20 mb-4 grid grid-cols-2 overflow-hidden">
                {content.slice(0, 4).map((c, i) => <img key={i} src={c.image} className="h-full w-full object-cover" alt="" />)}
              </div>
              <p className="font-display text-lg">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.count} tracks</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {content.slice(0, 8).map(i => <ContentCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
};

export default Library;
