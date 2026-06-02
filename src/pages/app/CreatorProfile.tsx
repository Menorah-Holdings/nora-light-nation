import { useParams, Link } from "react-router-dom";
import { getCreatorById, contentByCreator } from "@/lib/mockData";
import { BadgeCheck, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ContentCard } from "@/components/ContentCard";

const tabs = ["Messages", "Music", "Videos", "Live Events"] as const;

const CreatorProfile = () => {
  const { id } = useParams();
  const creator = getCreatorById(id || "");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Messages");
  if (!creator) return <p className="text-muted-foreground">Creator not found. <Link to="/app/creators" className="text-gold">Back</Link></p>;
  const items = contentByCreator(creator.id);

  return (
    <div className="space-y-10">
      <div className="relative -mx-4 md:-mx-8 -mt-8">
        <div className="h-56 md:h-72 relative overflow-hidden">
          <img src={creator.image} alt="" className="h-full w-full object-cover blur-sm scale-105 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="px-4 md:px-8 -mt-16 relative flex flex-col md:flex-row md:items-end gap-6">
          <img src={creator.image} alt="" className="h-32 w-32 rounded-2xl object-cover ring-4 ring-background shadow-card-soft" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl md:text-4xl">{creator.name}</h1>
              {creator.verified && <BadgeCheck className="h-6 w-6 text-gold" />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{creator.category} · {creator.followers} followers</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow">
            <Plus className="h-4 w-4" /> Follow
          </button>
        </div>
      </div>

      <p className="max-w-2xl text-muted-foreground">
        Trusted voice in the Nora collective, sharing teaching, worship and stories that anchor faith and ignite kingdom living across the nations.
      </p>

      {/* Analytics teaser */}
      <div className="grid grid-cols-3 gap-3 max-w-2xl">
        {[
          { label: "Total plays", value: creator.plays },
          { label: "Followers", value: creator.followers },
          { label: "Avg. engagement", value: "8.4%" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card-gradient p-4 ring-1 ring-border/60">
            <p className="font-display text-2xl">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-y border-border py-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm transition-colors",
            tab === t ? "bg-red-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map(i => <ContentCard key={i.id} item={i} />)}
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

export default CreatorProfile;
