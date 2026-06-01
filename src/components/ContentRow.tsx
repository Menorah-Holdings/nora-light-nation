import type { ContentItem } from "@/lib/mockData";
import { ContentCard } from "./ContentCard";
import { ChevronRight } from "lucide-react";

export const ContentRow = ({ title, items, subtitle }: { title: string; items: ContentItem[]; subtitle?: string }) => (
  <section className="space-y-4">
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <button className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition-colors">
        View all <ChevronRight className="h-4 w-4" />
      </button>
    </div>
    <div className="flex gap-5 overflow-x-auto pb-2 snap-x scrollbar-none -mx-6 px-6">
      {items.map((item) => <ContentCard key={item.id} item={item} />)}
    </div>
  </section>
);
