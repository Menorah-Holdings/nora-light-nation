import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Layers, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "@/lib/api/client";
import {
  useAddBucketItem,
  useBucket,
  useBuckets,
  useCreateBucket,
  useDeleteBucket,
  useRemoveBucketItem,
  useReorderBucketItem,
  useUpdateBucket,
} from "@/lib/api/hooks/useBuckets";
import { useOwnCreatorContent } from "@/lib/api/hooks/useCreators";
import type { ApiContent, ApiContentBucket, ContentType } from "@/lib/api/types";

const bucketTypeLabels: Record<ContentType, string> = {
  AUDIO: "Album",
  VIDEO: "Series",
  PODCAST: "Podcast Season",
  DEVOTIONAL: "Devotional Plan",
};

const bucketTypeOptions: { label: string; value: ContentType }[] = [
  { label: "Album (Audio)", value: "AUDIO" },
  { label: "Series (Video)", value: "VIDEO" },
  { label: "Podcast Season", value: "PODCAST" },
  { label: "Devotional Plan", value: "DEVOTIONAL" },
];

const inputCls =
  "w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold/60 transition";

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-sm text-foreground/90">
      {label}
      {required && <span className="text-gold"> *</span>}
    </span>
    <div className="mt-2">{children}</div>
  </label>
);

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export const BucketsLibrary = () => {
  const [activeBucketId, setActiveBucketId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const bucketsQuery = useBuckets();
  const deleteBucket = useDeleteBucket();

  if (activeBucketId) {
    return <BucketDetail bucketId={activeBucketId} onBack={() => setActiveBucketId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Library</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Buckets</h1>
          <p className="mt-2 text-muted-foreground">
            Group your content into albums, series, podcast seasons and devotional plans.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow"
        >
          <Plus className="h-4 w-4" /> New Bucket
        </button>
      </div>

      {bucketsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-secondary/50 ring-1 ring-border/60" />
          ))}
        </div>
      ) : (bucketsQuery.data ?? []).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card-gradient p-12 text-center ring-1 ring-border/40">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-gradient shadow-red-glow">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="mt-5 font-display text-xl">No buckets yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a bucket to group songs into an album, episodes into a season, or entries into a plan.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow hover:shadow-glow transition"
          >
            <Plus className="h-4 w-4" /> New Bucket
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(bucketsQuery.data ?? []).map((bucket) => (
            <div key={bucket.id} className="group relative rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
              <button className="w-full text-left p-5" onClick={() => setActiveBucketId(bucket.id)}>
                <div className="flex items-center gap-3">
                  {bucket.coverArtUrl ? (
                    <img src={bucket.coverArtUrl} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-border/40" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/60">
                      <Layers className="h-5 w-5 text-gold" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display truncate">{bucket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {bucketTypeLabels[bucket.type]} · {bucket.items.length} {bucket.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() =>
                  deleteBucket.mutate(bucket.id, {
                    onSuccess: () => toast({ title: "Bucket deleted" }),
                    onError: (error) =>
                      toast({
                        title: "Could not delete bucket",
                        description: errorMessage(error, "Please try again."),
                        variant: "destructive",
                      }),
                  })
                }
                disabled={deleteBucket.isPending}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50"
                aria-label="Delete bucket"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBucketModal
          onClose={() => setShowCreate(false)}
          onCreated={(bucket) => {
            setShowCreate(false);
            setActiveBucketId(bucket.id);
          }}
        />
      )}
    </div>
  );
};

const CreateBucketModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (bucket: ApiContentBucket) => void;
}) => {
  const createBucket = useCreateBucket();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("AUDIO");
  const [description, setDescription] = useState("");
  const [coverArtUrl, setCoverArtUrl] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    createBucket.mutate(
      {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        coverArtUrl: coverArtUrl.trim() || undefined,
      },
      {
        onSuccess: (bucket) => {
          toast({ title: "Bucket created" });
          onCreated(bucket);
        },
        onError: (error) =>
          toast({
            title: "Could not create bucket",
            description: errorMessage(error, "Please try again."),
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-card-gradient ring-1 ring-border/60 p-8 shadow-glow">
        <button onClick={onClose} className="absolute top-5 right-5 rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60">
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-display text-2xl">New Bucket</h2>
        <p className="mt-1 text-sm text-muted-foreground">Group content of a single type — an album, series, season or plan.</p>

        <div className="mt-6 space-y-4">
          <Field label="Title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Songs of Ascent" />
          </Field>
          <Field label="Type" required>
            <select value={type} onChange={(e) => setType(e.target.value as ContentType)} className={inputCls}>
              {bucketTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(inputCls, "min-h-[80px] resize-none")}
              placeholder="Optional"
            />
          </Field>
          <Field label="Cover art URL">
            <input value={coverArtUrl} onChange={(e) => setCoverArtUrl(e.target.value)} className={inputCls} placeholder="Optional" />
          </Field>
        </div>

        <button
          onClick={submit}
          disabled={!title.trim() || createBucket.isPending}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-gradient px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
        >
          {createBucket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Bucket
        </button>
      </div>
    </div>
  );
};

const BucketDetail = ({ bucketId, onBack }: { bucketId: string; onBack: () => void }) => {
  const bucketQuery = useBucket(bucketId);
  const deleteBucket = useDeleteBucket();
  const removeItem = useRemoveBucketItem();
  const reorderItem = useReorderBucketItem();
  const addItem = useAddBucketItem();
  const [editing, setEditing] = useState(false);

  const bucket = bucketQuery.data;
  const items = useMemo(() => [...(bucket?.items ?? [])].sort((a, b) => (a.bucketPosition ?? 0) - (b.bucketPosition ?? 0)), [bucket]);

  const ownContentQuery = useOwnCreatorContent(bucket ? { type: bucket.type, limit: 50 } : undefined);
  const eligibleContent = (ownContentQuery.data ?? []).filter((item) => !items.some((existing) => existing.id === item.id));

  if (bucketQuery.isLoading || !bucket) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="text-sm text-gold hover:underline">
          ← All Buckets
        </button>
        <div className="h-40 animate-pulse rounded-2xl bg-secondary/50 ring-1 ring-border/60" />
      </div>
    );
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = items[index + direction];
    const current = items[index];
    if (!target || !current) return;
    const currentPosition = current.bucketPosition ?? index;
    const targetPosition = target.bucketPosition ?? index + direction;
    reorderItem.mutate({ bucketId, contentId: current.id, position: targetPosition });
    reorderItem.mutate({ bucketId, contentId: target.id, position: currentPosition });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gold hover:underline">
          ← All Buckets
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{bucket.title}</span>
      </div>

      <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 p-6">
        {editing ? (
          <BucketEditForm bucket={bucket} onDone={() => setEditing(false)} />
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">{bucketTypeLabels[bucket.type]}</p>
              <h1 className="mt-2 font-display text-3xl">{bucket.title}</h1>
              {bucket.description && <p className="mt-2 text-muted-foreground">{bucket.description}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary/60"
                aria-label="Edit bucket"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() =>
                  deleteBucket.mutate(bucket.id, {
                    onSuccess: () => {
                      toast({ title: "Bucket deleted" });
                      onBack();
                    },
                    onError: (error) =>
                      toast({
                        title: "Could not delete bucket",
                        description: errorMessage(error, "Please try again."),
                        variant: "destructive",
                      }),
                  })
                }
                disabled={deleteBucket.isPending}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary/60 disabled:opacity-50"
                aria-label="Delete bucket"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value=""
          disabled={addItem.isPending || eligibleContent.length === 0}
          onChange={(e) => {
            const contentId = e.target.value;
            if (!contentId) return;
            addItem.mutate(
              { bucketId, contentId },
              {
                onSuccess: () => toast({ title: "Added to bucket" }),
                onError: (error) =>
                  toast({
                    title: "Could not add content",
                    description: errorMessage(error, "Please try again."),
                    variant: "destructive",
                  }),
              },
            );
          }}
          className={cn(inputCls, "max-w-xs")}
        >
          <option value="" disabled>
            {eligibleContent.length === 0 ? `No available ${bucketTypeLabels[bucket.type].toLowerCase()} content` : "Add content…"}
          </option>
          {eligibleContent.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-xl">Empty bucket</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your existing {bucketTypeLabels[bucket.type].toLowerCase()} content using the dropdown above.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card-gradient ring-1 ring-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
                <tr>
                  <th className="px-6 py-3 font-normal">#</th>
                  <th className="px-6 py-3 font-normal">Title</th>
                  <th className="px-6 py-3 font-normal">Status</th>
                  <th className="px-6 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <BucketItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    onMoveUp={() => moveItem(index, -1)}
                    onMoveDown={() => moveItem(index, 1)}
                    onRemove={() =>
                      removeItem.mutate(
                        { bucketId, contentId: item.id },
                        {
                          onSuccess: () => toast({ title: "Removed from bucket" }),
                          onError: (error) =>
                            toast({
                              title: "Could not remove item",
                              description: errorMessage(error, "Please try again."),
                              variant: "destructive",
                            }),
                        },
                      )
                    }
                    pending={reorderItem.isPending || removeItem.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const BucketItemRow = ({
  item,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  pending,
}: {
  item: ApiContent;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  pending: boolean;
}) => (
  <tr className="border-t border-border/60 hover:bg-background/40">
    <td className="px-6 py-4 text-muted-foreground">{index + 1}</td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        {item.thumbnailUrl || item.coverArtUrl ? (
          <img src={item.thumbnailUrl || item.coverArtUrl || ""} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-secondary/60" />
        )}
        <span className="font-medium">{item.title}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-muted-foreground">{item.status}</td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-end gap-1">
        <button
          disabled={pending || isFirst}
          onClick={onMoveUp}
          title="Move up"
          className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-30"
        >
          <ArrowUp className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          disabled={pending || isLast}
          onClick={onMoveDown}
          title="Move down"
          className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-30"
        >
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          disabled={pending}
          onClick={onRemove}
          title="Remove from bucket"
          className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary/60 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </td>
  </tr>
);

const BucketEditForm = ({ bucket, onDone }: { bucket: ApiContentBucket; onDone: () => void }) => {
  const updateBucket = useUpdateBucket();
  const [title, setTitle] = useState(bucket.title);
  const [description, setDescription] = useState(bucket.description ?? "");
  const [coverArtUrl, setCoverArtUrl] = useState(bucket.coverArtUrl ?? "");

  const submit = () => {
    if (!title.trim()) return;
    updateBucket.mutate(
      {
        id: bucket.id,
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
          coverArtUrl: coverArtUrl.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Bucket updated" });
          onDone();
        },
        onError: (error) =>
          toast({
            title: "Could not update bucket",
            description: errorMessage(error, "Please try again."),
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={cn(inputCls, "min-h-[80px] resize-none")}
        />
      </Field>
      <Field label="Cover art URL">
        <input value={coverArtUrl} onChange={(e) => setCoverArtUrl(e.target.value)} className={inputCls} />
      </Field>
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={!title.trim() || updateBucket.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-red-gradient px-5 py-2 text-sm font-medium text-primary-foreground shadow-red-glow disabled:opacity-50"
        >
          {updateBucket.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
        <button onClick={onDone} className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:bg-secondary/60">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BucketsLibrary;
