import { Pause, Play, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";
import { useState } from "react";
import { content } from "@/lib/mockData";
import { NowPlayingMenu } from "./NowPlayingMenu";

export const MiniPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const track = content[0];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl md:left-64">
      <div className="mx-auto flex items-center gap-4 px-4 py-3">
        <img src={track.image} alt="" className="h-12 w-12 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{track.title}</p>
          <p className="truncate text-xs text-muted-foreground">{track.creator}</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground"><SkipBack className="h-4 w-4" /></button>
          <button onClick={() => setPlaying(!playing)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-gradient text-primary-foreground shadow-red-glow">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          <button className="text-muted-foreground hover:text-foreground"><SkipForward className="h-4 w-4" /></button>
        </div>
        <div className="hidden lg:flex flex-1 items-center gap-3 max-w-md">
          <span className="text-[10px] text-muted-foreground">1:24</span>
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gold-gradient" />
          </div>
          <span className="text-[10px] text-muted-foreground">{track.duration}</span>
        </div>
        <button className="hidden md:inline-flex text-muted-foreground hover:text-gold"><Heart className="h-4 w-4" /></button>
        <button className="hidden md:inline-flex text-muted-foreground"><Volume2 className="h-4 w-4" /></button>
        <button onClick={() => setPlaying(!playing)} className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-gradient text-primary-foreground shadow-red-glow">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
      </div>
    </div>
  );
};
