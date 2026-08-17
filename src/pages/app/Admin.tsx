import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload, Headphones, Play, Radio,
  Sparkles, User, Building2, ArrowLeft, ArrowRight, Check, Clock,
  Image as ImageIcon, Instagram, Facebook, Youtube, Music2, Twitter, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/lib/user";
import CreatorStudio from "@/components/CreatorStudio";
import { useMyCreatorApplication, useSubmitCreatorApplication } from "@/lib/api/hooks/useCreators";
import { uploadFileToPresignedUrl, useConfirmUserMedia, usePresignUserMedia } from "@/lib/api/hooks/useUpload";
import type { ContentCategory, CreatorApplicationInput, CreatorSocialPlatform } from "@/lib/api/types";
import { formatCategory, toApiSocialLinks } from "@/lib/api/adapters";


/* -------------------- Creator dashboard (approved) -------------------- */

const CreatorDashboard = () => <CreatorStudio />;


/* -------------------- Onboarding hero -------------------- */

const OnboardingHero = ({ onStart }: { onStart: () => void }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(350_55%_18%)] via-[hsl(350_45%_12%)] to-background ring-1 ring-gold/20 px-6 md:px-14 py-14 md:py-20">
    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-red-gradient opacity-30 blur-3xl" />
    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
    <div className="relative grid gap-12 md:grid-cols-[1.2fr_1fr] items-center">
      <div>
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
          <Sparkles className="h-3.5 w-3.5" /> Become a NoraPlus Creator
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl leading-tight">Create on NoraPlus</h1>
        <p className="mt-5 max-w-xl text-muted-foreground text-base md:text-lg leading-relaxed">
          Share trusted kingdom content with people around the world. Whether you're an
          individual creator or a ministry, NoraPlus gives you the tools to inspire, teach,
          worship, and reach lives globally.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-7 py-3 text-sm font-medium text-primary-foreground shadow-red-glow hover:shadow-glow transition-shadow"
          >
            Create on NoraPlus <ArrowRight className="h-4 w-4" />
          </button>
          <Link to="/partner" className="text-sm text-gold hover:underline">Learn More →</Link>
        </div>
      </div>
      <div className="relative hidden md:flex items-center justify-center">
        <div className="relative h-72 w-72">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red/30 to-gold/20 blur-2xl" />
          <div className="relative h-full w-full rounded-[2rem] bg-card-gradient ring-1 ring-gold/30 p-8 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-12 w-12 rounded-xl bg-red-gradient grid place-items-center"><Headphones className="h-5 w-5 text-primary-foreground" /></div>
              <div className="h-12 w-12 rounded-xl bg-gold/15 ring-1 ring-gold/30 grid place-items-center"><Play className="h-5 w-5 text-gold" /></div>
            </div>
            <div>
              <div className="h-2 w-3/4 rounded-full bg-gold/40" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-red/40" />
              <div className="mt-2 h-2 w-2/3 rounded-full bg-muted" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold-gradient grid place-items-center text-xs font-semibold text-primary-foreground">N</div>
              <div className="flex-1">
                <div className="h-2 w-20 rounded-full bg-foreground/70" />
                <div className="mt-1.5 h-1.5 w-14 rounded-full bg-muted-foreground/50" />
              </div>
              <Radio className="h-4 w-4 text-gold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* -------------------- Pending state -------------------- */

const PendingReview = ({ onView }: { onView: () => void }) => (
  <div className="mx-auto max-w-2xl">
    <div className="rounded-3xl bg-card-gradient ring-1 ring-gold/25 p-10 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold ring-1 ring-gold/30">
        <Clock className="h-3.5 w-3.5" /> Application Under Review
      </div>
      <h1 className="mt-6 font-display text-3xl md:text-4xl">Thanks for applying</h1>
      <p className="mt-3 text-muted-foreground">
        Your creator application is currently being reviewed. We'll notify you as soon as a decision has been made.
      </p>
      <button
        onClick={onView}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold hover:bg-gold/10 transition-colors"
      >
        View Application
      </button>
    </div>
  </div>
);

/* -------------------- Submitted application (read-only) -------------------- */

