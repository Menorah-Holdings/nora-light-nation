import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Share2, Pause } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { NowPlayingMenu } from "@/components/NowPlayingMenu";
import { SaveToLibraryButton } from "@/components/SaveToLibraryButton";
import { adaptContent, contentTypeLabel } from "@/lib/api/adapters";
import { ApiClientError } from "@/lib/api/client";
import { useContentDetail, useContentList, useContentPlayback } from "@/lib/api/hooks/useContent";
import { usePlaybackProgress, useUpdateProgress } from "@/lib/api/hooks/useLibrary";

const PROGRESS_WRITE_INTERVAL_SECONDS = 15;

const ContentDetail = () => {
  const { id } = useParams();
  const [playing, setPlaying] = useState(false);
  const progressAppliedRef = useRef(false);
  const lastProgressWriteRef = useRef(0);
  const detailQuery = useContentDetail(id);
  const relatedQuery = useContentList({ limit: 12 });
  const playbackQuery = useContentPlayback(id);
  const progressQuery = usePlaybackProgress(id);
  const updateProgress = useUpdateProgress();
  const item = detailQuery.data ? adaptContent(detailQuery.data) : null;
  const related = (relatedQuery.data ?? [])
    .filter((content) => content.id !== id)
    .map(adaptContent)
    .slice(0, 6);

  useEffect(() => {
    progressAppliedRef.current = false;
    lastProgressWriteRef.current = 0;
    setPlaying(false);
  }, [id]);

  if (detailQuery.isLoading && !item) {
    return <DetailSkeleton />;
  }

  if (!item) {
    return <p>Not found. <Link to="/app" className="text-gold">Back</Link></p>;
  }

  const isVideo = item.medium === "video";
  const playbackUrl = playbackQuery.data?.url ?? null;
  const premiumDenied = playbackQuery.error instanceof ApiClientError && playbackQuery.error.status === 403;

  const applySavedProgress = (media: HTMLMediaElement) => {
    if (progressAppliedRef.current) return;
    const seconds = progressQuery.data?.progressSeconds ?? 0;
    if (seconds > 0 && Number.isFinite(media.duration) && seconds < media.duration - 3) {
      media.currentTime = seconds;
    }
    progressAppliedRef.current = true;
  };

  const writeProgress = (media: HTMLMediaElement, completed = false) => {
    if (!id || !Number.isFinite(media.currentTime)) return;

    const progressSeconds = Math.floor(media.currentTime);
    if (!completed && progressSeconds - lastProgressWriteRef.current < PROGRESS_WRITE_INTERVAL_SECONDS) return;

    lastProgressWriteRef.current = progressSeconds;
    updateProgress.mutate({ contentId: id, progressSeconds, completed });
  };

  return (
    <div className="space-y-12">
      {detailQuery.isError && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Content details could not refresh. Try again in a moment.
        </div>
      )}

      <div className="relative -mx-4 md:-mx-8 -mt-8 overflow-hidden">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <button type="button" onClick={() => setPlaying(!playing)} className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-red-gradient text-primary-foreground shadow-red-glow inline-flex items-center justify-center hover:scale-105 transition">
            {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
          </button>
          <div className="absolute top-3 right-3 md:top-5 md:right-5">
            <NowPlayingMenu item={item} variant="overlay" />
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">{contentTypeLabel(item.type)} - {item.duration}</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{item.title}</h1>
            {item.creatorId ? (
              <Link to={`/app/creators/${item.creatorId}`} className="mt-2 inline-block text-sm text-muted-foreground hover:text-gold">by {item.creator}</Link>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">by {item.creator}</p>
            )}
          </div>
          <p className="text-foreground/85 leading-relaxed">
            {item.description || "A NoraPlus selection created to strengthen faith, worship, and spiritual growth."}
          </p>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPlaying(!playing)} className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"><Play className="h-4 w-4 fill-current" /> Play</button>
            <SaveToLibraryButton contentId={item.id} showLabel className="border border-border px-5 py-2.5 text-sm text-foreground" />
            <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm"><Share2 className="h-4 w-4" /> Share</button>
          </div>

          {isVideo ? (
            <div className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
              <p className="text-xs uppercase tracking-widest text-gold mb-3">Video player</p>
              {playbackUrl ? (
                <video
                  controls
                  poster={item.image}
                  className="aspect-video w-full rounded-lg bg-background/60"
                  src={playbackUrl}
                  onLoadedMetadata={(event) => applySavedProgress(event.currentTarget)}
                  onPlay={() => setPlaying(true)}
                  onPause={(event) => {
                    setPlaying(false);
                    writeProgress(event.currentTarget);
                  }}
                  onTimeUpdate={(event) => writeProgress(event.currentTarget)}
                  onEnded={(event) => writeProgress(event.currentTarget, true)}
                />
              ) : (
                <PlayerUnavailable isLoading={playbackQuery.isLoading} isError={playbackQuery.isError} premiumDenied={premiumDenied} />
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
              {playbackUrl ? (
                <audio
                  controls
                  className="w-full"
                  src={playbackUrl}
                  onLoadedMetadata={(event) => applySavedProgress(event.currentTarget)}
                  onPlay={() => setPlaying(true)}
                  onPause={(event) => {
                    setPlaying(false);
                    writeProgress(event.currentTarget);
                  }}
                  onTimeUpdate={(event) => writeProgress(event.currentTarget)}
                  onEnded={(event) => writeProgress(event.currentTarget, true)}
                />
              ) : (
                <>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>0:00</span>
                    <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="absolute inset-y-0 left-0 w-1/4 bg-gold-gradient" />
                    </div>
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <button type="button" className="text-muted-foreground">-15s</button>
                    <button type="button" onClick={() => setPlaying(!playing)} className="h-12 w-12 rounded-full bg-gold-gradient text-primary-foreground inline-flex items-center justify-center">
                      {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                    </button>
                    <button type="button" className="text-muted-foreground">+15s</button>
                  </div>
                  <PlayerUnavailable isLoading={playbackQuery.isLoading} isError={playbackQuery.isError} premiumDenied={premiumDenied} />
                </>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
            <p className="text-xs uppercase tracking-widest text-gold">About this creator</p>
            <p className="mt-3 font-display text-xl">{item.creator}</p>
            <p className="mt-2 text-sm text-muted-foreground">Trusted creator in the NoraPlus collective.</p>
            {item.creatorId && <Link to={`/app/creators/${item.creatorId}`} className="mt-4 inline-block text-sm text-gold hover:underline">View profile</Link>}
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl md:text-3xl">More like this</h2>
        {relatedQuery.isLoading && related.length === 0 ? (
          <RelatedSkeleton />
        ) : related.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {related.map((content) => <ContentCard key={content.id} item={content} size="sm" />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            Related content will appear here as the catalog grows.
          </div>
        )}
      </section>
    </div>
  );
};

const PlayerUnavailable = ({
  isLoading,
  isError,
  premiumDenied,
}: {
  isLoading: boolean;
  isError: boolean;
  premiumDenied: boolean;
}) => (
  <div className="mt-4 text-center text-xs text-muted-foreground">
    <p>
      {isLoading
        ? "Preparing playback..."
        : premiumDenied
          ? "A premium subscription is required to play this content."
          : isError
            ? "Playback is not available for this item right now."
            : "Playback media is not available yet."}
    </p>
    {premiumDenied && <Link to="/plans" className="mt-3 inline-flex text-gold hover:underline">View plans</Link>}
  </div>
);

const DetailSkeleton = () => (
  <div className="space-y-8">
    <div className="h-[420px] animate-pulse rounded-2xl bg-secondary/50 ring-1 ring-border/60" />
    <div className="h-48 animate-pulse rounded-2xl bg-secondary/50 ring-1 ring-border/60" />
  </div>
);

const RelatedSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="h-64 animate-pulse rounded-xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

export default ContentDetail;
