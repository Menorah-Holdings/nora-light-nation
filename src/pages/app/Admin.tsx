import { content } from "@/lib/mockData";
import { Upload, Headphones, Play, Radio, Inbox, ArrowUpRight, MoreHorizontal } from "lucide-react";

const stats = [
  { label: "Total plays", value: "1.24M", trend: "+12.4%" },
  { label: "Watch time", value: "84,210 hr", trend: "+8.2%" },
  { label: "Active users", value: "42,890", trend: "+5.1%" },
  { label: "Event registrations", value: "12,406", trend: "+24%" },
];

const quick = [
  { label: "Upload Content", icon: Upload },
  { label: "Manage Audio", icon: Headphones },
  { label: "Manage Video", icon: Play },
  { label: "Manage Live Events", icon: Radio },
  { label: "Partner Applications", icon: Inbox },
];

const Admin = () => (
  <div className="space-y-10">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Studio</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your content, partners, and live events.</p>
      </div>
      <button className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"><Upload className="h-4 w-4" /> Upload Content</button>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(s => (
        <div key={s.label} className="rounded-2xl bg-card-gradient p-6 ring-1 ring-border/60">
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className="mt-3 font-display text-3xl">{s.value}</p>
          <p className="mt-1 text-xs text-gold inline-flex items-center gap-1">{s.trend} <ArrowUpRight className="h-3 w-3" /></p>
        </div>
      ))}
    </div>

    <div className="grid gap-3 md:grid-cols-5">
      {quick.map(q => (
        <button key={q.label} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 text-left text-sm hover:border-gold/40">
          <q.icon className="h-4 w-4 text-gold" /> {q.label}
        </button>
      ))}
    </div>

    <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="font-display text-lg">Content library</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
            <tr>
              <th className="px-6 py-3 font-normal">Title</th>
              <th className="px-6 py-3 font-normal">Type</th>
              <th className="px-6 py-3 font-normal">Creator</th>
              <th className="px-6 py-3 font-normal">Status</th>
              <th className="px-6 py-3 font-normal">Uploaded</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {content.slice(0, 8).map((c, i) => (
              <tr key={c.id} className="border-t border-border/60 hover:bg-background/40">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={c.image} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="font-medium">{c.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground capitalize">{c.type.replace("-", " ")}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.creator}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${i % 3 === 0 ? "bg-gold/15 text-gold ring-1 ring-gold/30" : "bg-muted text-muted-foreground"}`}>
                    {i % 3 === 0 ? "Published" : i % 3 === 1 ? "Review" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">May {10 + i}, 2026</td>
                <td className="px-6 py-4 text-right"><MoreHorizontal className="h-4 w-4 text-muted-foreground inline" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Admin;
