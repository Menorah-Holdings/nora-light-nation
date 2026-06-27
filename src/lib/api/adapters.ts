import { images, type ContentItem, type ContentType as UiContentType } from "@/lib/mockData";
import type { ApiContent, ApiCreator, ApiLiveEvent, ContentCategory, ContentType } from "./types";

export interface UiCreator {
  id: string;
  name: string;
  category: string;
  verified: boolean;
  followers: string;
  plays: string;
  image: string;
  bio?: string | null;
  banner?: string | null;
}

export interface UiLiveEvent {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  access: "Free" | "Paid";
  status: "upcoming" | "live" | "replay";
  image: string;
  description?: string | null;
  youtubeUrl?: string | null;
  viewerCount: number;
}

export function adaptContent(item: ApiContent): ContentItem {
  const uiType = mapContentType(item.type, item.category);

  return {
    id: item.id,
    title: item.title,
    creator: item.creator?.displayName ?? "NoraPlus",
    creatorId: item.creator?.id ?? "",
    type: uiType,
    medium: mapContentMedium(item.type),
    duration: formatDuration(item.durationSeconds),
    description: item.description ?? "",
    image: item.thumbnailUrl || fallbackContentImage(uiType, item.category),
    tag: item.isFeatured ? "Featured" : item.isPremium ? "Premium" : undefined,
    date: item.createdAt,
  };
}

export function adaptCreator(creator: ApiCreator): UiCreator {
  return {
    id: creator.id,
    name: creator.displayName,
    category: formatCategory(creator.category),
    verified: creator.isVerified,
    followers: formatCompactNumber(creator.followerCount),
    plays: "0",
    image: creator.avatarUrl || images.message,
    bio: creator.bio,
    banner: creator.bannerUrl,
  };
}

export function adaptLiveEvent(event: ApiLiveEvent): UiLiveEvent {
  const scheduled = new Date(event.scheduledAt);

  return {
    id: event.id,
    title: event.title,
    host: event.creator?.displayName ?? "NoraPlus",
    date: formatDate(scheduled),
    time: event.status === "LIVE" ? "Streaming" : formatTime(scheduled),
    access: event.isPremium ? "Paid" : "Free",
    status: mapLiveStatus(event.status),
    image: event.thumbnailUrl || images.event,
    description: event.description,
    youtubeUrl: event.youtubeUrl,
    viewerCount: event.viewerCount,
  };
}

export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "0 min";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")} min`;
  }

  return `${minutes} min`;
}

export function formatCategory(category: ContentCategory): string {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCompactNumber(value?: number | null): string {
  const count = value ?? 0;

  if (count >= 1_000_000) return `${trimTrailingZero(count / 1_000_000)}M`;
  if (count >= 1_000) return `${trimTrailingZero(count / 1_000)}K`;
  return String(count);
}

function mapContentMedium(type: ContentType): ContentItem["medium"] {
  return type === "VIDEO" ? "video" : "audio";
}

function mapContentType(type: ContentType, category: ContentCategory): UiContentType {
  if (type === "DEVOTIONAL") return "devotional";
  if (type === "PODCAST") return "podcast";

  if (type === "VIDEO") {
    if (category === "FILM") return "movie";
    if (category === "MUSIC" || category === "WORSHIP") return "music-video";
    if (category === "PODCAST") return "podcast-video";
    if (category === "OTHER") return "skit";
    return "message";
  }

  if (category === "MUSIC" || category === "WORSHIP") return "music";
  if (category === "PODCAST") return "podcast";
  if (category === "DEVOTIONAL") return "devotional";
  return "message";
}

function fallbackContentImage(type: UiContentType, category: ContentCategory): string {
  if (type === "movie") return images.movie;
  if (type === "skit") return images.skit;
  if (type === "podcast" || type === "podcast-video") return images.podcast;
  if (type === "music" || type === "music-video" || category === "WORSHIP") return images.music;
  if (type === "devotional") return images.devotional;
  return images.message;
}

function mapLiveStatus(status: ApiLiveEvent["status"]): UiLiveEvent["status"] {
  if (status === "LIVE") return "live";
  if (status === "ENDED") return "replay";
  return "upcoming";
}

function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date): string {
  if (Number.isNaN(date.getTime())) return "Time TBD";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function trimTrailingZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
