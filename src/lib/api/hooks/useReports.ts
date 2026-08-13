import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../client";
import type { ApiReport, CreateReportInput } from "../types";

export function useCreateReport() {
  return useMutation({
    mutationFn: (input: CreateReportInput) => apiRequest<ApiReport>("/api/reports", { body: input }),
  });
}
