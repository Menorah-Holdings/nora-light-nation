import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useUpdateProgress } from "@/lib/api/hooks/useLibrary";
import type { ContentItem } from "@/lib/mockData";

const PROGRESS_WRITE_INTERVAL = 15; // seconds between writes

interface PlayerContextValue {
  track: ContentItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: (track: ContentItem, url: string, startAt?: number) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastWriteRef = useRef(0);
  const updateProgress = useUpdateProgress();

  const writeProgress = useCallback(
    (el: HTMLAudioElement, completed = false) => {
      if (!track?.id || !Number.isFinite(el.currentTime)) return;
      const seconds = Math.floor(el.currentTime);
      if (!completed && seconds - lastWriteRef.current < PROGRESS_WRITE_INTERVAL) return;
      lastWriteRef.current = seconds;
      updateProgress.mutate({ contentId: track.id, progressSeconds: seconds, completed });
    },
    [track?.id, updateProgress],
  );

  const play = useCallback(
    (newTrack: ContentItem, url: string, startAt = 0) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (track?.id !== newTrack.id) {
        setTrack(newTrack);
        setCurrentTime(0);
        setDuration(0);
        lastWriteRef.current = 0;
        audio.src = url;
        audio.load();
        if (startAt > 0) {
          const applyStart = () => {
            if (Number.isFinite(audio.duration) && startAt < audio.duration - 3) {
              audio.currentTime = startAt;
            }
            audio.removeEventListener("loadedmetadata", applyStart);
          };
          audio.addEventListener("loadedmetadata", applyStart);
        }
      }

      audio.play().catch(() => {});
    },
    [track?.id],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play().catch(() => {});
  }, [isPlaying]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  return (
    <PlayerContext.Provider
      value={{ track, isPlaying, currentTime, duration, play, pause, resume, toggle, seek }}
    >
      {children}
      {/* Single global audio element — lives outside the route tree so it survives navigation */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={(e) => {
          setIsPlaying(false);
          writeProgress(e.currentTarget);
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          writeProgress(e.currentTarget);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={(e) => {
          setIsPlaying(false);
          writeProgress(e.currentTarget, true);
        }}
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextValue => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
