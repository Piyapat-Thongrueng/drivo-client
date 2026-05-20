import { parseBookingId } from "@/lib/booking-id"

/**
 * Sanitize post-login / post-register redirects: same-origin absolute URLs only,
 * and never allow invalid `/payment/:id` (e.g. literal "undefined" from bad links).
 */
export function sanitizeInternalReturnUrl(
  raw: string | null | undefined,
  fallback: string,
): string {
  if (raw == null) return fallback
  const trimmed = raw.trim()
  if (trimmed === "") return fallback

  let path = trimmed

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed)
      if (typeof window === "undefined") return fallback
      if (u.origin !== window.location.origin) return fallback
      path = `${u.pathname}${u.search}${u.hash}`
    } catch {
      return fallback
    }
  }

  if (!path.startsWith("/")) return fallback

  const paymentMatch = path.match(/^\/payment\/([^/?#]+)(.*)$/)
  if (paymentMatch) {
    const segment = paymentMatch[1]
    const rest = paymentMatch[2] ?? ""
    const id = parseBookingId(segment)
    if (id == null) return "/my-account"
    return `/payment/${id}${rest}`
  }

  return path
}
