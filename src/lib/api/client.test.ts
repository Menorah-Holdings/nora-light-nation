import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "./auth";
import { apiRequest } from "./client";

const fetchMock = vi.fn();

describe("api clients", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unwraps app API envelopes and sends credentials", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          message: "Request successful",
          data: [{ id: "content-1" }],
          meta: { timestamp: "2026-06-27T00:00:00.000Z" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(apiRequest("/api/content")).resolves.toEqual([{ id: "content-1" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/content$/),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("throws typed app API errors from the standard envelope", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          message: "Validation failed",
          data: null,
          error: { code: "UNPROCESSABLE_ENTITY", details: [{ path: "email" }] },
          meta: { timestamp: "2026-06-27T00:00:00.000Z" },
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(apiRequest("/api/users/me")).rejects.toMatchObject({
      name: "ApiClientError",
      status: 422,
      code: "UNPROCESSABLE_ENTITY",
      message: "Validation failed",
    });
  });

  it("keeps Better Auth responses out of the app envelope parser", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: { id: "user-1", email: "listener@noraplus.io", name: "Listener" },
          session: { id: "session-1", userId: "user-1", expiresAt: "2026-07-04T00:00:00.000Z" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(authApi.getSession()).resolves.toMatchObject({
      user: { id: "user-1" },
      session: { id: "session-1" },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth\/get-session$/),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("throws typed Better Auth errors from native auth payloads", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "EMAIL_NOT_VERIFIED", message: "Email not verified" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      authApi.signInEmail({ email: "listener@noraplus.io", password: "password123" }),
    ).rejects.toMatchObject({
      name: "AuthClientError",
      status: 403,
      code: "EMAIL_NOT_VERIFIED",
      message: "Email not verified",
    });
  });
});


