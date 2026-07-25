import { describe, expect, it } from "vitest";
import { buildAdminReviewApplicationInput } from "./adminPayloads";
import type { ApiCreatorApplication } from "./types";

const application: ApiCreatorApplication = {
  id: "application-1",
  userId: "user-1",
  creatorType: "MINISTRY_ORGANIZATION",
  category: "SERMON",
  displayName: "Grace Chapel",
  requestedHandle: "grace_chapel",
  status: "PENDING",
  submittedAt: "2026-07-09T00:00:00.000Z",
};

describe("admin review payloads", () => {
  it("sends displayName when approving an application", () => {
    expect(buildAdminReviewApplicationInput(application, "APPROVED")).toEqual({
      status: "APPROVED",
      displayName: "Grace Chapel",
    });
  });

  it("sends a trimmed declineReason when rejecting an application", () => {
    expect(buildAdminReviewApplicationInput(application, "REJECTED", "  Needs more detail.  ")).toEqual({
      status: "REJECTED",
      declineReason: "Needs more detail.",
    });
  });
});
