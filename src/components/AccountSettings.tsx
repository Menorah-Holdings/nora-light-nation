import { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Monitor,
  Smartphone,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  AtSign,
  AlertTriangle,
  Pencil,
  LogOut,
  Plug,
  Check,
  History,
  Tv,
  Headphones,
  Search,
  Laptop,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "@/lib/user";
import { cn } from "@/lib/utils";

const PANEL =
  "relative overflow-hidden rounded-2xl border border-gold/20 shadow-elegant";
const PANEL_STYLE = {
  background: "linear-gradient(160deg, hsl(350 30% 11%), hsl(350 22% 7%))",
} as const;

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <h3 className="font-display text-lg text-foreground">{title}</h3>
    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
  </div>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 py-3">
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/60 ring-1 ring-border/60">
      <Icon className="h-4 w-4 text-gold" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground truncate">{value}</p>
    </div>
  </div>
);

const SecurityCard = ({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  tone = "default",
}: {
  icon: any;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  tone?: "default" | "gold";
}) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all",
      "border-border/60 hover:border-gold/40 hover:shadow-glow",
    )}
    style={PANEL_STYLE}
  >
    <div
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl ring-1",
        tone === "gold"
          ? "bg-gold/15 ring-gold/30"
          : "bg-red/15 ring-red/30",
      )}
    >
      <Icon className={cn("h-5 w-5", tone === "gold" ? "text-gold" : "text-red-soft")} />
    </div>
    <div>
      <p className="font-display text-sm text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
    <span className="mt-2 text-xs font-medium text-gold group-hover:underline">
      {action} →
    </span>
  </button>
);

