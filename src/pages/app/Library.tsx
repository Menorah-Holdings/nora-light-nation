import { useState } from "react";
import { ContentCard } from "@/components/ContentCard";
import { cn } from "@/lib/utils";
import { adaptContent } from "@/lib/api/adapters";
import { useLibrary } from "@/lib/api/hooks/useLibrary";

const tabs = ["Saved", "Continue", "Playlists", "Recently played", "Following"] as const;

const Library = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Saved");
  const libraryQuery = useLibrary();
  const savedItems = (libraryQuery.data?.saved ?? []).map((entry) => adaptContent(entry.content));
  const continueItems = (libraryQuery.data?.inProgress ?? [])
    .filter((entry) => entry.content)
    .map((entry) => adaptContent(entry.content!));

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
          <button key={t} type="button" onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}>{t}</button>
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
        <DeferredPanel title="Playlists are not backed by the API yet" message="Saved content is real now. Persistent playlists remain tracked as backend gap LIB-003." />
      ) : (
        <DeferredPanel title="Following list is not backed by the API yet" message="Creator follow actions are available, but the API does not yet expose a current user's following list." />
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
      {items.map((item) => <ContentCard key={item.id} item={item} />)}
    </div>
  );
};

const DeferredPanel = ({ title, message }: { title: string; message: string }) => (
  <div className="rounded-2xl border border-dashed border-border p-12 text-center">
    <p className="font-display text-xl">{title}</p>
    <p className="mt-2 text-sm text-muted-foreground">{message}</p>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-80 animate-pulse rounded-xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

export default Library;
