import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Headphones, Play, Radio, BookOpen, Users, Library, LayoutDashboard, Shield, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { NotificationsPanel } from "./NotificationsPanel";
import { MiniPlayer } from "./MiniPlayer";
import { cn } from "@/lib/utils";
import { useUser, creatorNavLabel } from "@/lib/user";

const baseNav = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/listen", label: "Listen", icon: Headphones },
  { to: "/app/watch", label: "Watch", icon: Play },
  { to: "/app/live", label: "Live", icon: Radio },
  { to: "/app/devotionals", label: "Devotionals", icon: BookOpen },
  { to: "/app/creators", label: "Creators", icon: Users },
  { to: "/app/library", label: "Library", icon: Library },
];

export const AppLayout = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isNoraTeam } = useUser();

  const nav = [
    ...baseNav,
    { to: "/app/admin", label: creatorNavLabel(user.creator_status), icon: LayoutDashboard },
    ...(isNoraTeam ? [{ to: "/app/nora-admin", label: "Nora Admin", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar p-5 transition-transform md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between">
          <Logo />
          <button className="md:hidden text-muted-foreground" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-10 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={(n as any).end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-red ring-1 ring-red/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-10 rounded-xl bg-card-gradient p-4 ring-1 ring-border/60">
          <p className="font-display text-sm leading-snug">Become a Nora Partner</p>
          <p className="mt-1 text-xs text-muted-foreground">Distribute your kingdom content to a global audience.</p>
          <NavLink to="/partner" className="mt-3 inline-flex text-xs text-gold hover:underline">Learn more →</NavLink>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur md:hidden" onClick={() => setOpen(false)} />}

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl md:px-8">
          <button className="md:hidden text-muted-foreground" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search messages, worship, podcasts, movies, creators…"
              className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <NotificationsPanel />
          <NavLink
            to="/app/settings"
            aria-label="Profile & Settings"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient text-primary-foreground text-sm font-semibold ring-1 ring-gold/40 hover:shadow-glow transition-shadow"
          >
            {user.avatarInitial}
          </NavLink>
        </header>

        <main key={pathname} className="px-4 md:px-8 py-8 pb-32 animate-fade-up">
          <Outlet />
        </main>
      </div>

      <MiniPlayer />
    </div>
  );
};
