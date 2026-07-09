import { images, type ContentItem, type ContentType as UiContentType } from "@/lib/mockData";
import type { ApiContent, ApiCreator, ApiCreatorAnalytics, ApiLiveEvent, ContentCategory, ContentMediaType, ContentType } from "./types";

export interface UiCreator {
  id: string;
  name: string;
  handle?: string | null;
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
  hostId?: string;
  date: string;
  time: string;
  access: "Free" | "Paid";
  status: "upcoming" | "live" | "replay";
  image: string;
  description?: string | null;
  viewerCount: number;
}

export interface UiAnalyticsStat {
  label: string;
  value: string;
  trend: string;
}

export function adaptContent(item: ApiContent): ContentItem {
  const uiType = mapContentType(item.type, item.category, item.tags);

  return {
    id: item.id,
    title: item.title,
    creator: item.creator?.displayName ?? "NoraPlus",
    creatorId: item.creator?.id ?? "",
    type: uiType,
    medium: mapContentMedium(item.mediaType, item.type),
    duration: formatDuration(item.durationSeconds),
    description: item.description ?? "",
    image: item.thumbnailUrl || fallbackContentImage(uiType, item.category),
    tag: item.isFeatured ? "Featured" : item.visibility === "PREMIUM_ONLY" ? "Premium" : primaryDisplayTag(item.tags),
    date: item.createdAt,
  };
}

export function adaptCreator(creator: ApiCreator): UiCreator {
  return {
    id: creator.id,
    name: creator.displayName,
    handle: creator.handle,
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
    hostId: event.creator?.id,
    date: formatDate(scheduled),
    time: event.status === "LIVE" ? "Streaming" : event.status === "ENDED" ? "Replay" : formatTime(scheduled),
    access: event.visibility === "PREMIUM_ONLY" ? "Paid" : "Free",
    status: mapLiveStatus(event.status),
    image: event.thumbnailUrl || event.bannerUrl || images.event,
    description: event.description,
    viewerCount: event.viewerCount,
  };
}

export function adaptCreatorAnalytics(analytics?: ApiCreatorAnalytics): UiAnalyticsStat[] {
  return [
    { label: "Uploads", value: formatCompactNumber(analytics?.totalUploads ?? 0), trend: "Total" },
    { label: "Published", value: formatCompactNumber(analytics?.publishedContent ?? 0), trend: "Live catalog" },
    { label: "Drafts", value: formatCompactNumber(analytics?.drafts ?? 0), trend: "In progress" },
    { label: "Followers", value: formatCompactNumber(analytics?.followersCount ?? 0), trend: "Audience" },
    { label: "Total plays", value: formatCompactNumber(analytics?.totalPlays ?? 0), trend: "All time" },
    { label: "Total views", value: formatCompactNumber(analytics?.totalViews ?? 0), trend: "All time" },
    { label: "Upcoming live", value: formatCompactNumber(analytics?.upcomingLiveEvents ?? 0), trend: "Scheduled" },
    { label: "Updated", value: analytics?.updatedAt ? formatDate(new Date(analytics.updatedAt)) : "-", trend: "Snapshot" },
  ];
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

export function contentTypeLabel(type: UiContentType): string {
  const labels: Record<UiContentType, string> = {
    message: "Message",
    music: "Music",
    podcast: "Podcast",
    devotional: "Devotional",
    movie: "Movie",
    skit: "Skit",
    "podcast-video": "Podcast Video",
    "music-video": "Music Video",
    event: "Live Event",
  };

  return labels[type];
}

function mapContentMedium(mediaType: ContentMediaType | undefined, type: ContentType): ContentItem["medium"] {
  if (mediaType === "VIDEO") return "video";
  if (mediaType === "AUDIO") return "audio";
  return type === "VIDEO" ? "video" : "audio";
}

function mapContentType(type: ContentType, category: ContentCategory, tags: string[] = []): UiContentType {
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  const hasTag = (...needles: string[]) => normalizedTags.some((tag) => needles.some((needle) => tag.includes(needle)));

  if (type === "DEVOTIONAL") return "devotional";
  if (type === "PODCAST") return "podcast";

  if (type === "VIDEO") {
    if (category === "FILM" || hasTag("film", "movie")) return "movie";
    if (hasTag("skit", "short", "comedy")) return "skit";
    if (category === "MUSIC" || category === "WORSHIP" || hasTag("music", "worship")) return "music-video";
    if (category === "PODCAST" || hasTag("podcast", "conversation")) return "podcast-video";
    return "message";
  }

  if (category === "MUSIC" || category === "WORSHIP" || hasTag("music", "worship")) return "music";
  if (category === "PODCAST" || hasTag("podcast", "conversation")) return "podcast";
  if (category === "DEVOTIONAL" || hasTag("devotional", "daily")) return "devotional";
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

function primaryDisplayTag(tags?: string[]): string | undefined {
  const tag = tags?.find((value) => value.trim().length > 0);
  if (!tag) return undefined;

  const normalized = tag.trim().replace(/[-_]+/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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
