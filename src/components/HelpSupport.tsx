import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Download, CreditCard, Mic2, Mail, MessageCircle, MessagesSquare,
  Flag, FileText, Shield, Users, Sparkles, Upload, CheckCircle2, ArrowRight,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const cardStyle = {
  background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))",
};

const QUICK_HELP = [
  { icon: BookOpen, title: "Getting Started", description: "Learn how to use NoraPlus.", cta: "View Guide" },
  { icon: Download, title: "Downloads", description: "Managing offline downloads.", cta: "Learn More" },
  { icon: CreditCard, title: "Subscriptions", description: "Questions about plans and billing.", cta: "View Plans Help" },
  { icon: Mic2, title: "Creator Help", description: "Everything about Create on NoraPlus and Creator Studio.", cta: "Creator Guide" },
];

const FAQS = [
  { q: "How do I download content?", a: "Open any audio, video, or devotional and tap the three-dot menu, then choose Download. Your downloads live in Library → Downloads and are available offline. Download quality is configurable under Settings → Download Settings." },
  { q: "How does the Free Trial work?", a: "New members get a 14-day Free Trial of Premium. You can cancel anytime from Settings → Subscription before the trial ends and you won't be charged." },
  { q: "How do I become a Creator?", a: "Open Create on NoraPlus from the sidebar and complete the creator application. The NoraPlus team reviews submissions within 3-5 business days. Once approved, Creator Studio unlocks automatically on the same account." },
  { q: "How do I cancel my subscription?", a: "Go to Settings → Subscription → Manage Plan and choose Cancel Subscription. Your benefits remain active until the end of the current billing period." },
  { q: "Can I watch NoraPlus on multiple devices?", a: "Yes. Your NoraPlus account works across web, iOS, and Android. Premium members can stream on up to 4 devices at the same time." },
  { q: "How do I reset my password?", a: "From the sign-in screen, tap Forgot Password and enter the email tied to your account. We'll send a secure reset link that expires in 30 minutes." },
];

const REPORT_CATEGORIES = [
  "Playback", "Downloads", "Subscription", "Account", "Creator Studio", "Live Events", "Other",
];

const ABOUT_LINKS = [
  { label: "Privacy Policy", icon: Shield },
  { label: "Terms of Service", icon: FileText },
  { label: "Community Guidelines", icon: Users },
  { label: "Creator Guidelines", icon: Mic2 },
];

