/**
 * Origin of the Express app only (scheme + host + port), **without** `/api`.
 *
 * Set `NEXT_PUBLIC_API_URL` to e.g. `http://localhost:4000`.
 * If the value ends with `/api` (common mistake), we strip it so paths like
 * `/api/auth/login` are not doubled to `/api/api/auth/login` (which returns 404).
 */
export function getPublicApiBaseUrl(): string {
  let s = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (!s) {
    throw new Error("Missing NEXT_PUBLIC_API_URL");
  }
  s = s.replace(/\/+$/, "");
  if (/\/api$/i.test(s)) {
    s = s.replace(/\/api$/i, "").replace(/\/+$/, "");
  }
  return s;
}

/** Build a full URL. `path` should start with `/` (e.g. `/api/auth/login`). */
export function publicApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicApiBaseUrl()}${p}`;
}
