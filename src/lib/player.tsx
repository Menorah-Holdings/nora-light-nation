import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import { adaptContent } from "@/lib/api/adapters";
import type { ApiContent, ApiPlayback } from "@/lib/api/types";
import { useUpdateProgress } from "@/lib/api/hooks/useLibrary";
import type { ContentItem } from "@/lib/mockData";

const PROGRESS_WRITE_INTERVAL = 15; // seconds between writes

interface PlayerContextValue {
  track: ContentItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: ContentItem[];
  queueIndex: number;
  isExpanded: boolean;
  play: (track: ContentItem, url: string, startAt?: number) => void;
  playFromQueue: (queue: ContentItem[], startTrackId: string) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackUrlCacheRef = useRef(new Map<string, string>());
  const playbackRequestRef = useRef(0);
  const [track, setTrack] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<ContentItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const resolvePlaybackUrl = useCallback(async (contentId: string) => {
    const cached = playbackUrlCacheRef.current.get(contentId);
    if (cached) return cached;

    try {
      const playback = await apiRequest<ApiPlayback>(`/api/content/${contentId}/playback`);
      if (!playback.url) return null;
      playbackUrlCacheRef.current.set(contentId, playback.url);
      return playback.url;
    } catch {
      return null;
    }
  }, []);

  const getSmartQueue = useCallback(async (seedTrack: ContentItem, baseQueue: ContentItem[]) => {
    try {
      const recommended = await apiRequest<ApiContent[]>(`/api/content/${seedTrack.id}/queue`, {
        query: { mode: "mix", limit: 20 },
      });

      const recommendedItems = recommended.map(adaptContent);
      const merged = [seedTrack, ...baseQueue, ...recommendedItems];
      const deduped: ContentItem[] = [];
      const seen = new Set<string>();

      for (const item of merged) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        deduped.push(item);
      }

      return deduped;
    } catch {
      const merged = [seedTrack, ...baseQueue];
      const deduped: ContentItem[] = [];
      const seen = new Set<string>();

      for (const item of merged) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        deduped.push(item);
      }

      return deduped;
    }
  }, []);

  const playByQueueIndex = useCallback(
    async (nextQueue: ContentItem[], index: number) => {
      if (index < 0 || index >= nextQueue.length) return;

      const nextTrack = nextQueue[index];
      if (!nextTrack) return;

      const requestId = ++playbackRequestRef.current;
      const playbackUrl = await resolvePlaybackUrl(nextTrack.id);
      if (requestId !== playbackRequestRef.current) return;
      if (!playbackUrl) return;

      setQueue(nextQueue);
      setQueueIndex(index);
      play(nextTrack, playbackUrl, 0);
    },
    [play, resolvePlaybackUrl],
  );

  const playFromQueue = useCallback(
    async (nextQueue: ContentItem[], startTrackId: string) => {
      if (nextQueue.length === 0) return;
      const startTrack = nextQueue.find((item) => item.id === startTrackId);
      if (!startTrack) return;

      const remainder = nextQueue.filter((item) => item.id !== startTrackId);
      const smartQueue = await getSmartQueue(startTrack, remainder);
      const startIndex = smartQueue.findIndex((item) => item.id === startTrackId);
      if (startIndex < 0) return;
      await playByQueueIndex(smartQueue, startIndex);
    },
    [getSmartQueue, playByQueueIndex],
  );

  const playNext = useCallback(async () => {
    if (queue.length === 0) return;
    const nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) return;
    await playByQueueIndex(queue, nextIndex);
  }, [playByQueueIndex, queue, queueIndex]);

  const playPrevious = useCallback(async () => {
    if (queue.length === 0) return;

    if (currentTime > 5) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }

    const previousIndex = queueIndex - 1;
    if (previousIndex < 0) return;
    await playByQueueIndex(queue, previousIndex);
  }, [currentTime, playByQueueIndex, queue, queueIndex]);

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
      value={{
        track,
        isPlaying,
        currentTime,
        duration,
        queue,
        queueIndex,
        isExpanded,
        play,
        playFromQueue,
        playNext,
        playPrevious,
        pause,
        resume,
        toggle,
        seek,
        setExpanded: setIsExpanded,
        toggleExpanded: () => setIsExpanded((value) => !value),
      }}
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
          void playNext();
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
