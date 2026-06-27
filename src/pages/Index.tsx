import { Link } from "react-router-dom";
import { ArrowRight, Headphones, Play, Radio, Sparkles, Globe, Shield, Compass, Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { content, creators } from "@/lib/mockData";
import hero from "@/assets/hero-worship.jpg";
import { ContentCard } from "@/components/ContentCard";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container flex items-center justify-between py-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#vision" className="hover:text-foreground">About</a>
            <a href="#categories" className="hover:text-foreground">Content</a>
            <a href="#partner" className="hover:text-foreground">Partner</a>
            <Link to="/plans" className="hover:text-foreground">Plans</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
              Enter NoraPlus <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        <div className="absolute inset-0 bg-hero" />
        <div className="container relative pt-40 pb-32 md:pt-52 md:pb-44">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 backdrop-blur px-3 py-1.5 text-xs text-gold">
              <Sparkles className="h-3 w-3" /> Light for Every Nation
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] tracking-tight">
              The trusted Kingdom Content Platform for <span className="gold-text-gradient">every nation.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              NoraPlus helps people around the world encounter truth, grow in faith, and live transformed through high-quality Christian content and meaningful digital experiences.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
                Start Exploring <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/partner" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur px-6 py-3.5 text-sm font-medium hover:border-gold/40">
                Partner With NoraPlus
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-8 text-xs text-muted-foreground">
              <div><span className="block font-display text-2xl text-foreground">120+</span>nations reached</div>
              <div className="h-8 w-px bg-border" />
              <div><span className="block font-display text-2xl text-foreground">2K+</span>trusted creators</div>
              <div className="h-8 w-px bg-border" />
              <div><span className="block font-display text-2xl text-foreground">10M+</span>plays</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="container py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Our vision</p>
            <h2 className="mt-4 font-display text-4xl leading-tight">A home for every seeker of truth.</h2>
          </div>
          <div className="md:col-span-8 md:pt-2">
            <p className="font-display text-2xl md:text-3xl leading-relaxed text-foreground/90">
              To bring the light of God's kingdom to every person, in every nation — through trusted content that helps them encounter truth, grow in faith, and live transformed.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Headphones, title: "Audio", desc: "Messages, worship, podcasts, devotionals — wherever life takes you.", count: "8,400+ hours" },
            { icon: Play, title: "Video", desc: "Films, music videos, skits and teaching, beautifully presented.", count: "3,200+ titles" },
            { icon: Radio, title: "Live Events", desc: "Worship nights, conferences, premieres and prayer — streamed live.", count: "120+ each month" },
          ].map((c, i) => (
            <div key={c.title} className="group relative overflow-hidden rounded-2xl bg-card-gradient p-8 ring-1 ring-border/60 transition-all hover:ring-gold/40">
              <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gold/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
              <c.icon className="h-7 w-7 text-gold" />
              <h3 className="mt-6 font-display text-2xl">{c.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{c.desc}</p>
              <p className="mt-6 text-xs uppercase tracking-widest text-gold/70">{c.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why NoraPlus */}
      <section className="container py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Why NoraPlus exists</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl leading-tight">
            Kingdom content shouldn't feel scattered or unsafe.
          </h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-4">
          {[
            { icon: Compass, title: "Scattered no more", desc: "One home for every kind of trusted Christian content." },
            { icon: Shield, title: "Trust built in", desc: "Every creator vetted. Every message anchored in sound doctrine." },
            { icon: Sparkles, title: "Curated discovery", desc: "Find what feeds your soul — not what feeds an algorithm." },
            { icon: Globe, title: "Global at heart", desc: "Built for every nation, language, and expression of faith." },
          ].map((f) => (
            <div key={f.title} className="bg-background p-8">
              <f.icon className="h-5 w-5 text-gold" />
              <h3 className="mt-5 font-display text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Featured this week</p>
            <h2 className="mt-3 font-display text-4xl">From across the NoraPlus collective</h2>
          </div>
          <Link to="/app" className="text-sm text-muted-foreground hover:text-gold">Explore all →</Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
          {content.slice(0, 8).map((c) => <ContentCard key={c.id} item={c} />)}
        </div>
      </section>

      {/* Partner */}
      <section id="partner" className="relative isolate overflow-hidden py-32">
        <div className="absolute inset-0 glow-radial opacity-60" />
        <div className="container relative">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">For partners</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl leading-tight">
                Built for the ministries, artists, and storytellers shaping the kingdom.
              </h2>
              <p className="mt-6 text-muted-foreground max-w-lg">
                Whether you lead a church, run a podcast, score worship, or film stories — NoraPlus gives your work a trusted home and a global audience.
              </p>
              <Link to="/partner" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow">
                Apply to Partner <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {creators.slice(0, 4).map((c) => (
                <div key={c.id} className="rounded-2xl bg-card-gradient p-5 ring-1 ring-border/60">
                  <img src={c.image} alt="" loading="lazy" className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/30" />
                  <p className="mt-4 font-display text-base">{c.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.category}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-widest text-gold/70">{c.followers} followers</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="container py-24">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Plans</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Choose your NoraPlus experience.</h2>
          <p className="mt-4 text-muted-foreground">Trusted kingdom content for every stage of your journey.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Free Trial", badge: "New User Offer", price: "₦0", suffix: "3 Months", desc: "Enjoy full, all-access use of NoraPlus during your first three months.", featured: true },
            { name: "Free", badge: "Always Available", price: "₦0", suffix: "", desc: "Continue exploring trusted kingdom content with selected features." },
            { name: "Essential", price: "₦1,500", suffix: "/month", desc: "Unlimited streaming and an enhanced listening and viewing experience." },
            { name: "Premium", badge: "Most Popular", price: "₦2,500", suffix: "/month", desc: "The complete NoraPlus experience with premium content and downloads.", popular: true },
          ].map((p) => (
            <div key={p.name} className={`relative rounded-2xl p-6 ring-1 ${p.popular ? "ring-gold/50 bg-card-gradient shadow-red-glow" : p.featured ? "ring-gold/40 bg-card-gradient shadow-elegant" : "ring-border/60 bg-card"}`}>
              {p.badge && <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-medium ${p.popular ? "bg-red-gradient text-foreground" : "bg-gold-gradient text-primary-foreground"}`}>{p.badge}</span>}
              <p className="mt-2 font-display text-xl">{p.name}</p>
              <p className="mt-3 font-display text-3xl">{p.price}<span className="text-sm text-muted-foreground font-sans"> {p.suffix}</span></p>
              <p className="mt-3 text-sm text-muted-foreground min-h-[60px]">{p.desc}</p>
              <Link to="/plans" className={`mt-6 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-medium ${p.popular ? "bg-red-gradient text-foreground" : p.featured ? "bg-gold-gradient text-primary-foreground" : "border border-border hover:border-gold/40"}`}>
                Compare Plans
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-14">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">Light for Every Nation. A trusted Kingdom Content Platform for discovering, experiencing, and sharing faith.</p>
            </div>
            {[
              { title: "Platform", links: ["About", "Content", "Live Events", "Plans"] },
              { title: "Partners", links: ["Churches", "Artists", "Filmmakers", "Apply"] },
              { title: "Company", links: ["Contact", "Press", "Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-medium">{col.title}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {col.links.map((l) => <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© 2026 NoraPlus. Light for Every Nation.</p>
            <p>Built for the kingdom.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
