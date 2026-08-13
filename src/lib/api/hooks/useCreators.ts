import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type {
  AnalyticsRange,
  ApiContent,
  ApiCreator,
  ApiCreatorAnalytics,
  ApiCreatorApplication,
  ApiDailyAnalyticsPoint,
  ApiLiveEvent,
  CreatorApplicationInput,
  CreatorProfileUpdateInput,
  CreateCreatorLiveEventInput,
  CreateContentInput,
  ListContentQuery,
  ListCreatorsQuery,
  ListLiveEventsQuery,
  UpdateContentInput,
  UpdateCreatorLiveEventInput,
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

export function useCreatorByHandle(handle: string | undefined) {
  return useQuery({
    queryKey: queryKeys.creators.handle(handle ?? ""),
    queryFn: () => apiRequest<ApiCreator>(`/api/creators/handle/${handle}`),
    enabled: Boolean(handle),
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

export function useMyFollowedCreators(query?: ListLiveEventsQuery) {
  return useQuery({
    queryKey: queryKeys.creators.myFollowing(query),
    queryFn: () => apiRequest<ApiCreator[]>("/api/creators/me/following", { query }),
  });
}

export function useMyDailyCreatorAnalytics(range: AnalyticsRange = "30d") {
  return useQuery({
    queryKey: queryKeys.creators.myAnalyticsDaily(range),
    queryFn: () => apiRequest<ApiDailyAnalyticsPoint[]>("/api/creators/me/analytics/daily", { query: { range } }),
  });
}

export function useMyCreatorApplication(enabled = true) {
  return useQuery({
    queryKey: queryKeys.creators.myApplication(),
    queryFn: () => apiRequest<ApiCreatorApplication | null>("/api/creators/me/application"),
    enabled,
  });
}

export function useMyCreatorProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.creators.myProfile(),
    queryFn: () => apiRequest<ApiCreator>("/api/creators/me/profile"),
    enabled,
  });
}

export function useMyCreatorAnalytics(enabled = true) {
  return useQuery({
    queryKey: queryKeys.creators.myAnalytics(),
    queryFn: () => apiRequest<ApiCreatorAnalytics>("/api/creators/me/analytics"),
    enabled,
  });
}

export function useSubmitCreatorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatorApplicationInput) =>
      apiRequest("/api/creators/apply", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.myApplication() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateMyCreatorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatorProfileUpdateInput) =>
      apiRequest<ApiCreator>("/api/creators/me/profile", {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.myProfile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useCreateOwnContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContentInput) =>
      apiRequest<ApiContent>("/api/creators/me/content", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
    },
  });
}

export function useUpdateOwnContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, input }: { contentId: string; input: UpdateContentInput }) =>
      apiRequest<ApiContent>(`/api/creators/me/content/${contentId}`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
    },
  });
}

export function useDeleteOwnContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) =>
      apiRequest(`/api/creators/me/content/${contentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
    },
  });
}

export function useOwnCreatorLiveEvents(query?: ListLiveEventsQuery) {
  return useQuery({
    queryKey: queryKeys.creators.ownLive(query),
    queryFn: () => apiRequest<ApiLiveEvent[]>("/api/creators/me/live", { query }),
  });
}

export function useCreateOwnLiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCreatorLiveEventInput) =>
      apiRequest<ApiLiveEvent>("/api/creators/me/live", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.live.all });
    },
  });
}

export function useUpdateOwnLiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCreatorLiveEventInput }) =>
      apiRequest<ApiLiveEvent>(`/api/creators/me/live/${id}`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.live.all });
    },
  });
}

export function useDeleteOwnLiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/creators/me/live/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.live.all });
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
