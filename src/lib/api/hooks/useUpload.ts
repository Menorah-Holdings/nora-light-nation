import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../client";
import { queryKeys } from "../queryKeys";
import type {
  ConfirmUploadInput,
  ConfirmUploadResponse,
  PresignUploadInput,
  PresignUploadResponse,
} from "../types";

export function usePresignUpload() {
  return useMutation({
    mutationFn: (input: PresignUploadInput) =>
      apiRequest<PresignUploadResponse>("/api/upload/presign", { body: input }),
  });
}

export function useConfirmUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmUploadInput) =>
      apiRequest<ConfirmUploadResponse>("/api/upload/confirm", { body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all });
    },
  });
}

export async function uploadFileToPresignedUrl(file: File, uploadUrl: string) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Upload failed. Please try again.");
  }
}
