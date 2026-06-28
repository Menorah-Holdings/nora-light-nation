import { describe, expect, it } from "vitest";
import { adaptContent, adaptLiveEvent, formatCompactNumber, formatDuration } from "./adapters";
import type { ApiContent, ApiLiveEvent } from "./types";

const baseContent: ApiContent = {
  id: "content-1",
  title: "Encountering Truth",
  type: "AUDIO",
  category: "SERMON",
  description: "A message",
  thumbnailUrl: null,
  durationSeconds: 2520,
  isPremium: false,
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
    expect(adaptContent({ ...baseContent, type: "VIDEO", category: "OTHER", isFeatured: false, tags: ["skit"] })).toMatchObject({
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

  it("maps live event statuses into the current UI tabs", () => {
    const event: ApiLiveEvent = {
      id: "event-1",
      title: "Worship Night Lagos",
      scheduledAt: "2026-07-04T18:00:00.000Z",
      status: "LIVE",
      viewerCount: 1204,
      isPremium: true,
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

  it("formats shared display values", () => {
    expect(formatDuration(3660)).toBe("1h 01 min");
    expect(formatCompactNumber(248000)).toBe("248K");
  });
});

