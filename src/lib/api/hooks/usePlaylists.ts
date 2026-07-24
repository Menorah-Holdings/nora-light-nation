import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type { ApiPlaylist } from "../types";

export function usePlaylists(enabled = true) {
  return useQuery({
    queryKey: queryKeys.playlists.list(),
    queryFn: () => apiRequest<ApiPlaylist[]>("/api/playlists"),
    enabled,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiRequest<ApiPlaylist>("/api/playlists", { method: "POST", body: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiRequest<ApiPlaylist>(`/api/playlists/${id}`, { method: "PATCH", body: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/playlists/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
    },
  });
}

export function useAddToPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, contentId }: { playlistId: string; contentId: string }) =>
      apiRequest(`/api/playlists/${playlistId}/items`, { method: "POST", body: { contentId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
    },
  });
}

export function useRemoveFromPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, contentId }: { playlistId: string; contentId: string }) =>
      apiRequest(`/api/playlists/${playlistId}/items/${contentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
    },
  });
}
