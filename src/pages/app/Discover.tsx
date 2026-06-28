import { Link } from "react-router-dom";
import { Play, Headphones, Radio as RadioIcon, BookOpen, Film, Mic2, Sparkles } from "lucide-react";
import { ContentRow } from "@/components/ContentRow";
import { HeroSlider, type HeroSlide } from "@/components/HeroSlider";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/lib/mockData";
import { adaptContent, adaptCreator, adaptLiveEvent, contentTypeLabel, type UiLiveEvent } from "@/lib/api/adapters";
import { useContentList, useFeaturedContent } from "@/lib/api/hooks/useContent";
import { useCreatorsList } from "@/lib/api/hooks/useCreators";
import { useLiveEvents } from "@/lib/api/hooks/useLive";

const chips = [
  { label: "Messages", icon: Mic2, to: "/app/listen" },
  { label: "Worship", icon: Headphones, to: "/app/listen" },
  { label: "Devotionals", icon: BookOpen, to: "/app/devotionals" },
  { label: "Podcasts", icon: Mic2, to: "/app/listen" },
  { label: "Movies", icon: Film, to: "/app/watch" },
  { label: "Live", icon: RadioIcon, to: "/app/live" },
];

type FeaturedItem =
  | { kind: "content"; item: ContentItem }
  | { kind: "live"; item: UiLiveEvent };

