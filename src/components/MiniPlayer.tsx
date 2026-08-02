import { ChevronDown, ChevronUp, ListMusic, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useRef } from "react";
import { usePlayer, formatTime } from "@/lib/player";
import { NowPlayingMenu } from "./NowPlayingMenu";
import { contentTypeLabel } from "@/lib/api/adapters";
import { cn } from "@/lib/utils";

export const MiniPlayer = () => {
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    queue,
    queueIndex,
    isExpanded,
    toggle,
    seek,
    playFromQueue,
    playNext,
    playPrevious,
    toggleExpanded,
    setExpanded,
  } = usePlayer();
  const progressRef = useRef<HTMLDivElement>(null);

  if (!track) return null;

  const progress = duration > 0 ? currentTime / duration : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 z-[70] bg-background/75 backdrop-blur-xl md:left-64">
          <div className="mx-auto flex h-full max-w-6xl flex-col p-4 md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Now Playing</p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="h-4 w-4" /> Minimize
              </button>
            </div>

            <div className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-3xl bg-card-gradient p-5 ring-1 ring-gold/20 shadow-[0_16px_48px_hsl(var(--gold)/0.15)] md:p-8">
                <div className="mx-auto max-w-3xl">
                  <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-black/40">
                    <img src={track.image} alt="" className="aspect-video w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    {track.medium === "video" && (
                      <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-widest text-gold ring-1 ring-gold/40">
                        Video mode
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">{contentTypeLabel(track.type)}</p>
                    <h2 className="mt-2 font-display text-2xl md:text-3xl">{track.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{track.creator}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="w-9 text-right tabular-nums">{formatTime(currentTime)}</span>
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(currentTime)}
                      aria-valuemax={Math.round(duration)}
                      onClick={handleProgressClick}
                      className="relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-gold-gradient transition-all duration-300"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <span className="w-9 tabular-nums">{formatTime(duration)}</span>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-5">
                    <button
                      type="button"
                      onClick={() => void playPrevious()}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                      aria-label="Previous in queue"
                    >
                      <SkipBack className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={toggle}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-gradient text-primary-foreground shadow-red-glow"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void playNext()}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                      aria-label="Next in queue"
                    >
                      <SkipForward className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </section>

              <aside className="flex min-h-0 flex-col rounded-3xl bg-card-gradient p-4 ring-1 ring-border/70 md:p-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-foreground">
                  <ListMusic className="h-4 w-4 text-gold" />
                  <span>Queue</span>
                  <span className="text-xs text-muted-foreground">({queue.length})</span>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {queue.map((item, index) => {
                    const active = index === queueIndex;
                    return (
                      <button
                        key={`${item.id}-${index}`}
                        type="button"
                        onClick={() => void playFromQueue(queue, item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl p-2 text-left transition",
                          active ? "bg-gold/10 ring-1 ring-gold/30" : "hover:bg-secondary/40",
                        )}
                      >
                        <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.creator}</p>
                        </div>
                        {active && <span className="text-[10px] uppercase tracking-widest text-gold">Playing</span>}
                      </button>
                    );
                  })}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl md:left-64">
        <div className="mx-auto flex items-center gap-4 px-4 py-3">
          {/* Thumbnail + info */}
          <button type="button" onClick={toggleExpanded} className="shrink-0">
            <img src={track.image} alt="" className="h-12 w-12 rounded-md object-cover" />
          </button>
          <button type="button" onClick={toggleExpanded} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium">{track.title}</p>
            <p className="truncate text-xs text-muted-foreground">{track.creator}</p>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void playPrevious()}
              className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
              aria-label="Previous in queue"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-gradient text-primary-foreground shadow-red-glow"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => void playNext()}
              className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
              aria-label="Next in queue"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="hidden lg:flex flex-1 items-center gap-3 max-w-md">
            <span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              role="progressbar"
              aria-valuenow={Math.round(currentTime)}
              aria-valuemax={Math.round(duration)}
              onClick={handleProgressClick}
              className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-muted"
            >
              <div className="absolute inset-y-0 left-0 bg-gold-gradient transition-all duration-300" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="w-8 text-[10px] tabular-nums text-muted-foreground">{formatTime(duration)}</span>
          </div>

          <button
            type="button"
            onClick={toggleExpanded}
            className="hidden text-muted-foreground md:inline-flex"
            aria-label={isExpanded ? "Minimize player" : "Expand player"}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>

          <button type="button" className="hidden text-muted-foreground lg:inline-flex" aria-label="Volume">
            <Volume2 className="h-4 w-4" />
          </button>

          <NowPlayingMenu item={track} variant="compact" />
        </div>

        {/* Mobile thin progress strip at bottom edge */}
        <div className="h-0.5 w-full bg-muted lg:hidden">
          <div className="h-full bg-gold-gradient transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </>
  );
};
