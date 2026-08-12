import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trash2, ListVideo } from "lucide-react";
import { ContentCard } from "@/components/ContentCard";
import { cn } from "@/lib/utils";
import { adaptContent } from "@/lib/api/adapters";
import { useLibrary } from "@/lib/api/hooks/useLibrary";
import { usePlaylists, useDeletePlaylist, useRemoveFromPlaylist } from "@/lib/api/hooks/usePlaylists";
import { toast } from "sonner";
import type { ApiPlaylist } from "@/lib/api/types";

const tabs = ["Saved", "Continue", "Playlists", "Recently played", "Following"] as const;

function isLibraryTab(value: string | null): value is (typeof tabs)[number] {
  return Boolean(value && tabs.includes(value as (typeof tabs)[number]));
}

const Library = () => {
  const [searchParams] = useSearchParams();
  const initialTab = useMemo<(typeof tabs)[number]>(() => {
    const fromQuery = searchParams.get("tab");
    return isLibraryTab(fromQuery) ? fromQuery : "Saved";
  }, [searchParams]);
  const [tab, setTab] = useState<(typeof tabs)[number]>(initialTab);
  const [activePlaylist, setActivePlaylist] = useState<ApiPlaylist | null>(null);
  const libraryQuery = useLibrary();
  const playlistsQuery = usePlaylists();
  const deletePlaylist = useDeletePlaylist();
  const removeFromPlaylist = useRemoveFromPlaylist();
  const savedItems = (libraryQuery.data?.saved ?? []).map((entry) => adaptContent(entry.content));
  const continueItems = (libraryQuery.data?.inProgress ?? []).filter((entry) => entry.content).map((entry) => adaptContent(entry.content!));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Your space</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Library</h1>
      </div>

      {libraryQuery.isError && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Your library could not refresh. Try again in a moment.
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-y border-border py-4">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {libraryQuery.isLoading ? (
        <GridSkeleton />
      ) : tab === "Saved" ? (
        <ContentGrid items={savedItems} empty="Saved content will appear here." />
      ) : tab === "Continue" ? (
        <ContentGrid items={continueItems} empty="Start listening or watching, and progress will appear here." />
      ) : tab === "Recently played" ? (
        <ContentGrid items={continueItems} empty="Recently played history will appear here once playback history is available." />
      ) : tab === "Playlists" ? (
        activePlaylist ? (
          <PlaylistDetail
            playlist={activePlaylist}
            onBack={() => setActivePlaylist(null)}
            onRemoveItem={(contentId) =>
              removeFromPlaylist.mutate(
                { playlistId: activePlaylist.id, contentId },
                {
                  onSuccess: () => {
                    toast.success("Removed from playlist");
                    playlistsQuery.refetch().then((res) => {
                      const updated = res.data?.find((p) => p.id === activePlaylist.id);
                      if (updated) setActivePlaylist(updated);
                      else setActivePlaylist(null);
                    });
                  },
                },
              )
            }
          />
        ) : (
          <PlaylistsGrid
            playlists={playlistsQuery.data ?? []}
            isLoading={playlistsQuery.isLoading}
            onOpen={setActivePlaylist}
            onDelete={(id) =>
              deletePlaylist.mutate(id, {
                onSuccess: () => toast.success("Playlist deleted"),
                onError: () => toast.error("Could not delete playlist"),
              })
            }
          />
        )
      ) : (
        <DeferredPanel
          title="Following list is not backed by the API yet"
          message="Creator follow actions are available, but the API does not yet expose a current user's following list."
        />
      )}
    </div>
  );
};

const ContentGrid = ({ items, empty }: { items: ReturnType<typeof adaptContent>[]; empty: string }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-display text-xl">Nothing here yet</p>
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} queue={items} />
      ))}
    </div>
  );
};

const PlaylistsGrid = ({
  playlists,
  isLoading,
  onOpen,
  onDelete,
}: {
  playlists: ApiPlaylist[];
  isLoading: boolean;
  onOpen: (p: ApiPlaylist) => void;
  onDelete: (id: string) => void;
}) => {
  if (isLoading) return <GridSkeleton />;
  if (playlists.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-display text-xl">No playlists yet</p>
        <p className="mt-2 text-sm text-muted-foreground">Tap "Add to Playlist" on any content to create your first playlist.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {playlists.map((p) => (
        <div key={p.id} className="group relative rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
          <button className="w-full text-left p-5" onClick={() => onOpen(p)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60">
                <ListVideo className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="font-display truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.items.length} {p.items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            {p.items.length > 0 && (
              <div className="flex gap-1.5">
                {p.items
                  .slice(0, 3)
                  .map((item) =>
                    item.content.thumbnailUrl ? (
                      <img key={item.id} src={item.content.thumbnailUrl} alt="" className="h-12 w-12 rounded-lg object-cover ring-1 ring-border/40" />
                    ) : (
                      <div key={item.id} className="h-12 w-12 rounded-lg bg-secondary/60 ring-1 ring-border/40" />
                    ),
                  )}
              </div>
            )}
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-all"
            aria-label="Delete playlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const PlaylistDetail = ({
  playlist,
  onBack,
  onRemoveItem,
}: {
  playlist: ApiPlaylist;
  onBack: () => void;
  onRemoveItem: (contentId: string) => void;
}) => {
  const playlistItems = playlist.items.map((entry) => adaptContent(entry.content));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gold hover:underline">
          ← All Playlists
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{playlist.name}</span>
      </div>
      {playlist.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-xl">Empty playlist</p>
          <p className="mt-2 text-sm text-muted-foreground">Add content using the "Add to Playlist" option on any content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {playlist.items.map((entry) => (
            <div key={entry.id} className="group relative">
              <ContentCard item={adaptContent(entry.content)} queue={playlistItems} />
              <button
                onClick={() => onRemoveItem(entry.contentId)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-lg bg-background/80 p-1.5 text-muted-foreground hover:text-destructive transition-all"
                aria-label="Remove from playlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-80 animate-pulse rounded-xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

export default Library;
