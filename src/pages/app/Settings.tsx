import { useState } from "react";
import { Download, HardDrive, Trash2, Wifi, Sparkles, User, Bell, Shield, Globe } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type TabId = "profile" | "downloads" | "notifications" | "privacy";

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "downloads", label: "Download Settings", icon: Download },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
];

const SettingRow = ({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <div className="min-w-0 flex-1">
      <p className="font-display text-sm text-foreground">{title}</p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const DownloadSettings = () => {
  const [quality, setQuality] = useState("high");
  const [mobileData, setMobileData] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [removeWatched, setRemoveWatched] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [storage, setStorage] = useState({ audio: 0.9, video: 1.3, other: 0.2, total: 10 });

  const used = storage.audio + storage.video + storage.other;
  const pct = Math.min(100, (used / storage.total) * 100);

  const clearAll = () => {
    setStorage((s) => ({ ...s, audio: 0, video: 0, other: 0 }));
    setConfirmOpen(false);
    toast({ title: "Downloads cleared", description: "All offline content has been removed from this device." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Download Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage how Nora saves content for offline access.</p>
      </div>

      {/* Preferences card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-gold/20 shadow-elegant"
        style={{ background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))" }}
      >
        <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
        <div className="relative divide-y divide-border/50 px-5 sm:px-6">
          <SettingRow title="Download Quality" helper="Higher quality uses more storage.">
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="w-[180px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="best">Best</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow title="Download Using Mobile Data" helper="Keep this off to download only on Wi-Fi.">
            <Switch checked={mobileData} onCheckedChange={setMobileData} />
          </SettingRow>

          <SettingRow
            title="Auto-Download New Episodes"
            helper="Automatically download new episodes from saved podcasts, series, or devotionals."
          >
            <Switch checked={autoDownload} onCheckedChange={setAutoDownload} />
          </SettingRow>

          <SettingRow
            title="Remove Watched Downloads"
            helper="Automatically remove completed downloads to save storage."
          >
            <Switch checked={removeWatched} onCheckedChange={setRemoveWatched} />
          </SettingRow>
        </div>
      </div>

      {/* Storage card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-gold/20 p-5 sm:p-6 shadow-elegant"
        style={{ background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))" }}
      >
        <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-gold" />
            <h3 className="font-display text-sm text-foreground">Storage Usage</h3>
          </div>
          <p className="mt-3 text-2xl font-display">
            <span className="text-gold">{used.toFixed(1)}GB</span>
            <span className="text-muted-foreground text-base"> used of {storage.total}GB</span>
          </p>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary/60 ring-1 ring-border/60">
            <div className="flex h-full">
              <div
                className="h-full bg-red-gradient"
                style={{ width: `${(storage.video / storage.total) * 100}%` }}
              />
              <div
                className="h-full bg-gold-gradient"
                style={{ width: `${(storage.audio / storage.total) * 100}%` }}
              />
              <div
                className="h-full bg-muted-foreground/50"
                style={{ width: `${(storage.other / storage.total) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-gradient" />
              <span className="text-muted-foreground">Video</span>
              <span className="text-foreground/80">{storage.video.toFixed(1)}GB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gold-gradient" />
              <span className="text-muted-foreground">Audio</span>
              <span className="text-foreground/80">{storage.audio.toFixed(1)}GB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
              <span className="text-muted-foreground">Other</span>
              <span className="text-foreground/80">{storage.other.toFixed(1)}GB</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Clearing downloads removes offline files only. You can download them again anytime.
            </p>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={used === 0}
              className="border-red/40 bg-transparent text-red hover:bg-red/10 hover:text-red"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Downloads
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="border-gold/30"
          style={{ background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))" }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Clear all downloads?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will remove all downloaded content from this device. You can download them again anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={clearAll} className="bg-red-gradient text-primary-foreground hover:opacity-90">
              Clear Downloads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Placeholder = ({ title, message }: { title: string; message: string }) => (
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
      <p className="mt-3">Coming soon.</p>
    </div>
  </div>
);

const Settings = () => {
  const [tab, setTab] = useState<TabId>("downloads");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Profile & Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your Nora account, preferences, and downloads.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-red/15 text-foreground ring-1 ring-gold/30"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-gold" : "")} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section>
          {tab === "downloads" && <DownloadSettings />}
          {tab === "profile" && (
            <Placeholder title="Profile" message="Manage your account details and preferences." />
          )}
          {tab === "notifications" && (
            <Placeholder title="Notifications" message="Control how and when Nora reaches you." />
          )}
          {tab === "privacy" && (
            <Placeholder title="Privacy" message="Manage data, security, and permissions." />
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
