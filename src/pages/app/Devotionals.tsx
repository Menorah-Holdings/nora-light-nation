import { Link } from "react-router-dom";
import { ContentCard } from "@/components/ContentCard";
import { adaptContent } from "@/lib/api/adapters";
import { useContentList } from "@/lib/api/hooks/useContent";

const Devotionals = () => {
  const contentQuery = useContentList({ type: "DEVOTIONAL", limit: 50 });
  const items = (contentQuery.data ?? []).map(adaptContent);
  const featured = items[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Daily</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Devotionals</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Begin and end your day anchored in scripture and prayer.</p>
      </div>

      {contentQuery.isError && (
        <div className="rounded-2xl border border-gold/30 bg-card-gradient p-4 text-sm text-muted-foreground">
          Devotionals could not refresh. Try again in a moment.
        </div>
      )}

      {contentQuery.isLoading && items.length === 0 ? (
        <div className="h-72 animate-pulse rounded-3xl bg-secondary/50 ring-1 ring-border/60" />
      ) : featured ? (
        <div className="rounded-3xl bg-card-gradient ring-1 ring-gold/20 shadow-elegant p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Today</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl max-w-xl">{featured.title}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl">{featured.description || `A reflection by ${featured.creator}.`}</p>
          <Link
            to={`/app/content/${featured.id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"
          >
            Listen now
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border p-8 md:p-12 text-sm text-muted-foreground">
          Devotionals will appear here as creators publish them.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          <ContentCard key={item.id} item={item} queue={items} />
        ))}
      </div>
    </div>
  );
};

export default Devotionals;
