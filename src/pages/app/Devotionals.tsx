import { content } from "@/lib/mockData";
import { ContentCard } from "@/components/ContentCard";

const Devotionals = () => {
  const items = content.filter(c => c.type === "devotional");
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Daily</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Devotionals</h1>
        <p className="mt-2 text-muted-foreground max-w-lg">Begin and end your day anchored in scripture and prayer.</p>
      </div>
      <div className="rounded-3xl bg-card-gradient ring-1 ring-gold/20 shadow-elegant p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Today · June 1</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl max-w-xl">Be still, and know that I am God.</h2>
        <p className="mt-3 text-muted-foreground max-w-xl">A 6-minute reflection by Grace Iweka on stillness in a restless world.</p>
        <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow">Listen now</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.concat(items).map((i, idx) => <ContentCard key={i.id + idx} item={i} />)}
      </div>
    </div>
  );
};

export default Devotionals;
