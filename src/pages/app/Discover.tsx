import { Link } from "react-router-dom";
import { Play, Bookmark, Share2 } from "lucide-react";
import { content, liveEvents } from "@/lib/mockData";
import { ContentRow } from "@/components/ContentRow";

const Discover = () => {
  const featured = content[8];
  return (
    <div className="space-y-14">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back to</p>
        <h1 className="font-display text-3xl md:text-4xl">Nora<span className="text-gold">.</span></h1>
      </div>

      {/* Featured hero */}
      <Link to={`/app/content/${featured.id}`} className="block group">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-border/60 shadow-elegant">
          <img src={featured.image} alt={featured.title} className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 max-w-2xl">
            <span className="text-xs uppercase tracking-[0.25em] text-gold">{featured.tag} · Message</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl leading-tight">{featured.title}</h2>
            <p className="mt-3 text-muted-foreground max-w-md">{featured.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow">
                <Play className="h-4 w-4 fill-current" /> Play now
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur px-5 py-2.5 text-sm"><Bookmark className="h-4 w-4" /> Save</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur px-5 py-2.5 text-sm"><Share2 className="h-4 w-4" /> Share</span>
            </div>
          </div>
        </div>
      </Link>

      <ContentRow title="Continue Listening" subtitle="Pick up where you left off" items={content.slice(0, 5)} />
      <ContentRow title="Featured Messages" subtitle="Sound teaching curated for this week" items={content.filter(c => c.type === "message").concat(content.slice(0, 3))} />
      <ContentRow title="Worship & Music" items={content.filter(c => c.type === "music" || c.type === "music-video")} />
      <ContentRow title="Movies & Stories" items={content.filter(c => c.type === "movie" || c.type === "skit")} />
      <ContentRow title="Devotionals" subtitle="Short, daily anchors" items={content.filter(c => c.type === "devotional").concat(content.slice(3, 6))} />

      {/* Upcoming live */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl md:text-3xl">Upcoming Live Events</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {liveEvents.filter(e => e.status !== "replay").map((e) => (
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
                <p className="text-[10px] uppercase tracking-widest text-gold">{e.date} · {e.time}</p>
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
