import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowRight, Globe, BarChart3, ShieldCheck, Radio, DollarSign, Sparkles } from "lucide-react";

const partners = ["Churches & Ministries", "Gospel Artists", "Podcasters", "Filmmakers", "Skit Makers", "Event Organizers"];
const values = [
  { icon: ShieldCheck, title: "Trusted distribution", desc: "Vetted creators. Sound doctrine. A platform you're proud to publish on." },
  { icon: Globe, title: "Global reach", desc: "120+ nations across our growing audience and live event network." },
  { icon: Sparkles, title: "Curated discovery", desc: "Human editorial pairs your work with the people it's meant for." },
  { icon: DollarSign, title: "Content monetization", desc: "Premium subscriptions, paid live events, and partner revenue share." },
  { icon: Radio, title: "Event streaming", desc: "Host worship nights, conferences, and premieres with built-in ticketing." },
  { icon: BarChart3, title: "Real analytics", desc: "Understand plays, watch-time, and audience growth in clear detail." },
];

const Partner = () => {
  const navigate = useNavigate();

  return (
  <div className="min-h-screen bg-background">
    <header className="container flex items-center justify-between py-6">
      <Logo />
      <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">Enter NoraPlus →</Link>
    </header>

    <section className="container py-20 md:py-28">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Partner with NoraPlus</p>
        <h1 className="mt-5 font-display text-5xl md:text-6xl leading-tight">
          Bring your kingdom content <span className="gold-text-gradient">home.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          NoraPlus is built for the ministries, artists, and storytellers shaping the kingdom — with trusted distribution, global reach, and the tools you need to grow.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        {partners.map(p => (
          <span key={p} className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground">{p}</span>
        ))}
      </div>
    </section>

    <section className="container py-12">
      <div className="grid gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-3">
        {values.map(v => (
          <div key={v.title} className="bg-background p-7">
            <v.icon className="h-5 w-5 text-gold" />
            <h3 className="mt-4 font-display text-lg">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container py-24">
      <div className="mx-auto max-w-2xl rounded-3xl bg-card-gradient p-8 md:p-12 ring-1 ring-gold/20 shadow-elegant text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Apply to Partner</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">Let's bring your work to the world.</h2>
        <p className="mt-4 text-muted-foreground">
          Applications are submitted from inside NoraPlus, so we can tie your profile to your account. Sign in (or create one) and the application only takes a few minutes.
        </p>
        <button
          onClick={() => navigate("/app/admin")}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow"
        >
          Start Your Application <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>

    <footer className="border-t border-border">
      <div className="container py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <Logo />
        <p>© 2026 NoraPlus. Light for Every Nation.</p>
      </div>
    </footer>
  </div>
  );
};

export default Partner;