const SummaryRow = ({ label, value }: { label: string; value?: React.ReactNode }) =>
  value ? (
    <div className="flex items-start justify-between gap-4 border-t border-border/60 py-3 first:border-t-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  ) : null;

const SOCIAL_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  X: "X",
  WEBSITE: "Website",
};

const ApplicationSummary = ({ onBack }: { onBack: () => void }) => {
  const applicationQuery = useMyCreatorApplication();
  const application = applicationQuery.data;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-card-gradient ring-1 ring-border/60 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl md:text-3xl">Your Application</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold ring-1 ring-gold/30">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        </div>

        {applicationQuery.isLoading && (
          <p className="mt-8 text-center text-sm text-muted-foreground">Loading your application...</p>
        )}

        {!applicationQuery.isLoading && !application && (
          <p className="mt-8 text-center text-sm text-muted-foreground">We couldn't find your submitted application.</p>
        )}

        {application && (
          <div className="mt-6">
            {(application.avatarUrl || application.bannerUrl) && (
              <div className="mb-4 flex items-center gap-4">
                {application.avatarUrl && (
                  <img src={application.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-border" />
                )}
                {application.bannerUrl && (
                  <img src={application.bannerUrl} alt="" className="h-16 flex-1 rounded-xl object-cover ring-1 ring-border" />
                )}
              </div>
            )}
            <SummaryRow label="Type" value={application.creatorType === "INDIVIDUAL" ? "Individual Creator" : "Ministry or Organization"} />
            <SummaryRow label="Display name" value={application.displayName} />
            <SummaryRow label="Handle" value={application.requestedHandle ? `@${application.requestedHandle}` : undefined} />
            <SummaryRow label="Category" value={formatCategory(application.category)} />
            <SummaryRow label="Bio" value={application.description} />
            <SummaryRow label="Website" value={application.websiteUrl} />
            {application.socialLinks && Object.keys(application.socialLinks).length > 0 && (
              <SummaryRow
                label="Social links"
                value={
                  <div className="space-y-1">
                    {Object.entries(application.socialLinks).map(([platform, url]) => (
                      <div key={platform}>{SOCIAL_LABELS[platform] ?? platform}: {url}</div>
                    ))}
                  </div>
                }
              />
            )}
            <SummaryRow label="Submitted" value={new Date(application.submittedAt).toLocaleDateString()} />
          </div>
        )}

        <button
          onClick={onBack}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold hover:bg-gold/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
    </div>
  );
};

/* -------------------- Multi-step application -------------------- */

type CreatorType = "individual" | "organization" | null;

const TOTAL_STEPS = 6;

const StepHeader = ({ step, title }: { step: number; title: string }) => (
  <div>
    <div className="flex items-center justify-between text-xs">
      <span className="uppercase tracking-[0.25em] text-gold">Step {step} of {TOTAL_STEPS}</span>
      <span className="text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
    </div>
    <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-red-gradient transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
    </div>
    <h2 className="mt-6 font-display text-3xl md:text-4xl">{title}</h2>
  </div>
);

