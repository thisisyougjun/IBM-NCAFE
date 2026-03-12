// Client-side helper for public (no-auth) endpoints.
// Tries BFF (/api/*) first, then falls back to direct backend call.

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE;

function normalizePath(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export async function fetchPublic(path: string, init?: RequestInit) {
  const normalized = normalizePath(path);
  const bffUrl = `/api${normalized}`;

  try {
    const res = await fetch(bffUrl, init);
    // If BFF is up but backend is down, the proxy returns 502/503. In that case, try direct backend.
    if (BACKEND_BASE && !res.ok && (res.status === 502 || res.status === 503)) {
      return fetch(`${BACKEND_BASE}${normalized}`, init);
    }
    return res;
  } catch (err) {
    if (!BACKEND_BASE) throw err;
    return fetch(`${BACKEND_BASE}${normalized}`, init);
  }
}

export function resolvePublicImageSrc(src?: string | null) {
  if (!src) return null;
  const apiImagePrefix = "/api/images/";

  if (/^https?:\/\//i.test(src)) {
    try {
      const url = new URL(src);
      const marker = "/images/";
      const index = url.pathname.indexOf(marker);
      if (index >= 0) {
        return `${apiImagePrefix}${url.pathname.slice(index + marker.length)}`;
      }
      return src;
    } catch {
      return src;
    }
  }

  const trimmed = src.replace(/^\/+/, "");
  if (trimmed.startsWith("api/images/")) return `/${trimmed}`;
  if (trimmed.startsWith("images/")) return `${apiImagePrefix}${trimmed.slice("images/".length)}`;
  return `${apiImagePrefix}${trimmed}`;
}
