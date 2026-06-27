import { Link } from "react-router-dom";

export const Logo = ({ to = "/", compact = false }: { to?: string; compact?: boolean }) => (
  <Link to={to} className="flex items-center gap-2.5 group">
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold-gradient shadow-glow">
      <span className="absolute inset-1 rounded-full bg-background/40" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-gold-gradient" />
    </span>
    {!compact && (
      <span className="font-display text-xl font-medium tracking-tight">
        NoraPlus
      </span>
    )}
  </Link>
);
