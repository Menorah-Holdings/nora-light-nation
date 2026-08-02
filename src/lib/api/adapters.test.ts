import { describe, expect, it } from "vitest";
import { adaptContent, adaptCreator, adaptCreatorAnalytics, adaptLiveEvent, formatCompactNumber, formatDuration } from "./adapters";
import type { ApiContent, ApiCreator, ApiLiveEvent } from "./types";

const baseContent: ApiContent = {
  id: "content-1",
  title: "Encountering Truth",
  type: "AUDIO",
  category: "SERMON",
  description: "A message",
  thumbnailUrl: null,
  durationSeconds: 2520,
  status: "PUBLISHED",
  visibility: "PUBLIC",
  isFeatured: true,
  createdAt: "2026-06-27T00:00:00.000Z",
  creator: {
    id: "creator-1",
    displayName: "Pastor David",
    avatarUrl: null,
    isVerified: true,
  },
};

describe("api adapters", () => {
  it("maps API content into the current ContentCard shape", () => {
    expect(adaptContent(baseContent)).toMatchObject({
      id: "content-1",
      title: "Encountering Truth",
      creator: "Pastor David",
      creatorId: "creator-1",
      type: "message",
      medium: "audio",
      duration: "42 min",
      tag: "Featured",
    });
  });

  it("uses category and tags to infer richer UI content labels", () => {
    expect(adaptContent({ ...baseContent, type: "VIDEO", mediaType: "VIDEO", category: "OTHER", isFeatured: false, tags: ["skit"] })).toMatchObject({
      type: "skit",
      medium: "video",
      tag: "Skit",
    });

    expect(adaptContent({ ...baseContent, id: "content-2", category: "WORSHIP", tags: [] })).toMatchObject({
      type: "music",
      medium: "audio",
    });

    expect(adaptContent({ ...baseContent, id: "content-3", type: "VIDEO", category: "PODCAST" })).toMatchObject({
      type: "podcast-video",
      medium: "video",
    });
  });

  it("prefers coverArtUrl for card artwork when present", () => {
    expect(
      adaptContent({
        ...baseContent,
        coverArtUrl: "https://cdn.example/cover.jpg",
        thumbnailUrl: "https://cdn.example/thumb.jpg",
      }).image,
    ).toBe("https://cdn.example/cover.jpg");
  });

  it("maps live event statuses into the current UI tabs", () => {
    const event: ApiLiveEvent = {
      id: "event-1",
      title: "Worship Night Lagos",
      scheduledAt: "2026-07-04T18:00:00.000Z",
      status: "LIVE",
      visibility: "PREMIUM_ONLY",
      viewerCount: 1204,
      createdAt: "2026-06-27T00:00:00.000Z",
      creator: { id: "creator-1", displayName: "Sounds of Heaven", avatarUrl: null },
    };

    expect(adaptLiveEvent(event)).toMatchObject({
      id: "event-1",
      host: "Sounds of Heaven",
      access: "Paid",
      status: "live",
      time: "Streaming",
    });
  });

  it("keeps expanded live statuses renderable in the existing tabs", () => {
    const event: ApiLiveEvent = {
      id: "event-2",
      title: "Revival Watch",
      scheduledAt: "2026-07-04T18:00:00.000Z",
      status: "UNDER_REVIEW",
      visibility: "PUBLIC",
      viewerCount: 0,
      createdAt: "2026-06-27T00:00:00.000Z",
    };

    expect(adaptLiveEvent(event)).toMatchObject({ status: "upcoming" });
    expect(adaptLiveEvent({ ...event, status: "CANCELLED" })).toMatchObject({ status: "upcoming" });
    expect(adaptLiveEvent({ ...event, status: "REJECTED" })).toMatchObject({ status: "upcoming" });
  });

  it("maps creator profile fields without dropping handle-based routing data", () => {
    const creator: ApiCreator = {
      id: "creator-1",
      creatorType: "INDIVIDUAL",
      displayName: "Ada Okafor",
      handle: "ada_okafor",
      category: "WORSHIP",
      isVerified: true,
      followerCount: 24800,
      bio: "Worship leader",
      avatarUrl: null,
      bannerUrl: "https://cdn.example/banner.jpg",
      socialLinkRows: [{ id: "social-1", platform: "YOUTUBE", url: "https://youtube.example/ada" }],
      contentCategories: [{ id: "category-1", category: "WORSHIP" }],
      createdAt: "2026-06-27T00:00:00.000Z",
    };

    expect(adaptCreator(creator)).toMatchObject({
      id: "creator-1",
      name: "Ada Okafor",
      handle: "ada_okafor",
      category: "Worship",
      followers: "24.8K",
      bio: "Worship leader",
      banner: "https://cdn.example/banner.jpg",
    });
  });

  it("maps creator analytics into stable card stats", () => {
    expect(
      adaptCreatorAnalytics({
        totalUploads: 12,
        publishedContent: 8,
        drafts: 4,
        followersCount: 1250,
        totalPlays: 248000,
        totalViews: 590000,
        upcomingLiveEvents: 3,
        updatedAt: "2026-07-09T00:00:00.000Z",
      }),
    ).toEqual(
      expect.arrayContaining([
        { label: "Uploads", value: "12", trend: "Total" },
        { label: "Followers", value: "1.3K", trend: "Audience" },
        { label: "Total plays", value: "248K", trend: "All time" },
      ]),
    );
  });

  it("formats shared display values", () => {
    expect(formatDuration(3660)).toBe("1h 01 min");
    expect(formatCompactNumber(248000)).toBe("248K");
  });
});
