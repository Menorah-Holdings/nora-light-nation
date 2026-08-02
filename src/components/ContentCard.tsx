import { Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentItem } from "@/lib/mockData";
import { contentTypeLabel } from "@/lib/api/adapters";
import { SaveToLibraryButton } from "./SaveToLibraryButton";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/lib/player";

export const ContentCard = ({ item, size = "md", queue }: { item: ContentItem; size?: "sm" | "md" | "lg"; queue?: ContentItem[] }) => {
  const player = usePlayer();
  const w = { sm: "w-44", md: "w-56", lg: "w-72" }[size];
  const effectiveQueue = queue && queue.length > 0 ? queue : [item];
  const isActiveTrack = player.track?.id === item.id;

  const handlePlayClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isActiveTrack) {
      player.toggle();
      return;
    }

    void player.playFromQueue(effectiveQueue, item.id);
  };

  return (
    <article className={cn("group shrink-0 snap-start", w)}>
      <div className="relative overflow-hidden rounded-xl bg-card shadow-card-soft ring-1 ring-border/60 transition-all duration-500 group-hover:ring-gold group-hover:-translate-y-1">
        <Link
          to={`/app/content/${item.id}`}
          aria-label={`View ${item.title}`}
          className="absolute inset-0 z-10"
        />
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        {item.tag && (
          <span className="absolute top-3 left-3 rounded-full bg-background/70 backdrop-blur px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gold ring-1 ring-gold/40">
            {item.tag}
          </span>
        )}
        <div
          data-card-action="true"
          className="absolute top-3 right-3 z-20"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <SaveToLibraryButton
            contentId={item.id}
            className="h-8 w-8 bg-background/70 backdrop-blur text-foreground opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
        <button
          data-card-action="true"
          type="button"
          onClick={handlePlayClick}
          className="absolute bottom-14 right-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-gradient text-primary-foreground shadow-red-glow opacity-100 md:opacity-0 md:translate-y-2 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-y-0"
          aria-label={isActiveTrack && player.isPlaying ? "Pause" : "Play"}
        >
          {isActiveTrack && player.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
        </button>
        <div className="absolute bottom-0 left-0 right-0 z-[11] p-4 pointer-events-none">
          <p className="text-[10px] uppercase tracking-widest text-gold/80">
            {contentTypeLabel(item.type)} - {item.duration}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-base leading-snug">{item.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.creator}</p>
        </div>
      </div>
    </article>
  );
};
