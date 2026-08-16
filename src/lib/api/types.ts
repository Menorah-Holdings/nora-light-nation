export type UserRole = "USER" | "CREATOR" | "ADMIN";
export type UserCreatorStatus = "NOT_APPLIED" | "PENDING" | "APPROVED" | "DECLINED";
export type SubscriptionTier = "FREE" | "PREMIUM";
export type ContentType = "VIDEO" | "AUDIO" | "DEVOTIONAL" | "PODCAST";
export type ContentMediaType = "AUDIO" | "VIDEO";
export type ContentStatus = "DRAFT" | "PROCESSING" | "UNDER_REVIEW" | "PUBLISHED" | "SCHEDULED" | "REJECTED" | "UNPUBLISHED";
export type ContentVisibility = "PUBLIC" | "SUBSCRIBERS_ONLY" | "PREMIUM_ONLY";
export type ContentCategory = "WORSHIP" | "SERMON" | "PODCAST" | "FILM" | "DEVOTIONAL" | "MUSIC" | "PRAYER" | "TESTIMONY" | "BIBLE_STUDY" | "OTHER";
export type LiveEventStatus = "SCHEDULED" | "LIVE" | "ENDED" | "DRAFT" | "CANCELLED" | "UNDER_REVIEW" | "REJECTED";
export type CreatorType = "INDIVIDUAL" | "MINISTRY_ORGANIZATION";
export type CreatorSocialPlatform = "INSTAGRAM" | "YOUTUBE" | "FACEBOOK" | "TIKTOK" | "X" | "WEBSITE";
export type LiveEventType = "WORSHIP_NIGHT" | "CONFERENCE" | "VIGIL" | "CONCERT" | "PRAYER_MEETING" | "PREMIERE" | "RETREAT" | "CHURCH_EVENT";
export type UploadAssetRole = "thumbnail" | "cover_art" | "primary_audio" | "primary_video" | "trailer";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApiUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  displayName?: string | null;
  phone?: string | null;
  country?: string | null;
  role?: UserRole;
  creatorStatus?: UserCreatorStatus;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: string | null;
  emailVerified?: boolean;
  isActive?: boolean;
  twoFactor?: boolean;
  emailNotif?: boolean;
  creatorUpdates?: boolean;
  privateListening?: boolean;
  hideRecentlyPlayed?: boolean;
  personalizedRecs?: boolean;
  liveEventAlerts?: boolean;
  subscriptionUpdates?: boolean;
  productAnnouncements?: boolean;
  marketingEmails?: boolean;
  dataCollectionOptIn?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiSession {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export interface ApiActionResult {
  success: boolean;
  message: string;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  actionLabel?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMarkAllReadResult {
  count: number;
}

export interface ApiCreatorSummary {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  isVerified: boolean;
}

export interface ApiCreatorSocialLink {
  id: string;
  platform: CreatorSocialPlatform;
  url: string;
  createdAt?: string;
}

export interface ApiIndividualCreatorProfile {
  id: string;
  fullName?: string | null;
  stageName?: string | null;
  primaryRole?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiMinistryOrganizationProfile {
  id: string;
  organizationName?: string | null;
  contactPersonName?: string | null;
  officialEmail?: string | null;
  organizationType?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCreator {
  id: string;
  creatorType: CreatorType;
  displayName: string;
  handle?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  category: ContentCategory;
  country?: string | null;
  city?: string | null;
  websiteUrl?: string | null;
  isVerified: boolean;
  isActive?: boolean;
  followerCount: number;
  isFollowing?: boolean;
  socialLinkRows?: ApiCreatorSocialLink[];
  contentCategories?: { id: string; category: ContentCategory }[];
  individualProfile?: ApiIndividualCreatorProfile | null;
  ministryOrganizationProfile?: ApiMinistryOrganizationProfile | null;
  createdAt: string;
  updatedAt?: string;
  user?: Pick<ApiUser, "id" | "name" | "image">;
}

export interface ApiCreatorApplication {
  id: string;
  userId: string;
  creatorType: CreatorType;
  category: ContentCategory;
  displayName: string;
  requestedHandle?: string | null;
  email?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  socialLinks?: Partial<Record<CreatorSocialPlatform, string>> | null;
  status: ApplicationStatus;
  adminNotes?: string | null;
  declineReason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedById?: string | null;
}

export interface ApiContent {
  id: string;
  title: string;
  description?: string | null;
  type: ContentType;
  mediaType?: ContentMediaType;
  category: ContentCategory;
  thumbnailUrl?: string | null;
  coverArtUrl?: string | null;
  mediaUrl?: string | null;
  mediaKey?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  trailerUrl?: string | null;
  durationSeconds?: number | null;
  status: ContentStatus;
  visibility: ContentVisibility;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  isFeatured?: boolean;
  viewCount?: number;
  likeCount?: number;
  scriptureReference?: string | null;
  tags?: string[];
  bucketId?: string | null;
  bucketPosition?: number | null;
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
  eventType?: LiveEventType | null;
  bannerUrl?: string | null;
  thumbnailUrl?: string | null;
  scheduledAt: string;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
  registrationRequired?: boolean;
  visibility: ContentVisibility;
  status: LiveEventStatus;
  isFeatured?: boolean;
  viewerCount: number;
  createdAt: string;
  creator?: Pick<ApiCreator, "id" | "displayName" | "avatarUrl"> | null;
}

export interface ApiLiveJoin {
  url: string | null;
  expiresIn: number | null;
}

export interface ApiHomeFeed {
  featured: ApiContent[];
  recommended: ApiContent[];
  trendingWorship: ApiContent[];
  newMessages: ApiContent[];
  moviesStories: ApiContent[];
  upcomingLive: ApiLiveEvent[];
  continueListening: ApiPlaybackProgress[];
}

export interface ApiCreatorAnalytics {
  totalUploads: number;
  publishedContent: number;
  drafts: number;
  followersCount: number;
  totalPlays: number;
  totalViews: number;
  upcomingLiveEvents: number;
  updatedAt: string;
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
  search?: string;
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
  displayName?: string;
  phone?: string;
  country?: string;
  twoFactor?: boolean;
  emailNotif?: boolean;
  creatorUpdates?: boolean;
  privateListening?: boolean;
  hideRecentlyPlayed?: boolean;
  personalizedRecs?: boolean;
  liveEventAlerts?: boolean;
  subscriptionUpdates?: boolean;
  productAnnouncements?: boolean;
  marketingEmails?: boolean;
  dataCollectionOptIn?: boolean;
}

export interface CreatorApplicationInput {
  creatorType?: CreatorType;
  displayName?: string;
  organizationName?: string;
  handle?: string;
  category: ContentCategory;
  description?: string;
  websiteUrl?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  /** Lowercase platform keys (instagram, youtube, ...) — see toApiSocialLinks. */
  socialLinks?: Record<string, string>;
}

export interface CreatorProfileUpdateInput {
  individualProfile?: Partial<Omit<ApiIndividualCreatorProfile, "id" | "createdAt" | "updatedAt">>;
  ministryOrganizationProfile?: Partial<Omit<ApiMinistryOrganizationProfile, "id" | "createdAt" | "updatedAt">>;
  /** Lowercase platform keys (instagram, youtube, ...) — see toApiSocialLinks. */
  socialLinks?: Record<string, string>;
  contentCategories?: ContentCategory[];
}

export interface CreateContentInput {
  title: string;
  description?: string;
  type: ContentType;
  mediaType?: ContentMediaType;
  category: ContentCategory;
  thumbnailUrl?: string;
  coverArtUrl?: string;
  mediaUrl?: string;
  mediaKey?: string;
  audioUrl?: string;
  videoUrl?: string;
  trailerUrl?: string;
  durationSeconds?: number;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  scheduledAt?: string;
  isFeatured?: boolean;
  scriptureReference?: string;
  tags?: string[];
  creatorId?: string;
}

export type UpdateContentInput = Partial<CreateContentInput>;

export interface CreateCreatorLiveEventInput {
  title: string;
  description?: string;
  eventType?: LiveEventType;
  scheduledAt: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  bannerUrl?: string;
  thumbnailUrl?: string;
  streamUrl?: string;
  registrationRequired?: boolean;
  visibility?: ContentVisibility;
}

export type UpdateCreatorLiveEventInput = Partial<CreateCreatorLiveEventInput>;

export interface PresignUploadInput {
  fileName: string;
  contentType: string;
  folder: "thumbnails" | "videos" | "audio" | "avatars" | "banners";
  fileSize: number;
}

export interface PresignUserMediaInput extends Omit<PresignUploadInput, "folder"> {
  folder: "avatars" | "banners";
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
  assetRole?: UploadAssetRole;
}

export interface ConfirmUploadResponse {
  url: string;
  key: string;
}

export type UserMediaRole = "avatar" | "banner";

export interface ConfirmUserMediaInput {
  key: string;
  role: UserMediaRole;
}

export interface ConfirmUserMediaResponse {
  url: string;
  key: string;
  role: UserMediaRole;
}

export interface ApiPlaylistItem {
  id: string;
  playlistId: string;
  contentId: string;
  position: number;
  addedAt: string;
  content: ApiContent;
}

export interface ApiPlaylist {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: ApiPlaylistItem[];
}

export interface ApiContentBucket {
  id: string;
  creatorId: string;
  type: ContentType;
  title: string;
  description?: string | null;
  coverArtUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  items: ApiContent[];
}

export interface CreateContentBucketInput {
  title: string;
  description?: string;
  type: ContentType;
  coverArtUrl?: string;
}

export type UpdateContentBucketInput = Partial<Omit<CreateContentBucketInput, "type">>;

export interface AdminStats {
  users: { total: number; premium: number };
  creators: { total: number };
  content: { total: number; published: number };
  applications: { pending: number };
  live: { active: number };
}

export interface AdminReviewApplicationInput {
  status: "APPROVED" | "REJECTED";
  displayName?: string;
  adminNotes?: string;
  declineReason?: string;
}

export interface AdminReviewApplicationResponse {
  reviewed: boolean;
  status: ApplicationStatus;
}

export interface AdminCreatorActivationInput {
  isActive: boolean;
}

export interface AdminAnalyticsRefreshResponse {
  refreshed: number;
}

export type ReportTargetType = "CONTENT";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export interface ApiReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string | null;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  resolvedById?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  reporter?: Pick<ApiUser, "id" | "name" | "email">;
  resolvedBy?: Pick<ApiUser, "id" | "name"> | null;
}

export interface CreateReportInput {
  targetId: string;
  reason: string;
  description?: string;
}

export interface ReviewReportInput {
  status: "RESOLVED" | "DISMISSED";
  resolutionNote?: string;
}

export type PlatformListType = "LANGUAGE" | "REGION";
export type GuidelineType = "CREATOR" | "COMMUNITY";

export interface ApiPlatformListItem {
  id: string;
  type: PlatformListType;
  name: string;
  code?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformListItemInput {
  name: string;
  code?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ApiNotificationTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateInput {
  key: string;
  name: string;
  subject: string;
  body: string;
  isActive?: boolean;
}

export interface ApiGuideline {
  id: string;
  type: GuidelineType;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuidelineInput {
  title: string;
  body: string;
}

export interface ApiPlatformAnnouncement {
  id: string;
  title: string;
  body: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAnnouncementInput {
  title: string;
  body: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

export type AnalyticsRange = "7d" | "30d" | "90d";

export interface ApiDailyAnalyticsPoint {
  date: string;
  totalPlays: number;
  totalViews: number;
  followersCount?: number;
}
