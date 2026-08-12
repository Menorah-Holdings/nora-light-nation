import type { ListContentQuery, ListCreatorsQuery, ListLiveEventsQuery } from "./types";

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
    sessions: () => [...queryKeys.users.all, "sessions"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
  },
  content: {
    all: ["content"] as const,
    list: (query?: ListContentQuery) => [...queryKeys.content.all, "list", query ?? {}] as const,
    home: () => [...queryKeys.content.all, "home"] as const,
    featured: () => [...queryKeys.content.all, "featured"] as const,
    detail: (id: string) => [...queryKeys.content.all, "detail", id] as const,
    playback: (id: string) => [...queryKeys.content.all, "playback", id] as const,
  },
  creators: {
    all: ["creators"] as const,
    list: (query?: ListCreatorsQuery) => [...queryKeys.creators.all, "list", query ?? {}] as const,
    detail: (id: string) => [...queryKeys.creators.all, "detail", id] as const,
    handle: (handle: string) => [...queryKeys.creators.all, "handle", handle] as const,
    content: (id: string, query?: ListContentQuery) => [...queryKeys.creators.all, "content", id, query ?? {}] as const,
    myApplication: () => [...queryKeys.creators.all, "me", "application"] as const,
    myProfile: () => [...queryKeys.creators.all, "me", "profile"] as const,
    myAnalytics: () => [...queryKeys.creators.all, "me", "analytics"] as const,
    ownContent: (query?: ListContentQuery) => [...queryKeys.creators.all, "me", "content", query ?? {}] as const,
    ownLive: (query?: ListLiveEventsQuery) => [...queryKeys.creators.all, "me", "live", query ?? {}] as const,
  },
  live: {
    all: ["live"] as const,
    list: (query?: ListLiveEventsQuery) => [...queryKeys.live.all, "list", query ?? {}] as const,
    active: () => [...queryKeys.live.all, "active"] as const,
    detail: (id: string) => [...queryKeys.live.all, "detail", id] as const,
    join: (id: string) => [...queryKeys.live.all, "join", id] as const,
  },
  library: {
    all: ["library"] as const,
    current: () => [...queryKeys.library.all, "current"] as const,
    progress: (contentId: string) => [...queryKeys.library.all, "progress", contentId] as const,
  },
  playlists: {
    all: ["playlists"] as const,
    list: () => [...queryKeys.playlists.all, "list"] as const,
    detail: (id: string) => [...queryKeys.playlists.all, "detail", id] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    users: (query?: Record<string, unknown>) => [...queryKeys.admin.all, "users", query ?? {}] as const,
    content: (query?: Record<string, unknown>) => [...queryKeys.admin.all, "content", query ?? {}] as const,
    applications: (query?: Record<string, unknown>) => [...queryKeys.admin.all, "applications", query ?? {}] as const,
    analytics: () => [...queryKeys.admin.all, "analytics"] as const,
  },
};
