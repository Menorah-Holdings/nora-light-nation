import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type {
  ApiContent,
  ApiCreator,
  CreatorApplicationInput,
  ListContentQuery,
  ListCreatorsQuery,
} from "../types";

export function useCreatorsList(query?: ListCreatorsQuery) {
  return useQuery({
    queryKey: queryKeys.creators.list(query),
    queryFn: () => apiRequest<ApiCreator[]>("/api/creators", { query }),
  });
}

export function useCreatorDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.creators.detail(id ?? ""),
    queryFn: () => apiRequest<ApiCreator>(`/api/creators/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreatorContent(id: string | undefined, query?: ListContentQuery) {
  return useQuery({
    queryKey: queryKeys.creators.content(id ?? "", query),
    queryFn: () => apiRequest<ApiContent[]>(`/api/creators/${id}/content`, { query }),
    enabled: Boolean(id),
  });
}

export function useOwnCreatorContent(query?: ListContentQuery) {
  return useQuery({
    queryKey: queryKeys.creators.ownContent(query),
    queryFn: () => apiRequest<ApiContent[]>("/api/creators/me/content", { query }),
  });
}

export function useSubmitCreatorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatorApplicationInput) =>
      apiRequest("/api/creators/apply", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useFollowCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (creatorId: string) =>
      apiRequest(`/api/creators/${creatorId}/follow`, { body: {} }),
    onSuccess: (_data, creatorId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.detail(creatorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useUnfollowCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (creatorId: string) =>
      apiRequest(`/api/creators/${creatorId}/follow`, { method: "DELETE" }),
    onSuccess: (_data, creatorId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.detail(creatorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}
