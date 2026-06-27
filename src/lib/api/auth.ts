import { buildApiUrl, type QueryParams } from "./config";
import type { ApiUser } from "./types";

export interface AuthRequestOptions {
  method?: "GET" | "POST";
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export class AuthClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor({
    message,
    status,
    code,
    details,
  }: {
    message: string;
    status: number;
    code: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "AuthClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface AuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt?: string;
    updatedAt?: string;
  };
  user: ApiUser;
}

export interface SignUpEmailInput {
  name: string;
  email: string;
  password: string;
  image?: string;
  callbackURL?: string;
  rememberMe?: boolean;
}

export interface SignInEmailInput {
  email: string;
  password: string;
  callbackURL?: string;
  rememberMe?: boolean;
}

export interface SocialSignInInput {
  provider: "google" | "apple";
  callbackURL?: string;
  errorCallbackURL?: string;
  newUserCallbackURL?: string;
  disableRedirect?: boolean;
}

export interface AuthUserResponse {
  token?: string | null;
  redirect?: boolean;
  url?: string;
  user?: ApiUser;
}

export interface VerifyEmailOtpInput {
  email: string;
  otp: string;
}

export interface SendVerificationOtpInput {
  email: string;
  type?: "email-verification" | "sign-in" | "forget-password" | "change-email";
}

export interface ResetPasswordInput {
  token?: string;
  newPassword: string;
}

export interface ResetPasswordOtpInput {
  email: string;
  otp: string;
  password: string;
}

export const authApi = {
  getSession: () => authRequest<AuthSession | null>("/get-session"),
  signUpEmail: (body: SignUpEmailInput) =>
    authRequest<AuthUserResponse>("/sign-up/email", { body }),
  signInEmail: (body: SignInEmailInput) =>
    authRequest<AuthUserResponse>("/sign-in/email", { body }),
  signInSocial: (body: SocialSignInInput) =>
    authRequest<AuthUserResponse>("/sign-in/social", { body }),
  signOut: () => authRequest<{ success?: boolean }>("/sign-out", { body: {} }),
  sendVerificationOtp: (body: SendVerificationOtpInput) =>
    authRequest<{ success: boolean }>("/email-otp/send-verification-otp", {
      body: { type: "email-verification", ...body },
    }),
  verifyEmailOtp: (body: VerifyEmailOtpInput) =>
    authRequest<AuthUserResponse & { status?: boolean }>("/email-otp/verify-email", { body }),
  requestPasswordReset: (email: string, redirectTo?: string) =>
    authRequest<{ status?: boolean; message?: string }>("/request-password-reset", {
      body: { email, redirectTo },
    }),
  requestPasswordResetOtp: (email: string) =>
    authRequest<{ success: boolean }>("/email-otp/request-password-reset", {
      body: { email },
    }),
  resetPassword: (body: ResetPasswordInput) =>
    authRequest<{ status: boolean }>("/reset-password", { body }),
  resetPasswordOtp: (body: ResetPasswordOtpInput) =>
    authRequest<{ success: boolean }>("/email-otp/reset-password", { body }),
};

export async function authRequest<T>(
  path: string,
  options: AuthRequestOptions = {},
): Promise<T> {
  const response = await fetch(buildApiUrl(`/api/auth${path}`, options.query), {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    credentials: "include",
    headers: buildHeaders(options.body, options.headers),
    body: serializeBody(options.body),
    signal: options.signal,
  });

  const payload = await parseJson<unknown>(response);

  if (!response.ok) {
    throw new AuthClientError({
      message: extractAuthMessage(payload, response.statusText || "Authentication request failed"),
      status: response.status,
      code: extractAuthCode(payload),
      details: payload,
    });
  }

  return payload as T;
}

function buildHeaders(body: unknown, headers?: HeadersInit): HeadersInit {
  const next = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData) && !next.has("Content-Type")) {
    next.set("Content-Type", "application/json");
  }

  return next;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  if (body instanceof Blob) return body;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function extractAuthMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    if (
      typeof record.error === "object" &&
      record.error !== null &&
      typeof (record.error as Record<string, unknown>).message === "string"
    ) {
      return (record.error as Record<string, string>).message;
    }
  }

  return fallback;
}

function extractAuthCode(payload: unknown): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (typeof record.code === "string") return record.code;
    if (
      typeof record.error === "object" &&
      record.error !== null &&
      typeof (record.error as Record<string, unknown>).code === "string"
    ) {
      return (record.error as Record<string, string>).code;
    }
  }

  return "AUTH_ERROR";
}
