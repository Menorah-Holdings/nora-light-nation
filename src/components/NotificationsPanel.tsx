import { useEffect, useRef, useState } from "react";
import { Bell, Radio, Play, Music, Clock, Sparkles, X, Settings, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type NotifType = "live" | "content" | "music" | "reminder" | "subscription";
type Filter = "all" | "unread" | "live" | "updates";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  cta?: string;
}

const initial: Notif[] = [
  { id: "1", type: "live", title: "Liberty House is now live", message: "Join tonight's Worship & Prayer Experience.", time: "Just now", unread: true, cta: "Join" },
  { id: "2", type: "content", title: "New message available", message: "The Secret Place has just been released.", time: "12 min ago", unread: true, cta: "Watch" },
  { id: "3", type: "music", title: "New worship single", message: "Ascension Sessions released a new track.", time: "1 hr ago", unread: true, cta: "Listen" },
  { id: "4", type: "reminder", title: "Event starts soon", message: "Global Fire Conference begins in 30 minutes.", time: "2 hr ago", unread: false, cta: "Open" },
  { id: "5", type: "subscription", title: "Welcome to Nora Premium", message: "Your membership is now active.", time: "Yesterday", unread: false },
];

const iconFor = (t: NotifType) => {
  switch (t) {
    case "live": return Radio;
    case "content": return Play;
    case "music": return Music;
    case "reminder": return Clock;
    case "subscription": return Sparkles;
  }
};

const matchesFilter = (n: Notif, f: Filter) => {
  if (f === "all") return true;
  if (f === "unread") return n.unread;
  if (f === "live") return n.type === "live";
  if (f === "updates") return n.type === "content" || n.type === "music" || n.type === "subscription";
  return true;
};

export const NotificationsPanel = () => {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [notifs, setNotifs] = useState<Notif[]>(initial);
  const [settings, setSettings] = useState({
    live: true,
    content: true,
    creators: true,
    subscription: true,
    product: false,
  });
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => n.unread).length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markAll = () => setNotifs(ns => ns.map(n => ({ ...n, unread: false })));
  const markRead = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, unread: false } : n));

  const visible = notifs.filter(n => matchesFilter(n, filter));

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "live", label: "Live" },
    { id: "updates", label: "Updates" },
  ];

  const Item = ({ n, onClick }: { n: Notif; onClick?: () => void }) => {
    const Icon = iconFor(n.type);
    return (
      <button
        onClick={() => { markRead(n.id); onClick?.(); }}
        className={cn(
          "group w-full text-left flex gap-3 rounded-xl p-3 transition-colors",
          n.unread
            ? "bg-red/10 hover:bg-red/15 ring-1 ring-gold/15"
            : "hover:bg-secondary/60"
        )}
      >
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          n.type === "live" ? "bg-red-gradient text-primary-foreground" : "bg-secondary text-gold"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className={cn("text-sm leading-snug truncate", n.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {n.title}
            </p>
            {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-glow" />}
          </div>
          <p className={cn("mt-0.5 text-xs leading-snug line-clamp-2", n.unread ? "text-foreground/70" : "text-muted-foreground/80")}>
            {n.message}
          </p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{n.time}</span>
            {n.cta && (
              <span className="text-[11px] font-medium text-gold group-hover:underline">{n.cta} →</span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold-gradient text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-glow">
              {unread}
            </span>
          )}
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-[360px] sm:w-[400px] origin-top-right rounded-2xl border border-gold/30 shadow-elegant animate-fade-up overflow-hidden z-50"
            style={{
              background: "linear-gradient(160deg, hsl(350 35% 12%), hsl(350 25% 7%))",
            }}
          >
            <div className="absolute inset-0 pointer-events-none glow-radial opacity-40" />
            <div className="relative">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base text-foreground">Notifications</h3>
                  {unread > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
                      {unread} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAll}
                  className="text-[11px] text-gold hover:text-gold-soft transition-colors"
                >
                  Mark all as read
                </button>
              </div>

              <div className="px-4 pb-2 flex gap-1.5">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-full transition-all",
                      filter === f.id
                        ? "bg-gold-gradient text-primary-foreground font-semibold shadow-glow"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="max-h-[400px] overflow-y-auto px-2 py-1 space-y-1 scrollbar-none">
                {visible.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div className="mx-auto h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                      <Check className="h-5 w-5 text-gold" />
                    </div>
                    <p className="font-display text-sm">You're all caught up.</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll notify you whenever something new is worth seeing or hearing.</p>
                  </div>
                ) : (
                  visible.map(n => <Item key={n.id} n={n} />)
                )}
              </div>

              <div className="border-t border-border/60 px-4 py-2.5">
                <button
                  onClick={() => { setOpen(false); setModal(true); }}
                  className="w-full text-center text-xs font-medium text-gold hover:text-gold-soft transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-gold/30"
          style={{ background: "linear-gradient(160deg, hsl(350 30% 10%), hsl(350 22% 6%))" }}
        >
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
          <div className="relative">
            <DialogHeader className="px-6 pt-6 pb-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="font-display text-2xl">Notification Center</DialogTitle>
              </div>
            </DialogHeader>

            <div className="px-6 pb-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full transition-all",
                      filter === f.id
                        ? "bg-gold-gradient text-primary-foreground font-semibold shadow-glow"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button onClick={markAll} className="text-xs text-gold hover:text-gold-soft">Mark all as read</button>
            </div>

            <div className="grid md:grid-cols-[1fr_240px] gap-4 px-4 pb-4">
              <div className="max-h-[60vh] overflow-y-auto space-y-1.5 pr-2 scrollbar-none">
                {visible.length === 0 ? (
                  <div className="px-4 py-16 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                      <Check className="h-6 w-6 text-gold" />
                    </div>
                    <p className="font-display text-lg">You're all caught up.</p>
                    <p className="text-sm text-muted-foreground mt-1">We'll notify you whenever something new is worth seeing or hearing.</p>
                  </div>
                ) : (
                  visible.map(n => <Item key={n.id} n={n} />)
                )}
              </div>

              <aside className="rounded-xl bg-card/60 ring-1 ring-border/60 p-4 self-start">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4 text-gold" />
                  <h4 className="font-display text-sm">Settings</h4>
                </div>
                <div className="space-y-3 text-xs">
                  {[
                    { key: "live", label: "Live Event Alerts" },
                    { key: "content", label: "New Content" },
                    { key: "creators", label: "Creator Updates" },
                    { key: "subscription", label: "Subscription Updates" },
                    { key: "product", label: "Product Announcements" },
                  ].map(s => (
                    <div key={s.key} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">{s.label}</span>
                      <Switch
                        checked={(settings as any)[s.key]}
                        onCheckedChange={(v) => setSettings(p => ({ ...p, [s.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
