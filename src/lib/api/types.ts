export type UserRole = "USER" | "CREATOR" | "ADMIN";
export type SubscriptionTier = "FREE" | "PREMIUM";
export type ContentType = "VIDEO" | "AUDIO" | "DEVOTIONAL" | "PODCAST";
export type ContentCategory =
  | "WORSHIP"
  | "SERMON"
  | "PODCAST"
  | "FILM"
  | "DEVOTIONAL"
  | "MUSIC"
  | "PRAYER"
  | "TESTIMONY"
  | "BIBLE_STUDY"
  | "OTHER";
export type LiveEventStatus = "SCHEDULED" | "LIVE" | "ENDED";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApiUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: string | null;
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCreatorSummary {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  isVerified: boolean;
}

export interface ApiCreator {
  id: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  category: ContentCategory;
  isVerified: boolean;
  followerCount: number;
  socialLinks?: Record<string, string> | null;
  createdAt: string;
  user?: Pick<ApiUser, "id" | "name" | "image">;
}

export interface ApiContent {
  id: string;
  title: string;
  description?: string | null;
  type: ContentType;
  category: ContentCategory;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  isPremium: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  likeCount?: number;
  scriptureReference?: string | null;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  creator?: ApiCreatorSummary | null;
}

export interface ApiPlayback {
  url: string | null;
  expiresIn: number | null;
}

export interface ApiLiveEvent {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  scheduledAt: string;
  youtubeUrl?: string | null;
  status: LiveEventStatus;
  viewerCount: number;
  isPremium: boolean;
  createdAt: string;
  creator?: Pick<ApiCreator, "id" | "displayName" | "avatarUrl"> | null;
}

export interface ApiLibraryItem {
  id: string;
  userId: string;
  contentId: string;
  savedAt: string;
  content: ApiContent;
}

export interface ApiPlaybackProgress {
  id?: string;
  userId?: string;
  contentId?: string;
  progressSeconds: number;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  content?: ApiContent;
}

export interface ApiLibrary {
  saved: ApiLibraryItem[];
  inProgress: ApiPlaybackProgress[];
}

export interface ListContentQuery {
  type?: ContentType;
  category?: ContentCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListCreatorsQuery {
  category?: ContentCategory;
  page?: number;
  limit?: number;
}

export interface ListLiveEventsQuery {
  page?: number;
  limit?: number;
}

export interface UpdateCurrentUserInput {
  name?: string;
  image?: string;
}

export interface CreatorApplicationInput {
  ministryName: string;
  category: ContentCategory;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
}

export interface CreateContentInput {
  title: string;
  description?: string;
  type: ContentType;
  category: ContentCategory;
  thumbnailUrl?: string;
  mediaUrl?: string;
  mediaKey?: string;
  durationSeconds?: number;
  isPremium?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  scriptureReference?: string;
  tags?: string[];
  creatorId?: string;
}

export type UpdateContentInput = Partial<CreateContentInput>;

export interface PresignUploadInput {
  fileName: string;
  contentType: string;
  folder: "thumbnails" | "videos" | "audio" | "avatars" | "banners";
  fileSize: number;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface ConfirmUploadInput {
  key: string;
  contentId?: string;
}

export interface ConfirmUploadResponse {
  url: string;
  key: string;
}

export interface AdminStats {
  users: { total: number; premium: number };
  creators: { total: number };
  content: { total: number; published: number };
  applications: { pending: number };
  live: { active: number };
}
