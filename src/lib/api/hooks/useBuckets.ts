import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type { ApiContent, ApiContentBucket, CreateContentBucketInput, UpdateContentBucketInput } from "../types";

export function useBuckets() {
  return useQuery({
    queryKey: queryKeys.buckets.list(),
    queryFn: () => apiRequest<ApiContentBucket[]>("/api/buckets", { query: { limit: 50 } }),
  });
}

export function useBucket(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.buckets.detail(id ?? ""),
    queryFn: () => apiRequest<ApiContentBucket>(`/api/buckets/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateBucket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentBucketInput) =>
      apiRequest<ApiContentBucket>("/api/buckets", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.all });
    },
  });
}

export function useUpdateBucket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContentBucketInput }) =>
      apiRequest<ApiContentBucket>(`/api/buckets/${id}`, { method: "PATCH", body: input }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.detail(variables.id) });
    },
  });
}

export function useDeleteBucket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/buckets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useAddBucketItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, contentId }: { bucketId: string; contentId: string }) =>
      apiRequest<ApiContent>(`/api/buckets/${bucketId}/items`, { method: "POST", body: { contentId } }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.detail(variables.bucketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useRemoveBucketItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, contentId }: { bucketId: string; contentId: string }) =>
      apiRequest(`/api/buckets/${bucketId}/items/${contentId}`, { method: "DELETE" }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.detail(variables.bucketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useReorderBucketItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, contentId, position }: { bucketId: string; contentId: string; position: number }) =>
      apiRequest<ApiContent>(`/api/buckets/${bucketId}/items/${contentId}`, {
        method: "PATCH",
        body: { position },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets.detail(variables.bucketId) });
    },
  });
}
