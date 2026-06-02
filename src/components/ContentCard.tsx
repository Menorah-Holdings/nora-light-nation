import { Bookmark, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentItem } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  message: "Message", music: "Music", podcast: "Podcast", devotional: "Devotional",
  movie: "Movie", skit: "Skit", "podcast-video": "Podcast Video", "music-video": "Music Video", event: "Live Event",
};

export const ContentCard = ({ item, size = "md" }: { item: ContentItem; size?: "sm" | "md" | "lg" }) => {
  const w = { sm: "w-44", md: "w-56", lg: "w-72" }[size];
  return (
    <Link
      to={`/app/content/${item.id}`}
      className={cn("group shrink-0 snap-start", w)}
    >
      <div className="relative overflow-hidden rounded-xl bg-card shadow-card-soft ring-1 ring-border/60 transition-all duration-500 group-hover:ring-gold group-hover:-translate-y-1">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        {item.tag && (
          <span className="absolute top-3 left-3 rounded-full bg-background/70 backdrop-blur px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gold ring-1 ring-gold/40">
            {item.tag}
          </span>
        )}
        <button className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur text-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Bookmark className="h-4 w-4" />
        </button>
        <button className="absolute bottom-14 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-gradient text-primary-foreground shadow-red-glow opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Play className="h-5 w-5 fill-current" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] uppercase tracking-widest text-gold/80">{typeLabel[item.type]} · {item.duration}</p>
          <h3 className="mt-1 line-clamp-2 font-display text-base leading-snug">{item.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.creator}</p>
        </div>
      </div>
    </Link>
  );
};
