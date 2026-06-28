import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";
import { adaptLiveEvent, type UiLiveEvent } from "@/lib/api/adapters";
import { useActiveLiveEvents, useLiveEvents } from "@/lib/api/hooks/useLive";

const tabs = ["Live Now", "Upcoming", "Replays"] as const;
const statusMap: Record<(typeof tabs)[number], UiLiveEvent["status"]> = {
  "Live Now": "live",
  Upcoming: "upcoming",
  Replays: "replay",
};

const Live = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Upcoming");
  const liveQuery = useLiveEvents({ limit: 50 });
  const activeQuery = useActiveLiveEvents();

  const events = useMemo(() => {
    const merged = mergeEvents([
      ...(activeQuery.data ?? []).map(adaptLiveEvent),
      ...(liveQuery.data ?? []).map(adaptLiveEvent),
    ]);
    return merged.filter((event) => event.status === statusMap[tab]);
  }, [activeQuery.data, liveQuery.data, tab]);

  const isLoading = liveQuery.isLoading || activeQuery.isLoading;
  const hasError = liveQuery.isError || activeQuery.isError;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Live</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Live Events</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Worship nights, conferences, premieres, and prayer - streamed live from across the globe.</p>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Live events could not refresh. Try again in a moment.
        </div>
      )}

      <div className="flex gap-1 border-y border-border py-4">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}>{t}</button>
        ))}
      </div>

      {isLoading && events.length === 0 ? (
        <GridSkeleton />
      ) : events.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <p className="font-display text-xl">Nothing here right now</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon for new gatherings.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="group overflow-hidden rounded-2xl bg-card-gradient ring-1 ring-border/60 shadow-card-soft">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={event.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                {event.status === "live" && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-[10px] uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-background animate-pulse-soft" /> Live now
                  </span>
                )}
                <span className={cn("absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider backdrop-blur",
                  event.access === "Free" ? "bg-gold/20 text-gold ring-1 ring-gold/30" : "bg-background/60 text-foreground ring-1 ring-border")}
                >
                  {event.access}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gold">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {event.date}</span>
                  <span>-</span>
                  <span>{event.time}</span>
                </div>
                <h3 className="mt-3 font-display text-2xl leading-tight">{event.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Hosted by {event.host}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> {event.viewerCount.toLocaleString()} viewers</span>
                  {event.youtubeUrl ? (
                    <a href={event.youtubeUrl} target="_blank" rel="noreferrer" className="rounded-full bg-red-gradient px-5 py-2 text-xs font-medium text-primary-foreground shadow-red-glow">
                      {event.status === "live" ? "Watch live" : "View event"}
                    </a>
                  ) : (
                    <span className="rounded-full border border-border px-5 py-2 text-xs text-muted-foreground">Details soon</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function mergeEvents(events: UiLiveEvent[]): UiLiveEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

const GridSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="h-96 animate-pulse rounded-2xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

export default Live;
