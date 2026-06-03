import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Bookmark, ChevronLeft, ChevronRight, Radio, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import message from "@/assets/content-message.jpg";
import music from "@/assets/content-music.jpg";
import movie from "@/assets/content-movie.jpg";
import devotional from "@/assets/content-devotional.jpg";
import event from "@/assets/content-event.jpg";

type Slide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  primary: { label: string; to: string; icon?: "play" | "live" };
  secondary: { label: string; to: string };
};

const slides: Slide[] = [
  {
    id: "1",
    badge: "Message",
    title: "Encountering Truth",
    description: "A faith-strengthening message to renew your mind and awaken your walk with God.",
    image: message,
    primary: { label: "Play Now", to: "/app/content/1", icon: "play" },
    secondary: { label: "View Details", to: "/app/content/1" },
  },
  {
    id: "e1",
    badge: "Live Event",
    title: "Worship Night Lagos",
    description: "Join believers in worship, prayer, and encounters in God's presence.",
    image: event,
    primary: { label: "Join Live", to: "/app/live", icon: "live" },
    secondary: { label: "View Event", to: "/app/live" },
  },
  {
    id: "2",
    badge: "Daily Devotional",
    title: "Morning Light",
    description: "Start your day with scripture, prayer, and kingdom perspective.",
    image: devotional,
    primary: { label: "Listen Now", to: "/app/content/2", icon: "play" },
    secondary: { label: "Save for Later", to: "/app/library" },
  },
  {
    id: "5",
    badge: "Movie",
    title: "The Narrow Way",
    description: "A powerful kingdom story about faith, choices, and transformation.",
    image: movie,
    primary: { label: "Watch Now", to: "/app/content/5", icon: "play" },
    secondary: { label: "More Info", to: "/app/content/5" },
  },
  {
    id: "3",
    badge: "Worship",
    title: "Sounds of Worship Vol. 1",
    description: "Spirit-lifting worship for devotion, prayer, and reflection.",
    image: music,
    primary: { label: "Listen Now", to: "/app/content/3", icon: "play" },
    secondary: { label: "Add to Library", to: "/app/library" },
  },
];

export const HeroSlider = () => {
  const [i, setI] = useState(0);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setI((p) => (n + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const toggleSave = (id: string) => setSaved((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div
      className="relative overflow-hidden rounded-3xl ring-1 ring-border/60 shadow-elegant"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative h-[440px] md:h-[520px] lg:h-[560px]">
        {slides.map((s, idx) => {
          const active = idx === i;
          return (
            <div
              key={s.id}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-out",
                active ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {/* Background */}
              <img
                src={s.image}
                alt=""
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-[8000ms] ease-out",
                  active ? "scale-105" : "scale-100"
                )}
              />
              {/* Wine overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div
                className="absolute inset-0 mix-blend-soft-light opacity-80"
                style={{
                  background:
                    "linear-gradient(120deg, hsl(350 60% 25% / 0.55), hsl(350 50% 15% / 0.15) 55%, transparent)",
                }}
              />
              {/* Gold glow */}
              <div
                className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
                style={{ background: "radial-gradient(circle, hsl(40 70% 60% / 0.35), transparent 60%)" }}
              />
              <div
                className="absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
                style={{ background: "radial-gradient(circle, hsl(350 70% 45% / 0.45), transparent 60%)" }}
              />

              {/* Content */}
              <div className="relative z-10 flex h-full items-end md:items-center">
                <div
                  className={cn(
                    "max-w-2xl px-6 md:px-12 lg:px-16 pb-10 md:pb-0 transition-all duration-1000",
                    active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  )}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-background/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-gold ring-1 ring-gold/40">
                    {s.primary.icon === "live" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse-soft" />
                    )}
                    {s.badge}
                  </span>
                  <h2 className="mt-5 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
                    {s.title}
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
                    {s.description}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      to={s.primary.to}
                      className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-6 py-3 text-sm font-medium text-primary-foreground shadow-red-glow transition-transform hover:-translate-y-0.5"
                    >
                      {s.primary.icon === "live" ? (
                        <Radio className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                      {s.primary.label}
                    </Link>
                    <Link
                      to={s.secondary.to}
                      className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/40 backdrop-blur px-6 py-3 text-sm text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Info className="h-4 w-4" />
                      {s.secondary.label}
                    </Link>
                    <button
                      onClick={() => toggleSave(s.id)}
                      aria-label="Save"
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/50 backdrop-blur transition-all hover:border-gold/60",
                        saved[s.id] && "text-gold border-gold/60"
                      )}
                    >
                      <Bookmark className={cn("h-4 w-4", saved[s.id] && "fill-current")} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(i - 1)}
        aria-label="Previous slide"
        className="absolute left-3 md:left-5 top-1/2 z-20 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/60 backdrop-blur-md text-foreground ring-1 ring-border/60 hover:bg-background/80 hover:ring-gold/40 transition"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(i + 1)}
        aria-label="Next slide"
        className="absolute right-3 md:right-5 top-1/2 z-20 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/60 backdrop-blur-md text-foreground ring-1 ring-border/60 hover:bg-background/80 hover:ring-gold/40 transition"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              idx === i ? "w-8 bg-gold shadow-glow" : "w-2 bg-foreground/30 hover:bg-foreground/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
