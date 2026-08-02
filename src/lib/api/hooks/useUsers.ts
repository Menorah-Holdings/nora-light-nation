import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type { ApiActionResult, ApiSession, ApiUser, UpdateCurrentUserInput } from "../types";

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => apiRequest<ApiUser>("/api/users/me"),
    enabled,
    retry: false,
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCurrentUserInput) => apiRequest<ApiUser>("/api/users/me", { method: "PATCH", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
}

export function useUserSessions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.sessions(),
    queryFn: () => apiRequest<ApiSession[]>("/api/users/me/sessions"),
    enabled,
  });
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiRequest<ApiActionResult>(`/api/users/me/sessions/${sessionId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
    },
  });
}

export function useRevokeAllUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<ApiActionResult>("/api/users/me/sessions", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
}

export function useDeactivateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<ApiActionResult>("/api/users/me/deactivate", { body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<ApiActionResult>("/api/users/me", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
