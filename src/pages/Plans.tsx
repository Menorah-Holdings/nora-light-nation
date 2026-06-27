import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X, Sparkles, Crown, Star, Gift, ArrowRight, ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  badge?: string;
  badgeTone?: "gold" | "red" | "muted";
  price: string;
  priceSuffix?: string;
  duration?: string;
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  ctaDisabled?: boolean;
  highlight?: "gold" | "premium";
  icon: typeof Sparkles;
};

const plans: Plan[] = [
  {
    id: "trial",
    name: "Free Trial",
    badge: "New User Offer",
    badgeTone: "gold",
    price: "₦0",
    duration: "3 Months",
    description: "Enjoy complete access to everything NoraPlus has to offer during your first three months.",
    features: [
      "Unlimited audio streaming",
      "Unlimited video streaming",
      "Live events",
      "Offline downloads",
      "Premium content",
      "Ad-free experience",
      "Highest streaming quality",
    ],
    cta: "Start Free Trial",
    highlight: "gold",
    icon: Gift,
  },
  {
    id: "free",
    name: "Free",
    badge: "Always Available",
    badgeTone: "muted",
    price: "₦0",
    description: "Continue enjoying trusted kingdom content with access to selected features and content.",
    features: [
      "Selected audio",
      "Selected video",
      "Selected live events",
      "Follow creators",
      "Build your library",
      "Personalized recommendations",
    ],
    limitations: [
      "Downloads",
      "Premium content",
      "Exclusive events",
      "Highest streaming quality",
    ],
    cta: "Current Plan",
    ctaDisabled: true,
    icon: Star,
  },
  {
    id: "essential",
    name: "Essential",
    price: "₦1,500",
    priceSuffix: "/month",
    description: "Unlimited streaming and an enhanced everyday NoraPlus experience.",
    features: [
      "Unlimited audio streaming",
      "Unlimited video streaming",
      "Ad-free experience",
      "Enhanced audio quality",
      "Full live event access",
      "Continue across devices",
      "Early access to selected releases",
    ],
    cta: "Upgrade to Essential",
    icon: Sparkles,
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Most Popular",
    badgeTone: "red",
    price: "₦2,500",
    priceSuffix: "/month",
    description: "The complete NoraPlus experience.",
    features: [
      "Everything in Essential",
      "Offline downloads",
      "Highest audio quality",
      "Highest video quality",
      "Exclusive premium content",
      "Premium conferences and partner content",
      "Priority event registration",
      "Future Premium member benefits",
    ],
    cta: "Upgrade to Premium",
    highlight: "premium",
    icon: Crown,
  },
];

const comparison: { feature: string; values: (string | boolean)[] }[] = [
  { feature: "Audio Streaming", values: ["Unlimited", "Selected", "Unlimited", "Unlimited"] },
  { feature: "Video Streaming", values: ["Unlimited", "Selected", "Unlimited", "Unlimited"] },
  { feature: "Live Events", values: [true, "Selected", true, "Priority"] },
  { feature: "Downloads", values: [true, false, false, true] },
  { feature: "Premium Content", values: [true, false, false, true] },
  { feature: "Ad-Free Experience", values: [true, false, true, true] },
  { feature: "Streaming Quality", values: ["Highest", "Standard", "Enhanced", "Highest"] },
  { feature: "Exclusive Events", values: [true, false, false, true] },
  { feature: "Early Access Releases", values: [true, false, "Selected", true] },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time from your account settings. You'll continue to enjoy your plan's benefits until the end of the current billing period.",
  },
  {
    q: "What happens after my free trial ends?",
    a: "When your 3-month free trial ends, you'll move to the Free plan automatically. You can upgrade to Essential or Premium at any time to keep full access.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade your plan whenever you'd like. Upgrades take effect immediately; downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "Will more premium features be added?",
    a: "Yes. NoraPlus is continually growing — new kingdom content, live experiences, creator tools, and premium features are added regularly for our subscribers.",
  },
  {
    q: "Do I lose my library if I downgrade?",
    a: "No. Your saved library, followed creators, and history are always preserved. Some premium items may become locked, but they reappear instantly when you upgrade.",
  },
];

