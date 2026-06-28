import type { MouseEvent } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useLibrary, useSaveContent, useUnsaveContent } from "@/lib/api/hooks/useLibrary";
import { cn } from "@/lib/utils";

export const SaveToLibraryButton = ({
  contentId,
  className,
  iconClassName,
  showLabel = false,
}: {
  contentId: string;
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
}) => {
  const libraryQuery = useLibrary();
  const saveMutation = useSaveContent();
  const unsaveMutation = useUnsaveContent();
  const saved = Boolean(libraryQuery.data?.saved.some((item) => item.contentId === contentId));
  const pending = saveMutation.isPending || unsaveMutation.isPending;
  const Icon = saved ? BookmarkCheck : Bookmark;

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (saved) {
      unsaveMutation.mutate(contentId, {
        onSuccess: () => toast.success("Removed from Library"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Could not remove from Library"),
      });
      return;
    }

    saveMutation.mutate(contentId, {
      onSuccess: () => toast.success("Saved to Library"),
      onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save to Library"),
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Remove from Library" : "Save to Library"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full text-muted-foreground transition-colors hover:text-gold disabled:cursor-not-allowed disabled:opacity-60",
        saved && "text-gold",
        className,
      )}
    >
      <Icon className={cn("h-4 w-4", saved && "fill-current", iconClassName)} />
      {showLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
};
