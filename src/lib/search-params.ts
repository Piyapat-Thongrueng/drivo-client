import type { SearchState } from "@/stores/searchStore"
import { DEFAULT_TIMEZONE, defaultPickupInTz, defaultDropoffInTz } from "@/lib/datetime"

// ─── ชื่อ query parameter ────────────────────────────────────────────────────────

export const SEARCH_PARAM_KEYS = {
  pickupBranchId: "pickupBranchId",
  pickupBranchName: "pickupBranchName",
  dropoffBranchId: "dropoffBranchId",
  dropoffBranchName: "dropoffBranchName",
  pickupCountryId: "pickupCountryId",
  pickupTimezone: "pickupTimezone",
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
  // บันทึก timezone ของสาขาลง URL — จำเป็นสำหรับ refresh / แชร์ลิงก์
  if (state.pickupTimezone) {
    params.set(SEARCH_PARAM_KEYS.pickupTimezone, state.pickupTimezone)
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
  pickupTimezone: string
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
  // helper ดึงค่า string จาก params ทั้งสองแบบ
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
  const tz = get(SEARCH_PARAM_KEYS.pickupTimezone) || DEFAULT_TIMEZONE

  // ตรวจ ID ให้เป็น number จริง ป้องกัน NaN จาก URL ปลอม
  function parseId(raw: string | null): number | null {
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  return {
    pickupBranchId: parseId(pickupBranchIdRaw),
    pickupBranchName: get(SEARCH_PARAM_KEYS.pickupBranchName) ?? "",
    pickupCountryId: parseId(pickupCountryIdRaw),
    pickupTimezone: tz,
    dropoffBranchId: parseId(dropoffBranchIdRaw),
    dropoffBranchName: get(SEARCH_PARAM_KEYS.dropoffBranchName) ?? "",
    differentDropoff: differentDropoffRaw === "1",
    pickupDatetime: get(SEARCH_PARAM_KEYS.pickupDatetime) ?? defaultPickupInTz(tz),
    dropoffDatetime: get(SEARCH_PARAM_KEYS.dropoffDatetime) ?? defaultDropoffInTz(tz),
  }
}
