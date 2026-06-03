import { Link } from "react-router-dom";
import { Play, Headphones, Radio as RadioIcon, BookOpen, Film, Mic2, Sparkles } from "lucide-react";
import { content, liveEvents, creators } from "@/lib/mockData";
import { ContentRow } from "@/components/ContentRow";
import { HeroSlider } from "@/components/HeroSlider";
import { cn } from "@/lib/utils";

const chips = [
  { label: "Messages", icon: Mic2, to: "/app/listen" },
  { label: "Worship", icon: Headphones, to: "/app/listen" },
  { label: "Devotionals", icon: BookOpen, to: "/app/devotionals" },
  { label: "Podcasts", icon: Mic2, to: "/app/listen" },
  { label: "Movies", icon: Film, to: "/app/watch" },
  { label: "Live", icon: RadioIcon, to: "/app/live" },
];

const Discover = () => {
  const featuredWeek = [content[8], liveEvents[0], content[1], content[4]];
  const followed = creators[0];
  const becauseYouFollow = content.filter((c) => c.type === "message" || c.type === "devotional").slice(0, 6);

  return (
    <div className="space-y-14">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back to</p>
          <h1 className="font-display text-3xl md:text-4xl">
            Nora<span className="text-gold">.</span>
          </h1>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          Light for every nation — curated kingdom content for your journey today.
        </p>
      </div>

      {/* Cinematic hero slider */}
      <HeroSlider />

      {/* Category chips */}
      <div className="-mt-6 flex flex-wrap gap-2.5">
        {chips.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-2 text-sm text-muted-foreground",
              "hover:text-gold hover:border-gold/40 hover:bg-card transition-colors"
            )}
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.label}
          </Link>
        ))}
      </div>

      {/* Featured This Week */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold">Editorial</p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl">Featured This Week</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredWeek.map((item: any, idx) => {
            const isEvent = "host" in item;
            const to = isEvent ? "/app/live" : `/app/content/${item.id}`;
            return (
              <Link
                key={idx}
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
                    {isEvent ? "Live Event" : item.type}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg leading-snug line-clamp-2">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isEvent ? `Host: ${item.host}` : item.creator}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2">
                    {isEvent ? `${item.date} · ${item.time}` : item.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-red-soft group-hover:text-gold transition-colors">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {isEvent ? "Join event" : "Play now"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <ContentRow title="Continue Listening" subtitle="Pick up where you left off" items={content.slice(0, 5)} />
      <ContentRow title="Recommended for You" subtitle="Selected for your faith journey" items={content.slice(2, 8)} />
      <ContentRow title="Trending Worship" items={content.filter((c) => c.type === "music" || c.type === "music-video")} />
      <ContentRow title="New Messages" subtitle="Sound teaching curated for this week" items={content.filter((c) => c.type === "message").concat(content.slice(0, 3))} />
      <ContentRow title="Movies & Stories" items={content.filter((c) => c.type === "movie" || c.type === "skit").concat(content.slice(5, 8))} />

      {/* Because you follow */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-1 ring-gold/40">
              <img src={followed.image} alt={followed.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-background/40" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Because you follow
              </p>
              <h2 className="mt-1 font-display text-2xl md:text-3xl">{followed.name}</h2>
              <p className="text-xs text-muted-foreground">
                Recommended messages, devotionals, and live replays from similar voices.
              </p>
            </div>
          </div>
        </div>
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
      </section>

      {/* Upcoming live */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl md:text-3xl">Upcoming Live Events</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {liveEvents
            .filter((e) => e.status !== "replay")
            .map((e) => (
              <div key={e.id} className="group overflow-hidden rounded-2xl bg-card-gradient ring-1 ring-border/60">
                <div className="relative aspect-video overflow-hidden">
                  <img src={e.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  {e.status === "live" && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-destructive/90 px-2.5 py-1 text-[10px] uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-background animate-pulse-soft" /> Live
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-widest text-gold">
                    {e.date} · {e.time}
                  </p>
                  <h3 className="mt-2 font-display text-lg">{e.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Host: {e.host}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{e.access} access</span>
                    <button className="text-xs text-gold hover:underline">View event →</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Discover;
