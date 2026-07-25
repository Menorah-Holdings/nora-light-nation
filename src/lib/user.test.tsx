import { describe, expect, it } from "vitest";
import { mapApiUser } from "./user";
import type { ApiCreatorApplication, ApiUser } from "./api/types";

const apiUser: ApiUser = {
  id: "user-1",
  email: "ada@example.com",
  name: "Ada Okafor",
  role: "USER",
};

const rejectedApplication: ApiCreatorApplication = {
  id: "application-1",
  userId: "user-1",
  creatorType: "INDIVIDUAL",
  category: "WORSHIP",
  displayName: "Ada Okafor",
  requestedHandle: "ada",
  status: "REJECTED",
  adminNotes: "Legacy note",
  declineReason: "Please clarify rights ownership.",
  submittedAt: "2026-07-09T00:00:00.000Z",
};

describe("user lifecycle mapping", () => {
  it("prefers API creatorStatus over role-derived creator lifecycle", () => {
    expect(mapApiUser({ ...apiUser, creatorStatus: "APPROVED" }, null)).toMatchObject({
      role: "USER",
      creator_status: "Approved",
    });

    expect(mapApiUser({ ...apiUser, role: "CREATOR", creatorStatus: "PENDING" }, null)).toMatchObject({
      role: "CREATOR",
      creator_status: "Under Review",
    });
  });

  it("uses declineReason for rejected application copy", () => {
    expect(mapApiUser({ ...apiUser, creatorStatus: "DECLINED" }, rejectedApplication)).toMatchObject({
      creator_status: "Rejected",
      rejectionReason: "Please clarify rights ownership.",
    });
  });
});
