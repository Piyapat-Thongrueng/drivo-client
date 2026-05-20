/** Parse a positive integer booking id from route params or API values. */
export function parseBookingId(
  raw: string | string[] | undefined | null,
): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value == null || value === "" || value === "undefined" || value === "null") {
    return null
  }
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

/** Normalize booking id from API (number, bigint, or numeric string). */
export function normalizeBookingIdFromApi(raw: unknown): number | null {
  if (raw == null) return null
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.trunc(raw)
  }
  if (typeof raw === "bigint") return Number(raw)
  if (typeof raw === "string" && /^\d+$/.test(raw)) return parseInt(raw, 10)
  return null
}
