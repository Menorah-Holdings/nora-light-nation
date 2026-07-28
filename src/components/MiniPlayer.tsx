import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useRef } from "react";
import { usePlayer, formatTime } from "@/lib/player";
import { NowPlayingMenu } from "./NowPlayingMenu";

export const MiniPlayer = () => {
  const { track, isPlaying, currentTime, duration, toggle, seek, pause, resume } = usePlayer();
  const progressRef = useRef<HTMLDivElement>(null);

  if (!track) return null;

  const progress = duration > 0 ? currentTime / duration : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl md:left-64">
      <div className="mx-auto flex items-center gap-4 px-4 py-3">
        {/* Thumbnail + info */}
        <img src={track.image} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{track.title}</p>
          <p className="truncate text-xs text-muted-foreground">{track.creator}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => seek(Math.max(0, currentTime - 15))}
            className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
            aria-label="Back 15 seconds"
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
            onClick={() => seek(Math.min(duration, currentTime + 15))}
            className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
            aria-label="Forward 15 seconds"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="hidden lg:flex flex-1 items-center gap-3 max-w-md">
          <span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressRef}
            role="progressbar"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemax={Math.round(duration)}
            onClick={handleProgressClick}
            className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-muted"
          >
            <div
              className="absolute inset-y-0 left-0 bg-gold-gradient transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="w-8 text-[10px] tabular-nums text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        <button
          type="button"
          className="hidden text-muted-foreground md:inline-flex"
          aria-label="Volume"
        >
          <Volume2 className="h-4 w-4" />
        </button>

        <NowPlayingMenu item={track} variant="compact" />
      </div>

      {/* Mobile thin progress strip at bottom edge */}
      <div className="h-0.5 w-full bg-muted lg:hidden">
        <div
          className="h-full bg-gold-gradient transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};