const HelpSupport = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const resetForm = () => {
    setSubject(""); setCategory(""); setDescription(""); setScreenshot(null);
  };

  const submitReport = () => {
    if (!subject.trim() || !category || !description.trim()) {
      toast.error("Please complete subject, category, and description.");
      return;
    }
    setReportOpen(false);
    setSuccessOpen(true);
    resetForm();
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl text-foreground">Help & Support</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We're here to help you get the most out of your NoraPlus experience.
        </p>
      </div>

      {/* Quick Help */}
      <section className="space-y-4">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">Quick Help</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_HELP.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-gold/20 p-5 shadow-elegant transition-all hover:border-gold/60 hover:shadow-glow"
                style={cardStyle}
              >
                <div className="absolute inset-0 pointer-events-none glow-radial opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red/10 ring-1 ring-gold/30">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-display text-base text-foreground">{c.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <button
                    onClick={() => toast("Opening guide", { description: c.title })}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gold transition-colors group-hover:underline"
                  >
                    {c.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section className="space-y-4">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">Frequently Asked Questions</h3>
        <div
          className="relative overflow-hidden rounded-2xl border border-gold/20 px-5 py-1 sm:px-6 shadow-elegant"
          style={cardStyle}
        >
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-20" />
          <Accordion type="single" collapsible className="relative">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="border-border/40 last:border-none">
                <AccordionTrigger className="text-left text-sm font-display hover:text-gold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Support */}
      <section className="space-y-4">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">Contact Support</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-gold/20 p-5 shadow-elegant" style={cardStyle}>
            <div className="absolute inset-0 pointer-events-none glow-radial opacity-20" />
            <div className="relative space-y-3">
              <Mail className="h-5 w-5 text-gold" />
              <div>
                <p className="font-display text-sm">Email Support</p>
                <p className="mt-1 text-xs text-muted-foreground">support@noraplus.io</p>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow transition-shadow"
              >
                <a href="mailto:support@noraplus.io">Send Email</a>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-gold/20 p-5 shadow-elegant" style={cardStyle}>
            <div className="absolute inset-0 pointer-events-none glow-radial opacity-20" />
            <div className="relative space-y-3">
              <MessageCircle className="h-5 w-5 text-gold" />
              <div>
                <p className="font-display text-sm">Live Chat</p>
                <p className="mt-1 text-xs text-gold/80">Coming Soon</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("We'll notify you when Live Chat is ready.")}
                className="border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:text-gold"
              >
                Notify Me
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-gold/20 p-5 shadow-elegant" style={cardStyle}>
            <div className="absolute inset-0 pointer-events-none glow-radial opacity-20" />
            <div className="relative space-y-3">
              <MessagesSquare className="h-5 w-5 text-gold" />
              <div>
                <p className="font-display text-sm">WhatsApp Support</p>
                <p className="mt-1 text-xs text-muted-foreground">Chat with our team directly.</p>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success("Opening WhatsApp…")}
                className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow transition-shadow"
              >
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Report a Problem */}
      <section className="space-y-4">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">Report a Problem</h3>
        <div
          className="relative overflow-hidden rounded-2xl border border-gold/20 p-6 shadow-elegant"
          style={cardStyle}
        >
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red/10 ring-1 ring-gold/30">
                <Flag className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-display text-base">Found something wrong?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tell our team about playback errors, billing issues, or content concerns.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setReportOpen(true)}
              className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow transition-shadow"
            >
              Report an Issue
            </Button>
          </div>
        </div>
      </section>

      {/* About NoraPlus */}
      <section className="space-y-4">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">About NoraPlus</h3>
        <div
          className="relative overflow-hidden rounded-2xl border border-gold/20 p-5 sm:p-6 shadow-elegant"
          style={cardStyle}
        >
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-20" />
          <div className="relative grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-gold" />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">App Version</p>
                <p className="font-display text-sm">NoraPlus 1.0.0 (MVP)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-gold" />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Platform Version</p>
                <p className="font-display text-sm">Web · build 2026.06.27</p>
              </div>
            </div>

            <div className="sm:col-span-2 mt-2 grid gap-2 sm:grid-cols-2">
              {ABOUT_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <button
                    key={l.label}
                    onClick={() => toast(`Opening ${l.label}`)}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-3 text-sm text-foreground/90 transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {l.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={(o) => { setReportOpen(o); if (!o) resetForm(); }}>
        <DialogContent
          className="border-gold/30 sm:max-w-lg"
          style={cardStyle}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Report an Issue</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share as much detail as you can so we can resolve this quickly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-subject" className="text-xs text-muted-foreground">Subject</Label>
              <Input
                id="report-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                className="border-border bg-secondary/60 focus-visible:ring-1 focus-visible:ring-gold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description" className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? Include steps to reproduce if you can."
                rows={4}
                className="border-border bg-secondary/60 focus-visible:ring-1 focus-visible:ring-gold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Screenshot (optional)</Label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-border/70 bg-background/40 px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold">
                <span className="flex items-center gap-2 truncate">
                  <Upload className="h-4 w-4" />
                  {screenshot ? screenshot.name : "Attach a screenshot"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button
              onClick={submitReport}
              className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow transition-shadow"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="border-gold/30 sm:max-w-md text-center" style={cardStyle}>
          <DialogHeader>
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-primary-foreground ring-1 ring-gold/40">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="font-display text-2xl mt-3">Report Submitted</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Thanks for letting us know. Our support team will review your report and get back to you if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setSuccessOpen(false)}
              className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow transition-shadow"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Link to keep react-router import referenced for future deep links */}
      <Link to="/plans" className="hidden" aria-hidden />
    </div>
  );
};

export default HelpSupport;
