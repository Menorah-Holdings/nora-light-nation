import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type {
  AdminStats,
  AdminAnalyticsRefreshResponse,
  AdminCreatorActivationInput,
  AdminReviewApplicationInput,
  AdminReviewApplicationResponse,
  ApiContent,
  ApiCreator,
  ApiCreatorApplication,
  ApiLiveEvent,
  ApiUser,
  CreateContentInput,
  UpdateContentInput,
  UserRole,
  SubscriptionTier,
} from "../types";

type ApiQuery = Record<string, string | number | boolean | undefined>;

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => apiRequest<AdminStats>("/api/admin/stats"),
  });
}

export function useAdminUsers(query?: ApiQuery) {
  return useQuery({
    queryKey: queryKeys.admin.users(query),
    queryFn: () => apiRequest<ApiUser[]>("/api/admin/users", { query }),
  });
}

export function useAdminContent(query?: ApiQuery) {
  return useQuery({
    queryKey: queryKeys.admin.content(query),
    queryFn: () => apiRequest<ApiContent[]>("/api/admin/content", { query }),
  });
}

export function useAdminApplications(query?: ApiQuery) {
  return useQuery({
    queryKey: queryKeys.admin.applications(query),
    queryFn: () => apiRequest<ApiCreatorApplication[]>("/api/admin/applications", { query }),
  });
}

export function useReviewAdminApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminReviewApplicationInput }) =>
      apiRequest<AdminReviewApplicationResponse>(`/api/admin/applications/${id}`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.applications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateAdminCreatorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminCreatorActivationInput }) =>
      apiRequest<ApiCreator>(`/api/admin/creators/${id}/status`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.live.all });
    },
  });
}

export function useRefreshAdminAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<AdminAnalyticsRefreshResponse>("/api/admin/analytics/refresh", {
        body: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useCreateAdminContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContentInput) =>
      apiRequest<ApiContent>("/api/admin/content", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.content() });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
    },
  });
}

export function useUpdateAdminContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContentInput }) =>
      apiRequest<ApiContent>(`/api/admin/content/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.content() });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
    },
  });
}

export function useDeleteAdminContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/content/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.content() });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
    },
  });
}

export function useCreateAdminLiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      apiRequest<ApiLiveEvent>("/api/admin/live", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.live.all });
    },
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { status: "APPROVED" | "REJECTED"; displayName?: string; adminNotes?: string };
    }) => apiRequest(`/api/admin/applications/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.applications() });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { role?: UserRole; subscriptionTier?: SubscriptionTier; isActive?: boolean };
    }) => apiRequest<ApiUser>(`/api/admin/users/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
}

export function useUpdateAdminLiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      apiRequest<ApiLiveEvent>(`/api/admin/live/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.live.all });
    },
  });
}
