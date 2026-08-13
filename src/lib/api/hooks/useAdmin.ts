import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type {
  AdminStats,
  AdminAnalyticsRefreshResponse,
  AdminCreatorActivationInput,
  AdminReviewApplicationInput,
  AdminReviewApplicationResponse,
  AnalyticsRange,
  ApiContent,
  ApiDailyAnalyticsPoint,
  ApiCreator,
  ApiCreatorApplication,
  ApiGuideline,
  ApiLiveEvent,
  ApiNotificationTemplate,
  ApiPlatformAnnouncement,
  ApiPlatformListItem,
  ApiReport,
  ApiUser,
  CreateContentInput,
  GuidelineInput,
  GuidelineType,
  NotificationTemplateInput,
  PlatformAnnouncementInput,
  PlatformListItemInput,
  UpdateContentInput,
  ReviewReportInput,
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

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(id ?? ""),
    queryFn: () => apiRequest<ApiUser>(`/api/admin/users/${id}`),
    enabled: Boolean(id),
  });
}

export function useAdminContent(query?: ApiQuery) {
  return useQuery({
    queryKey: queryKeys.admin.content(query),
    queryFn: () => apiRequest<ApiContent[]>("/api/admin/content", { query }),
  });
}

export function useAdminLiveEvents(query?: ApiQuery) {
  return useQuery({
    queryKey: queryKeys.admin.live(query),
    queryFn: () => apiRequest<ApiLiveEvent[]>("/api/admin/live", { query }),
  });
}

export function useAdminReports(query?: ApiQuery) {
  return useQuery({
    queryKey: queryKeys.admin.reports(query),
    queryFn: () => apiRequest<ApiReport[]>("/api/reports", { query }),
  });
}

export function useReviewReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewReportInput }) =>
      apiRequest<ApiReport>(`/api/reports/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports() });
    },
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

export function useAdminDailyAnalytics(range: AnalyticsRange = "30d") {
  return useQuery({
    queryKey: queryKeys.admin.analyticsDaily(range),
    queryFn: () => apiRequest<ApiDailyAnalyticsPoint[]>("/api/admin/analytics/daily", { query: { range } }),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}

// ─── Platform Settings: Languages ──────────────────────────────────────────

export function useAdminLanguages() {
  return useQuery({
    queryKey: queryKeys.admin.languages(),
    queryFn: () => apiRequest<ApiPlatformListItem[]>("/api/admin/settings/languages"),
  });
}

export function useCreateAdminLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlatformListItemInput) =>
      apiRequest<ApiPlatformListItem>("/api/admin/settings/languages", { body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.languages() }),
  });
}

export function useUpdateAdminLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PlatformListItemInput> }) =>
      apiRequest<ApiPlatformListItem>(`/api/admin/settings/languages/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.languages() }),
  });
}

export function useDeleteAdminLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/settings/languages/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.languages() }),
  });
}

// ─── Platform Settings: Regions ────────────────────────────────────────────

export function useAdminRegions() {
  return useQuery({
    queryKey: queryKeys.admin.regions(),
    queryFn: () => apiRequest<ApiPlatformListItem[]>("/api/admin/settings/regions"),
  });
}

export function useCreateAdminRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlatformListItemInput) =>
      apiRequest<ApiPlatformListItem>("/api/admin/settings/regions", { body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.regions() }),
  });
}

export function useUpdateAdminRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PlatformListItemInput> }) =>
      apiRequest<ApiPlatformListItem>(`/api/admin/settings/regions/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.regions() }),
  });
}

export function useDeleteAdminRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/settings/regions/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.regions() }),
  });
}

// ─── Platform Settings: Notification Templates ─────────────────────────────

export function useAdminNotificationTemplates() {
  return useQuery({
    queryKey: queryKeys.admin.notificationTemplates(),
    queryFn: () => apiRequest<ApiNotificationTemplate[]>("/api/admin/settings/notification-templates"),
  });
}

export function useCreateAdminNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NotificationTemplateInput) =>
      apiRequest<ApiNotificationTemplate>("/api/admin/settings/notification-templates", { body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.notificationTemplates() }),
  });
}

export function useUpdateAdminNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<NotificationTemplateInput> }) =>
      apiRequest<ApiNotificationTemplate>(`/api/admin/settings/notification-templates/${id}`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.notificationTemplates() }),
  });
}

export function useDeleteAdminNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/settings/notification-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.notificationTemplates() }),
  });
}

// ─── Platform Settings: Guidelines ─────────────────────────────────────────

export function useAdminGuideline(type: GuidelineType) {
  return useQuery({
    queryKey: queryKeys.admin.guideline(type),
    queryFn: () =>
      apiRequest<ApiGuideline | null>(`/api/admin/settings/guidelines/${type.toLowerCase()}`),
  });
}

export function useUpsertAdminGuideline(type: GuidelineType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GuidelineInput) =>
      apiRequest<ApiGuideline>(`/api/admin/settings/guidelines/${type.toLowerCase()}`, {
        method: "PUT",
        body: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.guideline(type) }),
  });
}

// ─── Platform Settings: Announcements ──────────────────────────────────────

export function useAdminAnnouncements() {
  return useQuery({
    queryKey: queryKeys.admin.announcements(),
    queryFn: () => apiRequest<ApiPlatformAnnouncement[]>("/api/admin/settings/announcements"),
  });
}

export function useCreateAdminAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlatformAnnouncementInput) =>
      apiRequest<ApiPlatformAnnouncement>("/api/admin/settings/announcements", { body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements() }),
  });
}

export function useUpdateAdminAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PlatformAnnouncementInput> }) =>
      apiRequest<ApiPlatformAnnouncement>(`/api/admin/settings/announcements/${id}`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements() }),
  });
}

export function useDeleteAdminAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/settings/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements() }),
  });
}
