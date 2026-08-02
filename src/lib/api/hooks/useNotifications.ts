import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type { ApiMarkAllReadResult, ApiNotification } from "../types";

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => apiRequest<ApiNotification[]>("/api/notifications"),
    enabled,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiRequest<ApiNotification>(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<ApiMarkAllReadResult>("/api/notifications/read-all", { body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}
