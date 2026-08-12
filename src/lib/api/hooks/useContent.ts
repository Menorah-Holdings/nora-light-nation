import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type { ApiContent, ApiHomeFeed, ApiPlayback, ListContentQuery } from "../types";

export function useContentList(query?: ListContentQuery) {
  return useQuery({
    queryKey: queryKeys.content.list(query),
    queryFn: () => apiRequest<ApiContent[]>("/api/content", { query }),
  });
}

export function useFeaturedContent() {
  return useQuery({
    queryKey: queryKeys.content.featured(),
    queryFn: () => apiRequest<ApiContent[]>("/api/content/featured"),
  });
}

export function useContentHome() {
  return useQuery({
    queryKey: queryKeys.content.home(),
    queryFn: () => apiRequest<ApiHomeFeed>("/api/content/home"),
  });
}

export function useContentDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.content.detail(id ?? ""),
    queryFn: () => apiRequest<ApiContent>(`/api/content/${id}`),
    enabled: Boolean(id),
  });
}

export function useContentPlayback(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.content.playback(id ?? ""),
    queryFn: () => apiRequest<ApiPlayback>(`/api/content/${id}/playback`),
    enabled: Boolean(id),
    retry: false,
  });
}
