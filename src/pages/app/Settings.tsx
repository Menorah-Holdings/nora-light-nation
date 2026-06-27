import { useState } from "react";
import { Download, HardDrive, Trash2, Wifi, Sparkles, User, Bell, Shield, Globe, LifeBuoy, ShieldCheck } from "lucide-react";
import HelpSupport from "@/components/HelpSupport";
import AccountSettings from "@/components/AccountSettings";
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
import { useUser, CreatorStatus, MOCK_USERS } from "@/lib/user";
import { CreatorStatusBadge } from "@/components/CreatorStatusBadge";

type TabId = "profile" | "account" | "downloads" | "language" | "notifications" | "privacy" | "help";

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account Settings", icon: ShieldCheck },
  { id: "downloads", label: "Download Settings", icon: Download },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "help", label: "Help & Support", icon: LifeBuoy },
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

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "sw", label: "Kiswahili" },
  { value: "ar", label: "عربي (Arabic)" },
  { value: "hi", label: "हिन्दी (Hindi)" },
];

const REGIONS: { value: string; label: string; tz: string }[] = [
  { value: "NG", label: "Nigeria", tz: "Africa/Lagos (GMT+1)" },
  { value: "GH", label: "Ghana", tz: "Africa/Accra (GMT+0)" },
  { value: "KE", label: "Kenya", tz: "Africa/Nairobi (GMT+3)" },
  { value: "ZA", label: "South Africa", tz: "Africa/Johannesburg (GMT+2)" },
  { value: "US", label: "United States", tz: "America/New_York (GMT-5)" },
  { value: "CA", label: "Canada", tz: "America/Toronto (GMT-5)" },
  { value: "GB", label: "United Kingdom", tz: "Europe/London (GMT+0)" },
  { value: "BR", label: "Brazil", tz: "America/Sao_Paulo (GMT-3)" },
  { value: "IN", label: "India", tz: "Asia/Kolkata (GMT+5:30)" },
];

const SUBTITLES = ["English", "French", "Spanish", "Arabic", "Portuguese", "None"];

const LanguageRegionSettings = () => {
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("NG");
  const [tzOverride, setTzOverride] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState("original");
  const [subtitle, setSubtitle] = useState("English");
  const [timeFormat, setTimeFormat] = useState("12");
  const [contentPref, setContentPref] = useState("local-global");

  const detectedTz = REGIONS.find((r) => r.value === region)?.tz ?? "";
  const timeZone = tzOverride ?? detectedTz;

  const save = () => {
    toast({
      title: "Preferences saved",
      description: "Your Language & Region preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Language & Region</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize Nora with your preferred language, country, and regional experience.
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-gold/20 shadow-elegant"
        style={{ background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))" }}
      >
        <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
        <div className="relative divide-y divide-border/50 px-5 sm:px-6">
          <SettingRow
            title="Preferred Language"
            helper="This changes the language used throughout the Nora interface where translations are available."
          >
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[220px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            title="Region"
            helper="Your region helps personalize featured content, live event times, and recommendations."
          >
            <Select
              value={region}
              onValueChange={(v) => {
                setRegion(v);
                setTzOverride(null);
              }}
            >
              <SelectTrigger className="w-[220px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            title="Time Zone"
            helper="Detected from your region. You can override it manually."
          >
            <Select value={timeZone} onValueChange={(v) => setTzOverride(v)}>
              <SelectTrigger className="w-[260px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r.tz} value={r.tz}>{r.tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <div className="py-5">
            <p className="font-display text-sm text-foreground">Display Language for Content</p>
            <RadioGroup value={displayMode} onValueChange={setDisplayMode} className="mt-3 space-y-2">
              {[
                { v: "original", l: "Original Language" },
                { v: "dubbed", l: "Prefer Dubbed Content" },
                { v: "subtitles", l: "Prefer Subtitles" },
              ].map((o) => (
                <div key={o.v} className="flex items-center gap-3">
                  <RadioGroupItem id={`dm-${o.v}`} value={o.v} className="border-border text-gold focus:ring-gold" />
                  <Label htmlFor={`dm-${o.v}`} className="text-sm text-foreground/90 cursor-pointer">{o.l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <SettingRow title="Subtitle Language" helper="Used when subtitles are available.">
            <Select value={subtitle} onValueChange={setSubtitle}>
              <SelectTrigger className="w-[200px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBTITLES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow title="Date & Time Format" helper="Choose how times appear across Nora.">
            <Select value={timeFormat} onValueChange={setTimeFormat}>
              <SelectTrigger className="w-[200px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12-hour clock</SelectItem>
                <SelectItem value="24">24-hour clock</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <div className="py-5">
            <p className="font-display text-sm text-foreground">Content Region Preference</p>
            <p className="mt-1 text-xs text-muted-foreground">Choose how Nora prioritizes recommendations.</p>
            <RadioGroup value={contentPref} onValueChange={setContentPref} className="mt-3 space-y-2">
              {[
                { v: "global", l: "Global Content" },
                { v: "local-global", l: "Local + Global Content" },
                { v: "local", l: "Local Content First" },
              ].map((o) => (
                <div key={o.v} className="flex items-center gap-3">
                  <RadioGroupItem id={`cp-${o.v}`} value={o.v} className="border-border text-gold focus:ring-gold" />
                  <Label htmlFor={`cp-${o.v}`} className="text-sm text-foreground/90 cursor-pointer">{o.l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow transition-shadow">
          Save Preferences
        </Button>
      </div>
    </div>
  );
};



const ProfileSettings = () => {
  const { user, users, setActiveUserId, setCreatorStatus } = useUser();
  const statuses: CreatorStatus[] = ["Not Applied", "Under Review", "Approved", "Rejected"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your Nora identity and creator status.</p>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-gold/20 p-6 shadow-elegant"
        style={{ background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))" }}
      >
        <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
        <div className="relative flex items-start gap-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gold-gradient text-xl font-semibold text-primary-foreground ring-1 ring-gold/40">
            {user.avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-display text-2xl truncate">{user.name}</p>
            </div>
            <div className="mt-2"><CreatorStatusBadge status={user.creator_status} /></div>
            <p className="mt-3 text-xs text-muted-foreground">@{user.handle} · {user.email}</p>
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-gold/20 p-5 sm:p-6 shadow-elegant"
        style={{ background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))" }}
      >
        <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
        <div className="relative space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <h3 className="font-display text-sm text-foreground">Prototype Controls</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Switch between mock users to preview each creator state across the app.
          </p>

          <SettingRow title="Active Mock User" helper="Each user has its own creator_status.">
            <Select value={user.id} onValueChange={setActiveUserId}>
              <SelectTrigger className="w-[240px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow title="Creator Status" helper="Override creator_status for the active user.">
            <Select value={user.creator_status} onValueChange={(v) => setCreatorStatus(v as CreatorStatus)}>
              <SelectTrigger className="w-[240px] border-border bg-secondary/60 focus:ring-1 focus:ring-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </div>
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
  const [tab, setTab] = useState<TabId>("profile");

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
          {tab === "language" && <LanguageRegionSettings />}
          {tab === "profile" && <ProfileSettings />}
          {tab === "notifications" && (
            <Placeholder title="Notifications" message="Control how and when Nora reaches you." />
          )}
          {tab === "privacy" && (
            <Placeholder title="Privacy" message="Manage data, security, and permissions." />
          )}
          {tab === "help" && <HelpSupport />}
        </section>
      </div>
    </div>
  );
};

export default Settings;