const Field = ({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: React.ReactNode }) => (
  <label className="block">
    <span className="text-sm text-foreground/90">{label}{required && <span className="text-gold"> *</span>}</span>
    <div className="mt-2">{children}</div>
    {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
  </label>
);

const inputCls = "w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold/60 transition";
const disabledInputCls = "w-full rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-muted-foreground placeholder:text-muted-foreground/70 cursor-not-allowed";

const CATEGORIES: { label: string; value: ContentCategory }[] = [
  { label: "Music", value: "MUSIC" },
  { label: "Messages", value: "SERMON" },
  { label: "Podcasts", value: "PODCAST" },
  { label: "Devotionals", value: "DEVOTIONAL" },
  { label: "Worship", value: "WORSHIP" },
  { label: "Teaching Series", value: "BIBLE_STUDY" },
  { label: "Films", value: "FILM" },
  { label: "Prayer", value: "PRAYER" },
  { label: "Testimony", value: "TESTIMONY" },
  { label: "Other", value: "OTHER" },
];

const SOCIAL: { key: CreatorSocialPlatform; label: string; icon: typeof Instagram; ph: string }[] = [
  { key: "INSTAGRAM", label: "Instagram", icon: Instagram, ph: "https://instagram.com/yourhandle" },
  { key: "FACEBOOK", label: "Facebook", icon: Facebook, ph: "https://facebook.com/your-page" },
  { key: "YOUTUBE", label: "YouTube", icon: Youtube, ph: "https://youtube.com/@channel" },
  { key: "TIKTOK", label: "TikTok", icon: Music2, ph: "https://tiktok.com/@yourhandle" },
  { key: "X", label: "X", icon: Twitter, ph: "https://x.com/yourhandle" },
];

type ApplicationUpload = {
  fileName: string;
  key: string;
  url: string;
};

const ApplicationImageUpload = ({
  label,
  folder,
  role,
  shape,
  upload,
  onUpload,
}: {
  label: string;
  folder: "avatars" | "banners";
  role: "avatar" | "banner";
  shape: "avatar" | "banner";
  upload: ApplicationUpload | null;
  onUpload: (upload: ApplicationUpload | null) => void;
}) => {
  const presignUpload = usePresignUserMedia();
  const confirmUpload = useConfirmUserMedia();
  const isUploading = presignUpload.isPending || confirmUpload.isPending;

  const chooseFile = async (file: File | undefined) => {
    if (!file || isUploading) return;

    try {
      const presigned = await presignUpload.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        folder,
        fileSize: file.size,
      });
      await uploadFileToPresignedUrl(file, presigned.uploadUrl);
      const confirmed = await confirmUpload.mutateAsync({ key: presigned.key, role });
      const nextUpload = { fileName: file.name, key: confirmed.key, url: confirmed.url };
      onUpload(nextUpload);
      toast({ title: `${label} uploaded`, description: file.name });
    } catch (error) {
      toast({
        title: `${label} upload failed`,
        description: error instanceof Error ? error.message : "Please choose a valid JPG, PNG, or WebP image.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <label
        className={cn(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden border border-dashed border-gold/40 bg-secondary/30 transition-colors hover:border-gold",
          shape === "avatar" ? "h-32 w-32 rounded-full" : "h-32 rounded-2xl",
          isUploading && "pointer-events-none opacity-70",
        )}
      >
        {upload ? (
          <img src={upload.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <ImageIcon className="mx-auto h-6 w-6 text-gold" />
            {shape === "banner" && <p className="mt-2 text-xs text-muted-foreground">Upload cover image</p>}
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={isUploading}
          onChange={(event) => void chooseFile(event.target.files?.[0])}
        />
        <span className="absolute inset-x-0 bottom-0 bg-background/80 px-2 py-1 text-center text-[11px] text-gold opacity-0 transition group-hover:opacity-100">
          {isUploading ? "Uploading..." : upload ? "Replace" : "Upload"}
        </span>
      </label>
      {upload && (
        <div className="mt-2 flex max-w-full items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{upload.fileName}</span>
          <button type="button" onClick={() => onUpload(null)} className="shrink-0 text-gold hover:underline">
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

const Application = ({
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  onCancel: () => void;
  onSubmit: (input: CreatorApplicationInput) => void;
  isSubmitting: boolean;
}) => {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<CreatorType>(null);
  const [handle, setHandle] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [category, setCategory] = useState<ContentCategory | null>(null);
  const [socialLinks, setSocialLinks] = useState<Partial<Record<CreatorSocialPlatform, string>>>({});
  const [avatarUpload, setAvatarUpload] = useState<ApplicationUpload | null>(null);
  const [bannerUpload, setBannerUpload] = useState<ApplicationUpload | null>(null);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const accountName = user.name?.trim() || "";
  const accountEmail = user.email?.trim() || "";
  const lockAccountFields = true;

  const canNext = useMemo(() => {
    if (step === 1) return type !== null;
    if (step === 2) return applicationName.trim().length >= 2;
    if (step === 4) return category !== null;
    if (step === 6) return agree1 && agree2;
    return true;
  }, [step, type, applicationName, category, agree1, agree2]);

  const next = () => setStep(s => Math.min(TOTAL_STEPS, s + 1));
  const back = () => (step === 1 ? onCancel() : setStep(s => s - 1));

  const submit = () => {
    if (!canNext || isSubmitting) return;

    const links = Object.fromEntries(
      Object.entries(socialLinks).filter(([, value]) => typeof value === "string" && value.trim().length > 0),
    ) as Partial<Record<CreatorSocialPlatform, string>>;

    onSubmit({
      creatorType: type === "individual" ? "INDIVIDUAL" : "MINISTRY_ORGANIZATION",
      ...(type === "individual"
        ? { displayName: applicationName.trim() }
        : { organizationName: applicationName.trim() }),
      ...(handle.trim() && { handle: handle.trim() }),
      category: category ?? "OTHER",
      ...(bio.trim() && { description: bio.trim() }),
      ...(websiteUrl.trim() && { websiteUrl: websiteUrl.trim() }),
      ...(avatarUpload?.url && { avatarUrl: avatarUpload.url }),
      ...(bannerUpload?.url && { bannerUrl: bannerUpload.url }),
      ...(Object.keys(links).length > 0 && { socialLinks: toApiSocialLinks(links) }),
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl bg-card-gradient ring-1 ring-border/60 p-6 md:p-10">
        {step === 1 && (
          <div className="space-y-8">
            <StepHeader step={1} title="What best describes you?" />
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { id: "individual" as const, icon: User, title: "Individual Creator", desc: "Perfect for pastors, teachers, musicians, podcasters, speakers and other individual kingdom creators." },
                { id: "organization" as const, icon: Building2, title: "Ministry or Organization", desc: "For churches, ministries, fellowships, worship teams, conferences and organizations." },
              ].map(opt => {
                const active = type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={cn(
                      "group text-left rounded-2xl border p-6 transition-all",
                      active
                        ? "border-gold bg-gold/5 ring-2 ring-gold/40 shadow-glow"
                        : "border-border bg-secondary/30 hover:border-gold/40"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl grid place-items-center transition-colors",
                      active ? "bg-gold-gradient text-primary-foreground" : "bg-red-gradient text-primary-foreground"
                    )}>
                      <opt.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 font-display text-xl">{opt.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{opt.desc}</p>
                    {active && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold">
                        <Check className="h-3.5 w-3.5" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && type === "individual" && (
          <div className="space-y-8">
            <StepHeader step={2} title="Personal Information" />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full Name" required hint={lockAccountFields ? "Pulled from your NoraPlus account." : undefined}>
                <input className={lockAccountFields ? disabledInputCls : inputCls} value={accountName} readOnly={lockAccountFields} disabled={lockAccountFields} placeholder="Your full name" />
              </Field>
              <Field label="Creator Display Name" required>
                <input className={inputCls} value={applicationName} onChange={(e) => setApplicationName(e.target.value)} placeholder="How it appears on NoraPlus" />
              </Field>
              <Field
                label="Creator Handle"
                required
                hint={<>Your creator page: <span className="text-gold">noraplus.io/@{handle || "yourhandle"}</span><div className="mt-1 text-muted-foreground/80">Unique · lowercase · letters, numbers, periods, underscores</div></>}
              >
                <div className="flex items-center rounded-xl border border-border bg-secondary/40 focus-within:ring-1 focus-within:ring-gold focus-within:border-gold/60">
                  <span className="pl-4 text-sm text-muted-foreground">@</span>
                  <input
                    className="w-full bg-transparent px-2 py-2.5 text-sm focus:outline-none"
                    value={handle}
                    onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                    placeholder="yourhandle"
                  />
                </div>
              </Field>
              <Field label="Email Address" required hint={lockAccountFields ? "Pulled from your NoraPlus account." : undefined}>
                <input type="email" className={lockAccountFields ? disabledInputCls : inputCls} value={accountEmail} readOnly={lockAccountFields} disabled={lockAccountFields} placeholder="you@email.com" />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && type === "organization" && (
          <div className="space-y-8">
            <StepHeader step={2} title="Organization Information" />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Organization Name" required>
                <input className={inputCls} value={applicationName} onChange={(e) => setApplicationName(e.target.value)} placeholder="Ministry / Organization name" />
              </Field>
              <Field
                label="Creator Handle"
                required
                hint={<>Your organization page: <span className="text-gold">noraplus.io/@{handle || "yourhandle"}</span></>}
              >
                <div className="flex items-center rounded-xl border border-border bg-secondary/40 focus-within:ring-1 focus-within:ring-gold focus-within:border-gold/60">
                  <span className="pl-4 text-sm text-muted-foreground">@</span>
                  <input
                    className="w-full bg-transparent px-2 py-2.5 text-sm focus:outline-none"
                    value={handle}
                    onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                    placeholder="yourhandle"
                  />
                </div>
              </Field>
              <Field label="Contact Person" required hint={lockAccountFields ? "Pulled from your NoraPlus account." : undefined}>
                <input className={lockAccountFields ? disabledInputCls : inputCls} value={accountName} readOnly={lockAccountFields} disabled={lockAccountFields} placeholder="Full name" />
              </Field>
              <Field label="Official Email" required hint={lockAccountFields ? "Pulled from your NoraPlus account." : undefined}>
                <input type="email" className={lockAccountFields ? disabledInputCls : inputCls} value={accountEmail} readOnly={lockAccountFields} disabled={lockAccountFields} placeholder="contact@ministry.org" />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <StepHeader step={3} title="Creator Profile" />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Profile Photo">
                <ApplicationImageUpload
                  label="Profile photo"
                  folder="avatars"
                  role="avatar"
                  shape="avatar"
                  upload={avatarUpload}
                  onUpload={setAvatarUpload}
                />
              </Field>
              <Field label="Cover Image">
                <ApplicationImageUpload
                  label="Cover image"
                  folder="banners"
                  role="banner"
                  shape="banner"
                  upload={bannerUpload}
                  onUpload={setBannerUpload}
                />
              </Field>
              {(avatarUpload || bannerUpload) && (
                <p className="md:col-span-2 text-xs text-muted-foreground">
                  Images will be submitted with your creator application and used for your creator profile after approval.
                </p>
              )}
              <div className="md:col-span-2">
                <Field label="Short Bio">
                  <textarea
                  rows={4}
                  className={cn(inputCls, "resize-none")}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your ministry or creative work..."
                />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Website (optional)"><input className={inputCls} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" /></Field>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <StepHeader step={4} title="Content Category" />
            <p className="text-sm text-muted-foreground -mt-4">Pick the category that best describes the content you plan to share.</p>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map(c => {
                const active = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-sm transition-all border",
                      active
                        ? "border-gold bg-gold/10 text-gold ring-1 ring-gold/40"
                        : "border-border bg-secondary/40 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                    )}
                  >
                    {active && <Check className="inline mr-1.5 h-3.5 w-3.5" />}{c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <StepHeader step={5} title="Social Presence" />
            <p className="text-sm text-muted-foreground -mt-4">Optional — help your audience find you across platforms.</p>
            <div className="grid gap-5 md:grid-cols-2">
              {SOCIAL.map(s => (
                <Field key={s.key} label={s.label}>
                  <div className="flex items-center rounded-xl border border-border bg-secondary/40 focus-within:ring-1 focus-within:ring-gold focus-within:border-gold/60">
                    <span className="pl-4 text-gold"><s.icon className="h-4 w-4" /></span>
                    <input
                      className="w-full bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                      value={socialLinks[s.key] ?? ""}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.ph}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8">
            <StepHeader step={6} title="Creator Agreement" />
            <div className="space-y-4">
              {[
                { v: agree1, set: setAgree1, label: "I confirm that I own or have the rights to publish my content." },
                { v: agree2, set: setAgree2, label: "I agree to NoraPlus's Creator Guidelines." },
              ].map((c, i) => (
                <label
                  key={i}
                  className={cn(
                    "flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all",
                    c.v ? "border-gold/60 bg-gold/5" : "border-border bg-secondary/30 hover:border-gold/40"
                  )}
                >
                  <span className={cn(
                    "mt-0.5 grid h-5 w-5 place-items-center rounded border transition-colors",
                    c.v ? "border-gold bg-gold-gradient" : "border-border"
                  )}>
                    {c.v && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </span>
                  <input type="checkbox" className="sr-only" checked={c.v} onChange={e => c.set(e.target.checked)} />
                  <span className="text-sm leading-relaxed">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={next}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all",
                canNext
                  ? "bg-red-gradient text-primary-foreground shadow-red-glow hover:shadow-glow"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext || isSubmitting}
              onClick={submit}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all",
                canNext && !isSubmitting
                  ? "bg-red-gradient text-primary-foreground shadow-red-glow hover:shadow-glow"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"} <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------- Success -------------------- */

const SuccessView = ({ onHome }: { onHome: () => void }) => (
  <div className="mx-auto max-w-2xl">
    <div className="relative overflow-hidden rounded-3xl bg-card-gradient ring-1 ring-gold/30 p-10 md:p-14 text-center">
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-red/20 blur-3xl" />
      <div className="relative">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-gradient shadow-glow">
          <Check className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-6 font-display text-3xl md:text-4xl">Application Submitted</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Thank you for applying to create on NoraPlus.<br />
          Our team is reviewing your application.<br />
          Most applications are reviewed within 24–72 hours.
        </p>
        <button
          onClick={onHome}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-gradient px-7 py-3 text-sm font-medium text-primary-foreground shadow-red-glow"
        >
          Return Home
        </button>
      </div>
    </div>
  </div>
);

/* -------------------- Rejected state -------------------- */

const RejectedView = ({ reason, onReapply }: { reason?: string; onReapply: () => void }) => (
  <div className="mx-auto max-w-2xl">
    <div className="rounded-3xl bg-card-gradient ring-1 ring-destructive/30 p-10 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-destructive/15 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-destructive ring-1 ring-destructive/30">
        <XCircle className="h-3.5 w-3.5" /> Application Not Approved
      </div>
      <h1 className="mt-6 font-display text-3xl md:text-4xl">We couldn't approve your application this time</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        {reason || "Thank you for your interest in creating on NoraPlus. After reviewing your submission, our team was unable to approve it at this stage. You're welcome to update your details and reapply."}
      </p>
      <button
        onClick={onReapply}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-gradient px-7 py-3 text-sm font-medium text-primary-foreground shadow-red-glow"
      >
        Reapply
      </button>
    </div>
  </div>
);

/* -------------------- Page shell -------------------- */

type View = "hero" | "applying" | "success" | "pending" | "viewing" | "rejected" | "dashboard";

const viewForStatus = (s: ReturnType<typeof useUser>["user"]["creator_status"]): View => {
  switch (s) {
    case "Approved": return "dashboard";
    case "Under Review": return "pending";
    case "Rejected": return "rejected";
    default: return "hero";
  }
};

const Admin = () => {
  const { user, setCreatorStatus, isPrototypeUser } = useUser();
  const status = user.creator_status;
  const [view, setView] = useState<View>(() => viewForStatus(status));
  const submitApplication = useSubmitCreatorApplication();

  useEffect(() => {
    // Snap to canonical view when status changes externally, unless mid-application, success, or viewing
    if (view !== "applying" && view !== "success" && view !== "viewing") setView(viewForStatus(status));
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (view === "dashboard") return <CreatorDashboard />;

  return (
    <div className="space-y-8">
      {view === "hero" && <OnboardingHero onStart={() => setView("applying")} />}
      {view === "applying" && (
        <Application
          onCancel={() => setView(viewForStatus(status))}
          isSubmitting={submitApplication.isPending}
          onSubmit={(input) => {
            submitApplication.mutate(input, {
              onSuccess: () => {
                setCreatorStatus("Under Review");
                setView("success");
                toast({ title: "Application submitted", description: "We'll review and notify you within 24-72 hours." });
              },
              onError: (error) => {
                toast({
                  title: "Application could not be submitted",
                  description: error instanceof Error ? error.message : "Please check your details and try again.",
                  variant: "destructive",
                });
              },
            });
          }}
        />
      )}
      {view === "success" && <SuccessView onHome={() => setView("pending")} />}
      {view === "pending" && <PendingReview onView={() => setView("viewing")} />}
      {view === "viewing" && <ApplicationSummary onBack={() => setView("pending")} />}
      {view === "rejected" && (
        <RejectedView reason={user.rejectionReason} onReapply={() => setView("applying")} />
      )}

      {/* Dev helper — prototype/mock session only, never for real accounts */}
      {isPrototypeUser && status === "Under Review" && view === "pending" && (
        <div className="mx-auto max-w-2xl text-center">
          <button
            onClick={() => setCreatorStatus("Approved")}
            className="text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            (Demo) Simulate approval
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;

