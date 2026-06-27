import { useParams, Link } from "react-router-dom";
import { getContentById, content } from "@/lib/mockData";
import { Play, Bookmark, Share2, Pause } from "lucide-react";
import { useState } from "react";
import { ContentCard } from "@/components/ContentCard";
import { NowPlayingMenu } from "@/components/NowPlayingMenu";

const ContentDetail = () => {
  const { id } = useParams();
  const item = getContentById(id || "1");
  const [playing, setPlaying] = useState(false);
  if (!item) return <p>Not found. <Link to="/app" className="text-gold">Back</Link></p>;
  const related = content.filter(c => c.id !== item.id).slice(0, 6);
  const isVideo = item.medium === "video";

  return (
    <div className="space-y-12">
      <div className="relative -mx-4 md:-mx-8 -mt-8 overflow-hidden">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <button onClick={() => setPlaying(!playing)} className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-red-gradient text-primary-foreground shadow-red-glow inline-flex items-center justify-center hover:scale-105 transition">
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
            <p className="text-xs uppercase tracking-[0.25em] text-gold">{item.type} · {item.duration}</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{item.title}</h1>
            <Link to={`/app/creators/${item.creatorId}`} className="mt-2 inline-block text-sm text-muted-foreground hover:text-gold">by {item.creator}</Link>
          </div>
          <p className="text-foreground/85 leading-relaxed">{item.description} A deeper exploration anchored in scripture, recorded with the spiritual care and production quality the NoraPlus community trusts.</p>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"><Play className="h-4 w-4 fill-current" /> Play</button>
            <button className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm"><Bookmark className="h-4 w-4" /> Save</button>
            <button className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm"><Share2 className="h-4 w-4" /> Share</button>
          </div>

          {/* Audio / Video player mock */}
          {isVideo ? (
            <div className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
              <p className="text-xs uppercase tracking-widest text-gold mb-3">Video player</p>
              <div className="aspect-video rounded-lg bg-background/60 grid place-items-center text-muted-foreground text-sm">
                Player preview
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span>2:14</span>
                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="absolute inset-y-0 left-0 w-1/4 bg-gold-gradient" />
                </div>
                <span>{item.duration}</span>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button className="text-muted-foreground">−15s</button>
                <button onClick={() => setPlaying(!playing)} className="h-12 w-12 rounded-full bg-gold-gradient text-primary-foreground inline-flex items-center justify-center">
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                </button>
                <button className="text-muted-foreground">+15s</button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
            <p className="text-xs uppercase tracking-widest text-gold">About this creator</p>
            <p className="mt-3 font-display text-xl">{item.creator}</p>
            <p className="mt-2 text-sm text-muted-foreground">Trusted creator in the NoraPlus collective.</p>
            <Link to={`/app/creators/${item.creatorId}`} className="mt-4 inline-block text-sm text-gold hover:underline">View profile →</Link>
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl md:text-3xl">More like this</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {related.map(c => <ContentCard key={c.id} item={c} size="sm" />)}
        </div>
      </section>
    </div>
  );
};

export default ContentDetail;
