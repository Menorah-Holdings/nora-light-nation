import { buildApiUrl, type QueryParams } from "./config";

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiMeta {
  timestamp: string;
  pagination?: ApiPaginationMeta;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorPayload {
  code: string;
  details?: unknown;
  stack?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export type ApiEnvelope<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;
  response?: ApiErrorResponse;

  constructor({
    message,
    status,
    code,
    details,
    response,
  }: {
    message: string;
    status: number;
    code: string;
    details?: unknown;
    response?: ApiErrorResponse;
  }) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.response = response;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await apiRequestEnvelope<T>(path, options);
  return response.data;
}

export async function apiRequestEnvelope<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(buildApiUrl(path, options.query), {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    credentials: "include",
    headers: buildHeaders(options.body, options.headers),
    body: serializeBody(options.body),
    signal: options.signal,
  });

  const payload = await parseJson<ApiEnvelope<T>>(response);

  if (!response.ok) {
    if (isApiErrorResponse(payload)) {
      throw new ApiClientError({
        message: payload.message,
        status: response.status,
        code: payload.error.code,
        details: payload.error.details,
        response: payload,
      });
    }

    throw new ApiClientError({
      message: response.statusText || "Request failed",
      status: response.status,
      code: "HTTP_ERROR",
    });
  }

  if (!isApiSuccessResponse<T>(payload)) {
    throw new ApiClientError({
      message: "Unexpected API response shape",
      status: response.status,
      code: "INVALID_RESPONSE",
      details: payload,
    });
  }

  return payload;
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

function isApiSuccessResponse<T>(value: unknown): value is ApiSuccessResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { success?: unknown }).success === true &&
    "data" in value
  );
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { success?: unknown }).success === false &&
    typeof (value as { message?: unknown }).message === "string" &&
    typeof (value as { error?: { code?: unknown } }).error?.code === "string"
  );
}
