import type { SearchState } from "@/stores/searchStore"

// ─── ชื่อ query parameter ────────────────────────────────────────────────────────

export const SEARCH_PARAM_KEYS = {
  pickupBranchId: "pickupBranchId",
  pickupBranchName: "pickupBranchName",
  dropoffBranchId: "dropoffBranchId",
  dropoffBranchName: "dropoffBranchName",
  pickupCountryId: "pickupCountryId",
  differentDropoff: "differentDropoff",
  pickupDatetime: "pickupDatetime",
  dropoffDatetime: "dropoffDatetime",
} as const

// ─── แปลง store → query string ──────────────────────────────────────────────────

export function serializeSearchParams(state: SearchState): string {
  const params = new URLSearchParams()

  if (state.pickupBranchId != null) {
    params.set(SEARCH_PARAM_KEYS.pickupBranchId, String(state.pickupBranchId))
  }
  if (state.pickupBranchName) {
    params.set(SEARCH_PARAM_KEYS.pickupBranchName, state.pickupBranchName)
  }
  if (state.pickupCountryId != null) {
    params.set(SEARCH_PARAM_KEYS.pickupCountryId, String(state.pickupCountryId))
  }
  if (state.dropoffBranchId != null) {
    params.set(SEARCH_PARAM_KEYS.dropoffBranchId, String(state.dropoffBranchId))
  }
  if (state.dropoffBranchName) {
    params.set(SEARCH_PARAM_KEYS.dropoffBranchName, state.dropoffBranchName)
  }
  params.set(SEARCH_PARAM_KEYS.differentDropoff, state.differentDropoff ? "1" : "0")
  params.set(SEARCH_PARAM_KEYS.pickupDatetime, state.pickupDatetime)
  params.set(SEARCH_PARAM_KEYS.dropoffDatetime, state.dropoffDatetime)

  return params.toString()
}

// ─── ชนิด parsed params ─────────────────────────────────────────────────────────

export interface ParsedSearchParams {
  pickupBranchId: number | null
  pickupBranchName: string
  pickupCountryId: number | null
  dropoffBranchId: number | null
  dropoffBranchName: string
  differentDropoff: boolean
  pickupDatetime: string
  dropoffDatetime: string
}

// ─── แปลง URLSearchParams / Record → parsed state ────────────────────────────────

export function parseSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ParsedSearchParams {
  // ฟังก์ชันช่วยดึงค่า string จาก params ทั้งสองแบบ
  function get(key: string): string | null {
    if (params instanceof URLSearchParams) {
      return params.get(key)
    }
    const val = params[key]
    if (Array.isArray(val)) return val[0] ?? null
    return val ?? null
  }

  const pickupBranchIdRaw = get(SEARCH_PARAM_KEYS.pickupBranchId)
  const pickupCountryIdRaw = get(SEARCH_PARAM_KEYS.pickupCountryId)
  const dropoffBranchIdRaw = get(SEARCH_PARAM_KEYS.dropoffBranchId)
  const differentDropoffRaw = get(SEARCH_PARAM_KEYS.differentDropoff)

  const now = new Date()
  const defaultPickup = (() => {
    const d = new Date(now)
    d.setHours(12, 0, 0, 0)
    return d.toISOString()
  })()
  const defaultDropoff = (() => {
    const d = new Date(now)
    d.setDate(d.getDate() + 2)
    d.setHours(12, 0, 0, 0)
    return d.toISOString()
  })()

  return {
    pickupBranchId: pickupBranchIdRaw ? Number(pickupBranchIdRaw) : null,
    pickupBranchName: get(SEARCH_PARAM_KEYS.pickupBranchName) ?? "",
    pickupCountryId: pickupCountryIdRaw ? Number(pickupCountryIdRaw) : null,
    dropoffBranchId: dropoffBranchIdRaw ? Number(dropoffBranchIdRaw) : null,
    dropoffBranchName: get(SEARCH_PARAM_KEYS.dropoffBranchName) ?? "",
    differentDropoff: differentDropoffRaw === "1",
    pickupDatetime: get(SEARCH_PARAM_KEYS.pickupDatetime) ?? defaultPickup,
    dropoffDatetime: get(SEARCH_PARAM_KEYS.dropoffDatetime) ?? defaultDropoff,
  }
}
