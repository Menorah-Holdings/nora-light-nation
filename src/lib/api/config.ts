const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const apiBaseUrl = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
);

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function buildApiUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${apiBaseUrl}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        value.forEach((item) => appendQueryValue(url, key, item));
      } else {
        appendQueryValue(url, key, value);
      }
    }
  }

  return url.toString();
}

function appendQueryValue(url: URL, key: string, value: QueryValue): void {
  if (value === undefined || value === null || value === "") return;
  url.searchParams.append(key, String(value));
}
