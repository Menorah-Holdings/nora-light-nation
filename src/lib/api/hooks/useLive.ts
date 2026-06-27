import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type { ApiLiveEvent, ListLiveEventsQuery } from "../types";

export function useLiveEvents(query?: ListLiveEventsQuery) {
  return useQuery({
    queryKey: queryKeys.live.list(query),
    queryFn: () => apiRequest<ApiLiveEvent[]>("/api/live", { query }),
  });
}

export function useActiveLiveEvents() {
  return useQuery({
    queryKey: queryKeys.live.active(),
    queryFn: () => apiRequest<ApiLiveEvent[]>("/api/live/active"),
  });
}

export function useLiveEventDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.live.detail(id ?? ""),
    queryFn: () => apiRequest<ApiLiveEvent>(`/api/live/${id}`),
    enabled: Boolean(id),
  });
}
