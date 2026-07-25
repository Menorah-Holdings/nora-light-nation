import type { AdminReviewApplicationInput, ApiCreatorApplication } from "./types";

export function buildAdminReviewApplicationInput(
  application: Pick<ApiCreatorApplication, "displayName">,
  status: AdminReviewApplicationInput["status"],
  declineReason?: string,
): AdminReviewApplicationInput {
  if (status === "APPROVED") {
    return {
      status,
      displayName: application.displayName,
    };
  }

  return {
    status,
    declineReason: declineReason?.trim(),
  };
}
