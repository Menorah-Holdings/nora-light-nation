import React, { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  MoreVertical, Bookmark, BookmarkCheck, Plus, Share2, Download, Lock,
  User, Disc3, ListVideo, Flag, EyeOff, Link2, Bell, Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useLibrary, useSaveContent, useUnsaveContent } from "@/lib/api/hooks/useLibrary";
import { usePlaylists, useCreatePlaylist, useAddToPlaylist } from "@/lib/api/hooks/usePlaylists";
import { useUser } from "@/lib/user";
import type { ContentItem } from "@/lib/mockData";

interface Props {
  item: Pick<ContentItem, "id" | "title" | "creator" | "creatorId" | "type" | "medium"> & { type?: string; medium?: string };
  variant?: "default" | "compact" | "overlay";
  canDownload?: boolean;
  isLive?: boolean;
}

const SHARE_TARGETS = [
  { label: "Copy Link", icon: Link2, key: "copy" },
  { label: "WhatsApp", icon: Share2, key: "wa" },
  { label: "Instagram", icon: Share2, key: "ig" },
  { label: "X", icon: Share2, key: "x" },
  { label: "Facebook", icon: Share2, key: "fb" },
];
const REPORT_REASONS = [
  "Inappropriate Content", "Copyright Concern", "Wrong Category", "Playback Issue", "Other",
];

