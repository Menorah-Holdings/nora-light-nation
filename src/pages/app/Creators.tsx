import { Link } from "react-router-dom";
import { creators } from "@/lib/mockData";
import { BadgeCheck } from "lucide-react";

const Creators = () => (
  <div className="space-y-8">
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Trusted voices</p>
      <h1 className="mt-2 font-display text-4xl md:text-5xl">Creators & Ministries</h1>
      <p className="mt-2 text-muted-foreground max-w-lg">Discover the pastors, artists, podcasters, and filmmakers shaping the Nora collective.</p>
    </div>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {creators.map(c => (
        <Link key={c.id} to={`/app/creators/${c.id}`} className="group rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60 transition hover:ring-gold/40">
          <div className="flex items-center gap-4">
            <img src={c.image} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-gold/30" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-display text-lg truncate">{c.name}</p>
                {c.verified && <BadgeCheck className="h-4 w-4 text-gold" />}
              </div>
              <p className="text-xs text-muted-foreground">{c.category}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs">
            <div><p className="font-display text-base">{c.followers}</p><p className="text-muted-foreground">Followers</p></div>
            <div><p className="font-display text-base">{c.plays}</p><p className="text-muted-foreground">Plays</p></div>
            <button className="rounded-full bg-red-gradient px-4 py-1.5 text-[11px] font-medium text-primary-foreground shadow-red-glow">Follow</button>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default Creators;
