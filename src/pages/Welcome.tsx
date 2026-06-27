import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { ArrowRight, Headphones, Tv, Radio, Heart, Library, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

const FEATURES = [
  { icon: Headphones, emoji: "🎧", title: "Listen", desc: "Music, messages, podcasts, and devotionals." },
  { icon: Tv, emoji: "📺", title: "Watch", desc: "Teachings, worship, films, and inspiring videos." },
  { icon: Radio, emoji: "🔴", title: "Join Live", desc: "Conferences, worship nights, vigils, and prayer gatherings." },
  { icon: Heart, emoji: "❤️", title: "Follow", desc: "Creators, ministries, churches, and fellowships." },
  { icon: Library, emoji: "📚", title: "Build Your Library", desc: "Save content and revisit it anytime." },
];

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const firstName = useMemo(() => {
    const fromState = (location.state as { fullName?: string } | null)?.fullName;
    const stored = typeof window !== "undefined" ? localStorage.getItem("noraplus_welcome_name") : null;
    const name = (fromState || stored || "Friend").trim();
    return name.split(/\s+/)[0] || "Friend";
  }, [location.state]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fromState = (location.state as { fullName?: string } | null)?.fullName;
      if (fromState) localStorage.setItem("noraplus_welcome_name", fromState);
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, hsl(350 60% 40% / 0.35), transparent 55%), radial-gradient(ellipse at 85% 85%, hsl(40 65% 55% / 0.18), transparent 55%), linear-gradient(180deg, hsl(350 22% 5%), hsl(350 18% 7%))",
        }}
      />
      <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-60 blur-3xl pointer-events-none"
           style={{ background: "radial-gradient(circle, hsl(40 70% 60% / 0.25), transparent 70%)" }} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10 sm:py-12">
        <header className="flex items-center justify-between animate-fade-in">
          <Logo />
          <button
            onClick={() => navigate("/app")}
            className="text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            Skip for Now
          </button>
        </header>

        <main className="mt-10 grid flex-1 items-center gap-12 md:mt-14 md:grid-cols-[1.05fr_1fr]">
          {/* Hero illustration — abstract light & discovery */}
          <div className="relative order-2 md:order-1 animate-fade-in">
            <div className="relative mx-auto aspect-square w-full max-w-[520px]">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-gold/20" />
              <div className="absolute inset-6 rounded-full border border-gold/15" />
              <div className="absolute inset-14 rounded-full border border-gold/10" />

              {/* Gradient sun */}
              <div
                className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full animate-scale-in shadow-elegant"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, hsl(40 80% 75%), hsl(40 65% 55%) 35%, hsl(350 55% 42%) 75%, hsl(350 60% 22%))",
                  boxShadow: "0 0 120px hsl(40 70% 55% / 0.45), inset 0 -40px 80px hsl(350 60% 25% / 0.6)",
                }}
              />

              {/* Light rays */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-[46%] w-px origin-bottom"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                    background: "linear-gradient(to top, transparent, hsl(40 70% 65% / 0.55), transparent)",
                  }}
                />
              ))}

              {/* Sparkles */}
              <Sparkles className="absolute right-[14%] top-[16%] h-6 w-6 text-gold animate-fade-in" />
              <Sparkles className="absolute left-[10%] bottom-[20%] h-4 w-4 text-gold/80 animate-fade-in" style={{ animationDelay: "0.2s" }} />
              <Sparkles className="absolute right-[20%] bottom-[10%] h-5 w-5 text-gold/70 animate-fade-in" style={{ animationDelay: "0.4s" }} />

              {/* Bottom highlight orb */}
              <div className="absolute -bottom-6 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full blur-2xl opacity-70"
                   style={{ background: "radial-gradient(ellipse, hsl(350 60% 45% / 0.6), transparent 70%)" }} />
            </div>
          </div>

          {/* Copy + actions */}
          <div className="order-1 md:order-2 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">A New Beginning</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Welcome, <span className="gold-text-gradient">{firstName}</span>.
            </h1>
            <p className="mt-3 text-sm text-foreground/80">We're so glad you're here.</p>
            <p className="mt-2 font-display text-lg gold-text-gradient">Light for Every Nation</p>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Discover trusted kingdom content that helps you encounter truth, grow in faith, and live transformed.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Whether you're listening to worship, watching inspiring messages, joining live experiences, or discovering creators from around the world, your journey starts here.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate("/app")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-gradient px-6 py-3 text-sm font-medium text-primary-foreground shadow-red-glow hover:opacity-95 transition-opacity"
              >
                Start Exploring <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/app/settings")}
                className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-transparent px-6 py-3 text-sm font-medium text-gold hover:bg-gold/10 transition-colors"
              >
                Complete My Profile
              </button>
              <button
                onClick={() => navigate("/app")}
                className="text-xs text-muted-foreground hover:text-gold transition-colors sm:ml-2"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </main>

        {/* Feature cards */}
        <section className="mt-14 animate-fade-in">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Explore NoraPlus</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-gold/15 p-5 shadow-elegant transition-all hover:border-gold/40 hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none glow-radial opacity-20" />
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>{f.emoji}</span>
                      <Icon className="h-4 w-4 text-gold" />
                    </div>
                    <p className="mt-3 font-display text-sm text-foreground">{f.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-14 border-t border-border/40 pt-6 text-center animate-fade-in">
          <p className="text-sm text-muted-foreground">We're honoured to be part of your journey.</p>
          <p className="mt-1 font-display text-base">
            Welcome to <span className="gold-text-gradient">NoraPlus</span>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
