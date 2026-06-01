import { liveEvents } from "@/lib/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";

const tabs = ["Live Now", "Upcoming", "Replays"] as const;
const statusMap: Record<string, string> = { "Live Now": "live", Upcoming: "upcoming", Replays: "replay" };

const Live = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Upcoming");
  const items = liveEvents.filter(e => e.status === statusMap[tab]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Live</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Live Events</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Worship nights, conferences, premieres, and prayer — streamed live from across the globe.</p>
      </div>

      <div className="flex gap-1 border-y border-border py-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            tab === t ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <p className="font-display text-xl">Nothing here right now</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon for new gatherings.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map(e => (
            <div key={e.id} className="group overflow-hidden rounded-2xl bg-card-gradient ring-1 ring-border/60 shadow-card-soft">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={e.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                {e.status === "live" && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-[10px] uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-background animate-pulse-soft" /> Live now
                  </span>
                )}
                <span className={cn("absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider backdrop-blur",
                  e.access === "Free" ? "bg-gold/20 text-gold ring-1 ring-gold/30" : "bg-background/60 text-foreground ring-1 ring-border")}>
                  {e.access}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gold">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {e.date}</span>
                  <span>·</span>
                  <span>{e.time}</span>
                </div>
                <h3 className="mt-3 font-display text-2xl leading-tight">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Hosted by {e.host}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> 4,200+ registered</span>
                  <button className="rounded-full bg-gold-gradient px-5 py-2 text-xs font-medium text-primary-foreground shadow-glow">View event</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Live;
