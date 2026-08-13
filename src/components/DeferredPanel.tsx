import { Sparkles } from "lucide-react";

export const DeferredPanel = ({ title, message }: { title: string; message: string }) => (
  <div className="space-y-6">
    <div>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
    <div
      className="rounded-2xl border border-border/60 p-10 text-center text-sm text-muted-foreground"
      style={{ background: "linear-gradient(160deg, hsl(350 25% 10%), hsl(350 20% 6%))" }}
    >
      <Sparkles className="mx-auto h-6 w-6 text-gold" />
      <p className="mt-3 text-foreground">Deferred for this launch window.</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Existing controls in Account Settings are live. Expanded notification/privacy workflows are scheduled post-launch.
      </p>
    </div>
  </div>
);

export default DeferredPanel;