const ToggleRow = ({
  title,
  helper,
  checked,
  onChange,
}: {
  title: string;
  helper?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div className="min-w-0 flex-1">
      <p className="text-sm text-foreground">{title}</p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

interface SessionItem {
  id: string;
  device: string;
  icon: any;
  location: string;
  browser: string;
  current?: boolean;
  lastActive: string;
}

const INITIAL_SESSIONS: SessionItem[] = [
  { id: "s1", device: "MacBook Pro", icon: Monitor, location: "Lagos, Nigeria", browser: "Safari", current: true, lastActive: "Active now" },
  { id: "s2", device: "iPhone 15", icon: Smartphone, location: "Lagos, Nigeria", browser: "Nora iOS App", lastActive: "2 hours ago" },
  { id: "s3", device: "Windows PC", icon: Monitor, location: "Abuja, Nigeria", browser: "Chrome", lastActive: "Yesterday" },
];

interface ProviderItem {
  id: string;
  name: string;
  connected: boolean;
}

const AccountSettings = () => {
  const { user } = useUser();

  // Dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Account info
  const [info, setInfo] = useState({
    fullName: user.name,
    displayName: user.handle,
    email: user.email,
    phone: "+234 802 123 4567",
    country: "Nigeria",
    memberSince: "March 2024",
  });
  const [draft, setDraft] = useState(info);

  // Password
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  // Security toggles
  const [twoFA, setTwoFA] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  // Connected accounts
  const [providers, setProviders] = useState<ProviderItem[]>([
    { id: "google", name: "Google", connected: true },
    { id: "apple", name: "Apple", connected: false },
    { id: "facebook", name: "Facebook", connected: false },
  ]);

  // Comms
  const [comms, setComms] = useState({
    email: true,
    productUpdates: true,
    creatorAnnouncements: true,
    subscriptionEmails: true,
    marketing: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    privateHistory: false,
    hideRecent: false,
    personalized: true,
    dataCollection: true,
  });

  // Delete account
  const [delPwd, setDelPwd] = useState("");
  const [delAck, setDelAck] = useState(false);

  // Activity / history
  type ClearTarget = "watch" | "listening" | "search" | "all";
  const CLEAR_LABELS: Record<ClearTarget, { title: string; toast: string }> = {
    watch: { title: "Clear Watch History?", toast: "Watch history cleared." },
    listening: { title: "Clear Listening History?", toast: "Listening history cleared." },
    search: { title: "Clear Search History?", toast: "Search history cleared." },
    all: { title: "Clear All Activity?", toast: "Activity cleared successfully." },
  };
  const [clearTarget, setClearTarget] = useState<ClearTarget | null>(null);
  const confirmClear = () => {
    if (!clearTarget) return;
    toast.success(CLEAR_LABELS[clearTarget].toast);
    setClearTarget(null);
  };

  const saveInfo = () => {
    setInfo(draft);
    setEditOpen(false);
    toast.success("Account information updated");
  };

  const updatePassword = () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      toast.error("Please fill all password fields");
      return;
    }
    if (pwd.next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    setPwdOpen(false);
    toast.success("Password updated");
  };

  const signOut = (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    toast.success("Device signed out");
  };

  const signOutAll = () => {
    setSessions((s) => s.filter((x) => x.current));
    toast.success("All other devices signed out");
  };

  const toggleProvider = (id: string) => {
    setProviders((ps) =>
      ps.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p)),
    );
    const p = providers.find((p) => p.id === id);
    toast.success(`${p?.name} ${p?.connected ? "disconnected" : "connected"}`);
  };

  const deactivate = () => {
    toast.success("Account deactivated", {
      description: "You can reactivate by signing in again within 30 days.",
    });
  };

  const deleteAccount = () => {
    if (!delPwd || !delAck) {
      toast.error("Please confirm password and acknowledge the action");
      return;
    }
    setDeleteOpen(false);
    setDelPwd("");
    setDelAck(false);
    toast.success("Deletion request submitted");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-foreground">Account Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, security, and sign-in preferences.
        </p>
      </div>

      {/* Account Information */}
      <section className="space-y-4">
        <SectionHeader title="Account Information" subtitle="Your personal Nora details." />
        <div className={PANEL} style={PANEL_STYLE}>
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
          <div className="relative grid gap-x-8 gap-y-0 px-5 sm:px-6 md:grid-cols-2 divide-border/40">
            <InfoRow icon={UserIcon} label="Full Name" value={info.fullName} />
            <InfoRow icon={AtSign} label="Display Name" value={`@${info.displayName}`} />
            <InfoRow icon={Mail} label="Email Address" value={info.email} />
            <InfoRow icon={Phone} label="Phone Number" value={info.phone} />
            <InfoRow icon={MapPin} label="Country" value={info.country} />
            <InfoRow icon={Calendar} label="Member Since" value={info.memberSince} />
          </div>
          <div className="relative border-t border-border/40 px-5 sm:px-6 py-4 flex justify-end">
            <Button
              onClick={() => {
                setDraft(info);
                setEditOpen(true);
              }}
              className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Account Information
            </Button>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="space-y-4">
        <SectionHeader title="Security" subtitle="Protect your account and review active access." />
        <div className="grid gap-4 sm:grid-cols-2">
          <SecurityCard
            icon={KeyRound}
            title="Change Password"
            description="Update your Nora account password."
            action="Update"
            onClick={() => setPwdOpen(true)}
          />
          <SecurityCard
            icon={ShieldCheck}
            title="Two-Factor Authentication"
            description={twoFA ? "Enabled — extra protection active." : "Add an extra layer of security."}
            action={twoFA ? "Manage" : "Enable"}
            tone="gold"
            onClick={() => {
              setTwoFA((v) => !v);
              toast.success(twoFA ? "Two-factor authentication disabled" : "Two-factor authentication enabled");
            }}
          />
          <SecurityCard
            icon={Globe}
            title="Login Sessions"
            description={`${sessions.length} active session${sessions.length === 1 ? "" : "s"}.`}
            action="Review"
            onClick={() => setSessionsOpen(true)}
          />
          <SecurityCard
            icon={Smartphone}
            title="Connected Devices"
            description="Manage devices linked to your account."
            action="Manage"
            onClick={() => setDevicesOpen(true)}
          />
        </div>
      </section>

      {/* Connected Accounts */}
      <section className="space-y-4">
        <SectionHeader title="Connected Accounts" subtitle="Link sign-in providers for faster access." />
        <div className={PANEL} style={PANEL_STYLE}>
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
          <div className="relative divide-y divide-border/40 px-5 sm:px-6">
            {providers.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/60 ring-1 ring-border/60">
                    <Plug className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground">{p.name}</p>
                    <p className="mt-0.5 text-xs">
                      {p.connected ? (
                        <span className="inline-flex items-center gap-1 text-gold">
                          <Check className="h-3 w-3" /> Connected
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not Connected</span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant={p.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleProvider(p.id)}
                  className={cn(
                    p.connected
                      ? "border-red/40 bg-transparent text-red hover:bg-red/10 hover:text-red"
                      : "bg-red-gradient text-primary-foreground hover:opacity-90",
                  )}
                >
                  {p.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communication Preferences */}
      <section className="space-y-4">
        <SectionHeader title="Communication Preferences" subtitle="Choose which emails Nora sends you." />
        <div className={PANEL} style={PANEL_STYLE}>
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
          <div className="relative divide-y divide-border/40 px-5 sm:px-6">
            <ToggleRow title="Email Notifications" helper="Account activity, security, and alerts." checked={comms.email} onChange={(v) => setComms({ ...comms, email: v })} />
            <ToggleRow title="Product Updates" helper="New features and improvements." checked={comms.productUpdates} onChange={(v) => setComms({ ...comms, productUpdates: v })} />
            <ToggleRow title="Creator Announcements" helper="News from creators you follow." checked={comms.creatorAnnouncements} onChange={(v) => setComms({ ...comms, creatorAnnouncements: v })} />
            <ToggleRow title="Subscription Emails" helper="Billing receipts and renewals." checked={comms.subscriptionEmails} onChange={(v) => setComms({ ...comms, subscriptionEmails: v })} />
            <ToggleRow title="Marketing Emails" helper="Promotions and partner offers." checked={comms.marketing} onChange={(v) => setComms({ ...comms, marketing: v })} />
          </div>
          <div className="relative border-t border-border/40 px-5 sm:px-6 py-4 flex justify-end">
            <Button
              onClick={() => toast.success("Settings saved")}
              className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-4">
        <SectionHeader title="Privacy" subtitle="Control your listening data and recommendations." />
        <div className={PANEL} style={PANEL_STYLE}>
          <div className="absolute inset-0 pointer-events-none glow-radial opacity-30" />
          <div className="relative divide-y divide-border/40 px-5 sm:px-6">
            <ToggleRow title="Private Listening History" helper="Don't save what you listen to." checked={privacy.privateHistory} onChange={(v) => setPrivacy({ ...privacy, privateHistory: v })} />
            <ToggleRow title="Hide Recently Played" helper="Hide your recent activity from your profile." checked={privacy.hideRecent} onChange={(v) => setPrivacy({ ...privacy, hideRecent: v })} />
            <ToggleRow title="Personalized Recommendations" helper="Use your activity to tailor recommendations." checked={privacy.personalized} onChange={(v) => setPrivacy({ ...privacy, personalized: v })} />
            <ToggleRow title="Data Collection Preferences" helper="Allow Nora to collect usage data to improve the platform." checked={privacy.dataCollection} onChange={(v) => setPrivacy({ ...privacy, dataCollection: v })} />
          </div>
          <div className="relative border-t border-border/40 px-5 sm:px-6 py-4 flex justify-end">
            <Button
              onClick={() => toast.success("Settings saved")}
              className="bg-red-gradient text-primary-foreground hover:opacity-90 hover:shadow-glow"
            >
              Save Privacy Settings
            </Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <SectionHeader title="Danger Zone" subtitle="Irreversible account actions." />
        <div
          className="relative overflow-hidden rounded-2xl border border-red/40 shadow-red-glow"
          style={{ background: "linear-gradient(160deg, hsl(350 40% 12%), hsl(350 35% 7%))" }}
        >
          <div className="relative divide-y divide-red/20 px-5 sm:px-6">
            <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-soft" />
                  Deactivate Account
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Temporarily disable your Nora account. You can reactivate anytime by signing back in.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={deactivate}
                className="border-red/50 bg-transparent text-red-soft hover:bg-red/10 hover:text-red-soft"
              >
                Deactivate
              </Button>
            </div>
            <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-soft" />
                  Delete Account
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Permanently delete your Nora account and all associated data.
                </p>
              </div>
              <Button
                onClick={() => setDeleteOpen(true)}
                className="bg-red-gradient text-primary-foreground hover:opacity-90"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Info Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-gold/30" style={PANEL_STYLE}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Account Information</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your personal details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { k: "fullName", l: "Full Name" },
              { k: "displayName", l: "Display Name" },
              { k: "email", l: "Email Address" },
              { k: "phone", l: "Phone Number" },
              { k: "country", l: "Country" },
            ].map((f) => (
              <div key={f.k} className="space-y-1.5">
                <Label htmlFor={f.k} className="text-xs text-muted-foreground">{f.l}</Label>
                <Input
                  id={f.k}
                  value={(draft as any)[f.k]}
                  onChange={(e) => setDraft({ ...draft, [f.k]: e.target.value })}
                  className="border-border bg-secondary/60 focus-visible:ring-1 focus-visible:ring-gold"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveInfo} className="bg-red-gradient text-primary-foreground hover:opacity-90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="border-gold/30" style={PANEL_STYLE}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Change Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Use a strong, unique password for your Nora account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Current Password</Label>
              <Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} className="border-border bg-secondary/60 focus-visible:ring-1 focus-visible:ring-gold" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">New Password</Label>
              <Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} className="border-border bg-secondary/60 focus-visible:ring-1 focus-visible:ring-gold" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} className="border-border bg-secondary/60 focus-visible:ring-1 focus-visible:ring-gold" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setPwdOpen(false)}>Cancel</Button>
            <Button onClick={updatePassword} className="bg-red-gradient text-primary-foreground hover:opacity-90">
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessions Dialog */}
      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="border-gold/30 max-w-lg" style={PANEL_STYLE}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Login Sessions</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Devices currently signed in to your Nora account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            {sessions.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/80 ring-1 ring-border/60">
                      <Icon className="h-4 w-4 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground flex items-center gap-2 truncate">
                        {s.device}
                        {s.current && (
                          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold ring-1 ring-gold/30">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.browser} · {s.location} · {s.lastActive}
                      </p>
                    </div>
                  </div>
                  {!s.current && (
                    <Button size="sm" variant="outline" onClick={() => signOut(s.id)} className="border-red/40 bg-transparent text-red hover:bg-red/10 hover:text-red">
                      <LogOut className="mr-1.5 h-3.5 w-3.5" />
                      Sign Out
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setSessionsOpen(false)}>Close</Button>
            <Button onClick={signOutAll} className="bg-red-gradient text-primary-foreground hover:opacity-90">
              Sign Out All Devices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connected Devices Dialog */}
      <Dialog open={devicesOpen} onOpenChange={setDevicesOpen}>
        <DialogContent className="border-gold/30" style={PANEL_STYLE}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Connected Devices</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Devices authorized to stream Nora on your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {sessions.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/80 ring-1 ring-border/60">
                      <Icon className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{s.device}</p>
                      <p className="text-xs text-muted-foreground">{s.location}</p>
                    </div>
                  </div>
                  {!s.current && (
                    <Button size="sm" variant="outline" onClick={() => signOut(s.id)} className="border-red/40 bg-transparent text-red hover:bg-red/10 hover:text-red">
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDevicesOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-red/40" style={{ background: "linear-gradient(160deg, hsl(350 40% 12%), hsl(350 35% 7%))" }}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-soft" />
              Delete Nora Account?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. Your profile, library, and history will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Password Confirmation</Label>
              <Input
                type="password"
                value={delPwd}
                onChange={(e) => setDelPwd(e.target.value)}
                placeholder="Enter your password"
                className="border-border bg-secondary/60 focus-visible:ring-1 focus-visible:ring-red"
              />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox checked={delAck} onCheckedChange={(v) => setDelAck(!!v)} className="mt-0.5 border-red/40 data-[state=checked]:bg-red data-[state=checked]:border-red" />
              <span className="text-xs text-muted-foreground">
                I understand this action is permanent.
              </span>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              onClick={deleteAccount}
              disabled={!delPwd || !delAck}
              className="bg-red-gradient text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountSettings;
