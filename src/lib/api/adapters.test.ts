import { describe, expect, it } from "vitest";
import { adaptContent, adaptLiveEvent, formatCompactNumber, formatDuration } from "./adapters";
import type { ApiContent, ApiLiveEvent } from "./types";

describe("api adapters", () => {
  it("maps API content into the current ContentCard shape", () => {
    const content: ApiContent = {
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

    expect(adaptContent(content)).toMatchObject({
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
