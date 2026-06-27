import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type { ApiLibrary, ApiPlaybackProgress } from "../types";

export interface UpdateProgressInput {
  contentId: string;
  progressSeconds: number;
  completed?: boolean;
}

export function useLibrary() {
  return useQuery({
    queryKey: queryKeys.library.current(),
    queryFn: () => apiRequest<ApiLibrary>("/api/library"),
  });
}

export function useSaveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => apiRequest(`/api/library/${contentId}`, { body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
}

export function useUnsaveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) =>
      apiRequest(`/api/library/${contentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProgressInput) =>
      apiRequest<ApiPlaybackProgress>("/api/library/progress", {
        method: "PUT",
        body: { completed: false, ...input },
      }),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library.current() });
      queryClient.invalidateQueries({ queryKey: queryKeys.library.progress(input.contentId) });
    },
  });
}

export function usePlaybackProgress(contentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.library.progress(contentId ?? ""),
    queryFn: () => apiRequest<ApiPlaybackProgress>(`/api/library/progress/${contentId}`),
    enabled: Boolean(contentId),
  });
}