const Plans = () => {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState<Plan | null>(null);

  const renderValue = (v: string | boolean) => {
    if (v === true) return <Check className="mx-auto h-4 w-4 text-gold" />;
    if (v === false) return <X className="mx-auto h-4 w-4 text-muted-foreground/50" />;
    return <span className="text-sm text-foreground/90">{v}</span>;
  };

  return (
    <div className="min-h-screen bg-hero">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Logo />
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to NoraPlus
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-24">
        {/* Page header */}
        <div className="relative text-center">
          <div className="absolute inset-x-0 -top-20 mx-auto h-64 max-w-2xl glow-radial blur-2xl opacity-60 pointer-events-none" />
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gold">
            <Sparkles className="h-3.5 w-3.5" /> Subscriptions
          </span>
          <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05]">
            Choose Your <span className="gold-text-gradient">NoraPlus</span> Experience
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
            Trusted kingdom content for every stage of your journey.
          </p>
        </div>

        {/* Plans grid */}
        <section className="mt-14 grid gap-6 md:gap-7 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isGold = plan.highlight === "gold";
            const isPremium = plan.highlight === "premium";
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl bg-card-gradient p-6 md:p-7 transition-all duration-500 hover:-translate-y-1",
                  "ring-1 ring-border/60",
                  isGold && "ring-gold shadow-glow",
                  isPremium && "ring-gold shadow-glow xl:scale-[1.03] xl:-translate-y-1",
                )}
              >
                {/* Premium ribbon for trial */}
                {isGold && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground shadow-glow">
                    Featured
                  </div>
                )}
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-red-glow">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                      isGold || isPremium ? "bg-gold/10 text-gold" : "bg-secondary text-foreground/80",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {plan.badge && !isPremium && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
                        plan.badgeTone === "gold" && "bg-gold/10 text-gold ring-1 ring-gold/30",
                        plan.badgeTone === "red" && "bg-red/10 text-red-soft ring-1 ring-red/30",
                        plan.badgeTone === "muted" && "bg-secondary text-muted-foreground ring-1 ring-border",
                      )}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-5 font-display text-2xl">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl tracking-tight">{plan.price}</span>
                  {plan.priceSuffix && (
                    <span className="text-sm text-muted-foreground">{plan.priceSuffix}</span>
                  )}
                </div>
                {plan.duration && (
                  <p className="mt-1 text-xs text-gold">for {plan.duration}</p>
                )}

                <div className="my-6 h-px bg-border/60" />

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <ul className="mt-3 space-y-2.5 border-t border-border/40 pt-3">
                    {plan.limitations.map((l) => (
                      <li key={l} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  disabled={plan.ctaDisabled}
                  onClick={() => !plan.ctaDisabled && setActivePlan(plan)}
                  className={cn(
                    "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-300",
                    plan.ctaDisabled &&
                      "cursor-not-allowed bg-secondary text-muted-foreground ring-1 ring-border",
                    !plan.ctaDisabled && isGold &&
                      "bg-gold-gradient text-primary-foreground hover:shadow-glow",
                    !plan.ctaDisabled && isPremium &&
                      "bg-red-gradient text-foreground hover:shadow-red-glow",
                    !plan.ctaDisabled && !isGold && !isPremium &&
                      "bg-secondary text-foreground ring-1 ring-border hover:bg-secondary/80 hover:ring-gold/40",
                  )}
                >
                  {plan.cta}
                  {!plan.ctaDisabled && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </section>

        {/* Comparison table */}
        <section className="mt-24">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl">Compare every plan</h2>
            <p className="mt-2 text-muted-foreground">A clear look at what's included across NoraPlus.</p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-border/60 bg-card-gradient">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/30">
                    <th className="px-5 py-4 text-left font-medium text-muted-foreground">Feature</th>
                    {plans.map((p) => (
                      <th
                        key={p.id}
                        className={cn(
                          "px-5 py-4 text-center font-display text-base",
                          p.highlight === "premium" && "text-gold",
                        )}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={cn(
                        "border-b border-border/40 last:border-0 transition-colors hover:bg-secondary/20",
                        i % 2 === 1 && "bg-background/30",
                      )}
                    >
                      <td className="px-5 py-3.5 text-foreground/90">{row.feature}</td>
                      {row.values.map((v, idx) => (
                        <td key={idx} className="px-5 py-3.5 text-center">
                          {renderValue(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24 mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl">Frequently asked</h2>
            <p className="mt-2 text-muted-foreground">Everything you need to know before you upgrade.</p>
          </div>
          <Accordion type="single" collapsible className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border/60 bg-card-gradient px-5 data-[state=open]:ring-1 data-[state=open]:ring-gold/30"
              >
                <AccordionTrigger className="py-4 text-left font-display text-base hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <footer className="mt-24 text-center text-xs text-muted-foreground">
          Prices in Nigerian Naira. Taxes may apply. You can cancel anytime from your account.
        </footer>
      </main>

      {/* Success modal */}
      <Dialog open={!!activePlan} onOpenChange={(open) => !open && setActivePlan(null)}>
        <DialogContent className="border-gold/30 bg-card-gradient sm:max-w-md">
          <div className="absolute inset-x-0 -top-24 mx-auto h-48 w-48 glow-radial blur-2xl opacity-70 pointer-events-none" />
          <DialogHeader>
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient shadow-glow">
              <Check className="h-7 w-7 text-primary-foreground" />
            </div>
            <DialogTitle className="text-center font-display text-2xl">
              Subscription Activated
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Welcome to your new NoraPlus experience
              {activePlan ? ` — ${activePlan.name}.` : "."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-col">
            <button
              onClick={() => {
                setActivePlan(null);
                navigate("/app");
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-gradient px-5 py-3 text-sm font-medium text-foreground hover:shadow-red-glow transition-all"
            >
              Continue Exploring <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setActivePlan(null);
                navigate("/app/library");
              }}
              className="inline-flex w-full items-center justify-center rounded-full bg-secondary px-5 py-3 text-sm font-medium text-foreground ring-1 ring-border hover:ring-gold/40 transition-all"
            >
              Go to Library
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plans;
