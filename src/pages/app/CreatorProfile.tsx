import { useParams, Link } from "react-router-dom";
import { BadgeCheck, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ContentCard } from "@/components/ContentCard";
import { toast } from "sonner";
import { adaptContent, adaptCreator, adaptLiveEvent } from "@/lib/api/adapters";
import { useCreatorContent, useCreatorDetail, useFollowCreator, useUnfollowCreator } from "@/lib/api/hooks/useCreators";
import { useLiveEvents } from "@/lib/api/hooks/useLive";
import type { ContentItem } from "@/lib/mockData";

const tabs = ["Messages", "Music", "Videos", "Live Events"] as const;

const CreatorProfile = () => {
  const { id } = useParams();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Messages");
  const creatorQuery = useCreatorDetail(id);
  const contentQuery = useCreatorContent(id, { limit: 50 });
  const liveQuery = useLiveEvents({ limit: 50 });
  const followMutation = useFollowCreator();
  const unfollowMutation = useUnfollowCreator();
  const creator = creatorQuery.data ? adaptCreator(creatorQuery.data) : null;
  const followed = creatorQuery.data?.isFollowing === true;

  const contentItems = useMemo(() => {
    if (!creator) return [];
    return (contentQuery.data ?? []).map((item) => ({
      ...adaptContent(item),
      creator: creator.name,
      creatorId: creator.id,
    }));
  }, [contentQuery.data, creator]);

  const liveEvents = useMemo(() => {
    if (!creator) return [];
    return (liveQuery.data ?? []).filter((event) => event.creator?.id === creator.id).map(adaptLiveEvent);
  }, [creator, liveQuery.data]);

  const filteredItems = filterCreatorContent(contentItems, tab);

  if (creatorQuery.isLoading && !creator) {
    return <ProfileSkeleton />;
  }

  if (!creator) {
    return (
      <p className="text-muted-foreground">
        Creator not found.{" "}
        <Link to="/app/creators" className="text-gold">
          Back
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {(creatorQuery.isError || contentQuery.isError || liveQuery.isError) && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Some creator details could not refresh. Showing available profile data.
        </div>
      )}

      <div className="relative -mx-4 md:-mx-8 -mt-8">
        <div className="h-56 md:h-72 relative overflow-hidden">
          <img src={creator.banner || creator.image} alt="" className="h-full w-full object-cover blur-sm scale-105 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="px-4 md:px-8 -mt-16 relative flex flex-col md:flex-row md:items-end gap-6">
          <img src={creator.image} alt="" className="h-32 w-32 rounded-2xl object-cover ring-4 ring-background shadow-card-soft" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl md:text-4xl">{creator.name}</h1>
              {creator.verified && <BadgeCheck className="h-6 w-6 text-gold" />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {creator.category} - {creator.followers} followers
            </p>
          </div>
          <button
            type="button"
            disabled={followMutation.isPending || unfollowMutation.isPending}
            onClick={() => {
              const mutation = followed ? unfollowMutation : followMutation;
              mutation.mutate(creator.id, {
                onSuccess: () => {
                  toast.success(followed ? `Unfollowed ${creator.name}` : `Following ${creator.name}`);
                  void creatorQuery.refetch();
                },
                onError: (error) => {
                  toast.error(error instanceof Error ? error.message : `Could not ${followed ? "unfollow" : "follow"} creator`);
                },
              });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {followed ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      <p className="max-w-2xl text-muted-foreground">
        {creator.bio || "Trusted voice in the NoraPlus collective, sharing teaching, worship, and stories that anchor faith across the nations."}
      </p>

      <div className="grid grid-cols-3 gap-3 max-w-2xl">
        {[
          { label: "Total plays", value: creator.plays },
          { label: "Followers", value: creator.followers },
          { label: "Published", value: String(contentItems.length) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card-gradient p-4 ring-1 ring-border/60">
            <p className="font-display text-2xl">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

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

      {tab === "Live Events" ? (
        <LiveEventsGrid events={liveEvents} isLoading={liveQuery.isLoading} />
      ) : contentQuery.isLoading && filteredItems.length === 0 ? (
        <ContentGridSkeleton />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <ContentCard key={item.id} item={item} queue={filteredItems} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-xl">No content yet in this tab</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon as this creator publishes more.</p>
        </div>
      )}
    </div>
  );
};

function filterCreatorContent(items: ContentItem[], tab: (typeof tabs)[number]): ContentItem[] {
  if (tab === "Messages") return items.filter((item) => item.type === "message");
  if (tab === "Music") return items.filter((item) => item.type === "music" || item.type === "music-video");
  if (tab === "Videos") return items.filter((item) => item.medium === "video");
  return [];
}

const LiveEventsGrid = ({ events, isLoading }: { events: ReturnType<typeof adaptLiveEvent>[]; isLoading: boolean }) => {
  if (isLoading && events.length === 0) {
    return <ContentGridSkeleton />;
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-display text-xl">No live events yet</p>
        <p className="mt-2 text-sm text-muted-foreground">Live events hosted by this creator will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {events.map((event) => (
        <div key={event.id} className="overflow-hidden rounded-2xl bg-card-gradient ring-1 ring-border/60">
          <div className="relative aspect-video overflow-hidden">
            <img src={event.image} alt="" className="h-full w-full object-cover" />
            {event.status === "live" && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-destructive/90 px-2.5 py-1 text-[10px] uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-background animate-pulse-soft" /> Live
              </span>
            )}
          </div>
          <div className="p-5">
            <p className="text-[10px] uppercase tracking-widest text-gold">
              {event.date} - {event.time}
            </p>
            <h3 className="mt-2 font-display text-lg">{event.title}</h3>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {event.viewerCount.toLocaleString()} viewers
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="h-72 animate-pulse rounded-2xl bg-secondary/50 ring-1 ring-border/60" />
    <ContentGridSkeleton />
  </div>
);

const ContentGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="h-80 animate-pulse rounded-xl bg-secondary/50 ring-1 ring-border/60" />
    ))}
  </div>
);

export default CreatorProfile;