const Discover = () => {
  const featuredQuery = useFeaturedContent();
  const contentQuery = useContentList({ limit: 24 });
  const liveQuery = useLiveEvents({ limit: 12 });
  const creatorsQuery = useCreatorsList({ limit: 8 });

  const featuredContent = (featuredQuery.data ?? []).map(adaptContent);
  const allContent = (contentQuery.data ?? []).map(adaptContent);
  const liveEvents = (liveQuery.data ?? []).map(adaptLiveEvent);
  const creators = (creatorsQuery.data ?? []).map(adaptCreator);
  const contentPool = featuredContent.length > 0 ? featuredContent : allContent;
  const activeOrUpcoming = liveEvents.filter((event) => event.status !== "replay");
  const heroSlides = buildHeroSlides(contentPool, activeOrUpcoming);
  const featuredWeek = buildFeaturedItems(contentPool, activeOrUpcoming);
  const followed = creators[0];
  const becauseYouFollow = allContent
    .filter((item) => item.type === "message" || item.type === "devotional")
    .slice(0, 6);
  const isLoading = featuredQuery.isLoading || contentQuery.isLoading || liveQuery.isLoading || creatorsQuery.isLoading;
  const hasError = featuredQuery.isError || contentQuery.isError || liveQuery.isError || creatorsQuery.isError;

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back to</p>
          <h1 className="font-display text-3xl md:text-4xl">
            NoraPlus<span className="text-gold">.</span>
          </h1>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          Light for every nation - curated kingdom content for your journey today.
        </p>
      </div>

      {hasError && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Some browse sections could not refresh. Showing whatever content is currently available.
        </div>
      )}

      <HeroSlider slides={heroSlides} />

      <div className="-mt-6 flex flex-wrap gap-2.5">
        {chips.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-2 text-sm text-muted-foreground",
              "hover:text-gold hover:border-gold/40 hover:bg-card transition-colors",
            )}
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.label}
          </Link>
        ))}
      </div>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold">Editorial</p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl">Featured This Week</h2>
          </div>
        </div>
        {isLoading && featuredWeek.length === 0 ? (
          <GridSkeleton />
        ) : featuredWeek.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featuredWeek.map((entry) => {
              const isEvent = entry.kind === "live";
              const item = entry.item;
              const to = isEvent ? "/app/live" : `/app/content/${item.id}`;
              const badge = isEvent ? "Live Event" : contentTypeLabel(item.type);
              const meta = isEvent ? `Host: ${item.host}` : item.creator;
              const summary = isEvent ? `${item.date} - ${item.time}` : item.description;

              return (
                <Link
                  key={`${entry.kind}-${item.id}`}
                  to={to}
                  className="group relative overflow-hidden rounded-2xl bg-card-gradient ring-1 ring-border/60 transition-all hover:-translate-y-1 hover:ring-gold/40 hover:shadow-elegant"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-background/70 backdrop-blur px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gold ring-1 ring-gold/40">
                      {badge}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg leading-snug line-clamp-2">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
                    <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2">{summary}</p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-red-soft group-hover:text-gold transition-colors">
                      <Play className="h-3.5 w-3.5 fill-current" />
                      {isEvent ? "View event" : "Play now"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyPanel message="Featured content will appear here as creators publish new work." />
        )}
      </section>

      <ContentRow title="New & Noteworthy" subtitle="Freshly published for your faith journey" items={allContent.slice(0, 5)} />
      <ContentRow title="Recommended for You" subtitle="Selected from the NoraPlus catalog" items={allContent.slice(2, 8)} />
      <ContentRow title="Trending Worship" items={allContent.filter((item) => item.type === "music" || item.type === "music-video")} />
      <ContentRow title="New Messages" subtitle="Sound teaching curated for this week" items={allContent.filter((item) => item.type === "message")} />
      <ContentRow title="Movies & Stories" items={allContent.filter((item) => item.type === "movie" || item.type === "skit")} />

      {followed && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full ring-1 ring-gold/40">
                <img src={followed.image} alt={followed.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-background/40" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-gold flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Creator spotlight
                </p>
                <h2 className="mt-1 font-display text-2xl md:text-3xl">{followed.name}</h2>
                <p className="text-xs text-muted-foreground">
                  Recommended messages, devotionals, and live replays from similar voices.
                </p>
              </div>
            </div>
          </div>
          {becauseYouFollow.length > 0 ? (
            <div className="flex gap-5 overflow-x-auto pb-2 snap-x scrollbar-none -mx-6 px-6">
              {becauseYouFollow.map((item) => (
                <div key={item.id} className="w-56 shrink-0 snap-start">
                  <Link to={`/app/content/${item.id}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-border/60 group-hover:ring-gold/40 transition">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    </div>
                    <p className="mt-3 font-display text-sm leading-snug line-clamp-2">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.creator}</p>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel message="More creator-based recommendations will appear as content is published." />
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl md:text-3xl">Upcoming Live Events</h2>
        {activeOrUpcoming.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activeOrUpcoming.map((event) => (
              <div key={event.id} className="group overflow-hidden rounded-2xl bg-card-gradient ring-1 ring-border/60">
                <div className="relative aspect-video overflow-hidden">
                  <img src={event.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  {event.status === "live" && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-destructive/90 px-2.5 py-1 text-[10px] uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-background animate-pulse-soft" /> Live
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-widest text-gold">
                    {event.date} - {event.time}
                  </p>
                  <h3 className="mt-2 font-display text-lg">{event.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Host: {event.host}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{event.access} access</span>
                    <Link to="/app/live" className="text-xs text-gold hover:underline">View event</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel message="No live events are scheduled yet." />
        )}
      </section>
    </div>
  );
};

function buildHeroSlides(content: ContentItem[], liveEvents: UiLiveEvent[]): HeroSlide[] {
  const contentSlides = content.slice(0, 4).map((item): HeroSlide => ({
    id: `content-${item.id}`,
    badge: contentTypeLabel(item.type),
    title: item.title,
    description: item.description || `By ${item.creator}`,
    image: item.image,
    primary: { label: item.medium === "video" ? "Watch Now" : "Listen Now", to: `/app/content/${item.id}`, icon: "play" },
    secondary: { label: "View Details", to: `/app/content/${item.id}` },
  }));

  const liveSlides = liveEvents.slice(0, 1).map((event): HeroSlide => ({
    id: `live-${event.id}`,
    badge: event.status === "live" ? "Live Now" : "Live Event",
    title: event.title,
    description: event.description || `Hosted by ${event.host}`,
    image: event.image,
    primary: { label: event.status === "live" ? "Join Live" : "View Event", to: "/app/live", icon: "live" },
    secondary: { label: "All Events", to: "/app/live" },
  }));

  return [...liveSlides, ...contentSlides].slice(0, 5);
}

function buildFeaturedItems(content: ContentItem[], liveEvents: UiLiveEvent[]): FeaturedItem[] {
  const items: FeaturedItem[] = content.slice(0, 3).map((item) => ({ kind: "content", item }));
  const event = liveEvents[0];
  if (event) items.splice(1, 0, { kind: "live", item: event });
  return items.slice(0, 4);
}

const GridSkeleton = () => (
  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="h-72 animate-pulse rounded-2xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

const EmptyPanel = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
    {message}
  </div>
);

export default Discover;