export const NowPlayingMenu = ({ item, variant = "default", canDownload = false, isLive = false }: Props) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useUser();
  const storageKey = `nora_np_${item.id}`;
  const readState = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  };
  const initial = readState();
  const libraryQuery = useLibrary();
  const saveMutation = useSaveContent();
  const unsaveMutation = useUnsaveContent();
  const playlistsQuery = usePlaylists(isAuthenticated);
  const addToPlaylist = useAddToPlaylist();
  const createPlaylist = useCreatePlaylist();
  const saved = Boolean(libraryQuery.data?.saved.some((entry) => entry.contentId === item.id));
  const [downloaded, setDownloaded] = useState<boolean>(!!initial.downloaded);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isSeries = ["podcast", "podcast-video", "skit", "message"].includes(item.type as string);
  const isAlbum = ["music", "music-video"].includes(item.type as string);

  const persist = (next: Record<string, unknown>) => {
    localStorage.setItem(storageKey, JSON.stringify({ ...readState(), ...next }));
  };

  const handleSave = () => {
    if (saved) {
      unsaveMutation.mutate(item.id, {
        onSuccess: () => toast.success("Removed from Library"),
        onError: () => toast.error("Could not remove from library"),
      });
    } else {
      saveMutation.mutate(item.id, {
        onSuccess: () => toast.success("Saved to Library"),
        onError: () => toast.error("Could not save to library"),
      });
    }
  };

  const handleDownload = () => {
    if (!canDownload) {
      toast("Upgrade to download", { description: "Your plan doesn't include downloads." });
      navigate("/plans");
      return;
    }
    setDownloaded(true);
    toast.success("Download Started");
  };

  const handleViewCreator = () => navigate(`/app/creators/${item.creatorId}`);
  const handleGoToCollection = () => navigate(`/app/creators/${item.creatorId}`);
  const handleNotInterested = () =>
    toast("Got it", { description: "We'll show fewer recommendations like this." });

  const handlePickPlaylist = (playlistId: string, playlistName: string) => {
    addToPlaylist.mutate({ playlistId, contentId: item.id }, {
      onSuccess: () => { setPlaylistOpen(false); toast.success(`Added to ${playlistName}`); },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add to playlist"),
    });
  };

  const handleCreatePlaylist = () => {
    const name = newPlaylistName.trim();
    if (!name) return;
    createPlaylist.mutate(name, {
      onSuccess: (playlist) => {
        addToPlaylist.mutate({ playlistId: playlist.id, contentId: item.id }, {
          onSuccess: () => {
            setPlaylistOpen(false);
            setCreatingNew(false);
            setNewPlaylistName("");
            toast.success(`Added to "${name}"`);
          },
        });
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create playlist"),
    });
  };

  const handleShare = (key: string, label: string) => {
    setShareOpen(false);
    if (key === "copy") {
      navigator.clipboard?.writeText(`${window.location.origin}/app/content/${item.id}`).catch(() => { });
      toast.success("Link Copied");
    } else {
      toast.success(`Shared via ${label}`);
    }
  };

  const handleReport = (reason: string) => {
    setReportOpen(false);
    toast.success("Thanks for your report", { description: "Our team will review it." });
  };

  const handleAddReminder = () => toast.success("Reminder set");
  const handleAddToQueue = () => toast.success("Added to queue");
  const handleViewEpisodes = () => navigate(`/app/creators/${item.creatorId}`);

  const triggerSize = variant === "compact" ? "h-8 w-8" : "h-10 w-10";
  const triggerCls = cn(
    "inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-gold transition-colors",
    triggerSize,
    variant === "overlay" && "bg-background/60 backdrop-blur-md text-foreground hover:bg-background/80",
  );

  const Row = ({
    icon: Icon, label, onSelect, active, danger,
  }: { icon: React.ElementType; label: string; onSelect: () => void; active?: boolean; danger?: boolean }) => (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-gold",
        active && "text-gold",
        danger && "hover:text-red",
      )}
    >
      <Icon className={cn("h-4 w-4", active && "fill-current")} />
      <span className="flex-1 text-left">{label}</span>
      {active && <Check className="h-3.5 w-3.5 text-gold" />}
    </button>
  );

  const items = (
    <>
      <Row icon={saved ? BookmarkCheck : Bookmark} active={saved}
        label={saved ? "Remove from Library" : (isLive ? "Save Event" : "Save to Library")}
        onSelect={handleSave} />
      {!isLive && (
        <Row icon={Plus} label="Add to Playlist" onSelect={() => setPlaylistOpen(true)} />
      )}
      {isSeries && !isLive && (
        <Row icon={ListVideo} label="Add to Queue" onSelect={handleAddToQueue} />
      )}
      <Row icon={Share2} label={isLive ? "Share Event" : "Share"} onSelect={() => setShareOpen(true)} />
      {!isLive && (
        <Row icon={downloaded ? Download : (canDownload ? Download : Lock)} active={downloaded}
          label={downloaded ? "Downloaded" : (canDownload ? "Download" : "Upgrade to Download")}
          onSelect={handleDownload} />
      )}
      {isLive && (
        <Row icon={Bell} label="Add Reminder" onSelect={handleAddReminder} />
      )}
      <div className="my-1 h-px bg-border/60" />
      <Row icon={User} label={isLive ? "View Host" : "View Creator"} onSelect={handleViewCreator} />
      {(isAlbum || isSeries) && !isLive && (
        <Row icon={Disc3} label={isAlbum ? "Go to Album" : "Go to Series"} onSelect={handleGoToCollection} />
      )}
      {isSeries && !isLive && (
        <Row icon={ListVideo} label="View All Episodes" onSelect={handleViewEpisodes} />
      )}
      <div className="my-1 h-px bg-border/60" />
      <Row icon={Flag} danger label={isLive ? "Report Event" : "Report Content"} onSelect={() => setReportOpen(true)} />
      {!isLive && (
        <Row icon={EyeOff} label="Not Interested" onSelect={handleNotInterested} />
      )}
    </>
  );

  return (
    <>
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <button aria-label="More options" className={triggerCls}>
              <MoreVertical className={variant === "compact" ? "h-4 w-4" : "h-5 w-5"} />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl border-t border-border bg-card-gradient p-0">
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" />
            <SheetHeader className="px-5 pt-3 pb-2 text-left">
              <SheetTitle className="font-display text-base truncate">{item.title}</SheetTitle>
              <p className="text-xs text-muted-foreground truncate">{item.creator}</p>
            </SheetHeader>
            <div className="px-3 pb-6">{items}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="More options" className={triggerCls}>
              <MoreVertical className={variant === "compact" ? "h-4 w-4" : "h-5 w-5"} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 border-border bg-card-gradient p-2 shadow-xl"
          >
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gold">
              Now Playing
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-0.5">{items}</div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Playlist picker */}
      <Dialog open={playlistOpen} onOpenChange={(open) => { setPlaylistOpen(open); if (!open) { setCreatingNew(false); setNewPlaylistName(""); } }}>
        <DialogContent className="bg-card-gradient border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Add to Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {playlistsQuery.isLoading ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">Loading playlists…</p>
            ) : (playlistsQuery.data ?? []).length === 0 && !creatingNew ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">No playlists yet. Create one below.</p>
            ) : (
              (playlistsQuery.data ?? []).map((p) => (
                <button key={p.id} onClick={() => handlePickPlaylist(p.id, p.name)}
                  disabled={addToPlaylist.isPending}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-sidebar-accent hover:text-gold transition-colors disabled:opacity-50">
                  <ListVideo className="h-4 w-4" /> {p.name}
                  <span className="ml-auto text-xs text-muted-foreground">{p.items.length} items</span>
                </button>
              ))
            )}
            <div className="my-2 h-px bg-border/60" />
            {creatingNew ? (
              <div className="flex items-center gap-2 px-1">
                <Input
                  autoFocus
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreatePlaylist(); if (e.key === "Escape") { setCreatingNew(false); setNewPlaylistName(""); } }}
                  placeholder="Playlist name"
                  className="h-9 text-sm"
                />
                <button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim() || createPlaylist.isPending}
                  className="shrink-0 rounded-lg bg-red-gradient px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50">
                  {createPlaylist.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button onClick={() => setCreatingNew(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gold hover:bg-sidebar-accent transition-colors">
                <Plus className="h-4 w-4" /> Create New Playlist
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="bg-card-gradient border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Share</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {SHARE_TARGETS.map((s) => (
              <button key={s.key} onClick={() => handleShare(s.key, s.label)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm border border-border/60 hover:border-gold/60 hover:text-gold transition-colors">
                <s.icon className="h-4 w-4" /> {s.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="bg-card-gradient border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {REPORT_REASONS.map((r) => (
              <button key={r} onClick={() => handleReport(r)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-sidebar-accent hover:text-red transition-colors">
                <Flag className="h-4 w-4" /> {r}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NowPlayingMenu;

