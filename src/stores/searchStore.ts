import { create } from "zustand"
import {
  DEFAULT_TIMEZONE,
  defaultPickupInTz,
  defaultDropoffInTz,
} from "@/lib/datetime"

// ─── ชนิดข้อมูล ────────────────────────────────────────────────────────────────

export interface SearchState {
  // ข้อมูลสาขารับรถ
  pickupBranchId: number | null
  pickupBranchName: string
  pickupCountryId: number | null

  // timezone ของสาขารับรถ (IANA เช่น "Asia/Bangkok")
  // ใช้สำหรับคำนวณวัน-เวลาทุกอย่างในโค้ด — ต้องตรงกับ backend
  pickupTimezone: string

  // ข้อมูลสาขาคืนรถ
  dropoffBranchId: number | null
  dropoffBranchName: string

  // toggle "คืนที่สาขาอื่น"
  differentDropoff: boolean

  // วัน-เวลารับและคืนรถ (ISO 8601 string พร้อม offset เช่น "2026-05-17T12:00:00+07:00")
  pickupDatetime: string
  dropoffDatetime: string
}

export interface SearchActions {
  // เลือกสาขารับรถ — รับ timezone ของประเทศมาด้วย
  // reset สาขาคืนถ้าประเทศเปลี่ยน
  setPickup: (
    branchId: number,
    branchName: string,
    countryId: number,
    timezone: string,
  ) => void

  // เลือกสาขาคืนรถ (ใช้เมื่อ differentDropoff เปิดอยู่)
  setDropoff: (branchId: number, branchName: string) => void

  // เปิด/ปิด toggle คืนคนละที่
  setDifferentDropoff: (value: boolean) => void

  // อัปเดตวันเวลา
  setPickupDatetime: (iso: string) => void
  setDropoffDatetime: (iso: string) => void

  // reset ทั้งหมด
  reset: () => void
}

// ─── ค่าเริ่มต้น ────────────────────────────────────────────────────────────────

const INITIAL_STATE: SearchState = {
  pickupBranchId: null,
  pickupBranchName: "",
  pickupCountryId: null,
  // ใช้ DEFAULT_TIMEZONE (Asia/Bangkok) เป็น fallback ก่อนที่ user จะเลือกสาขา
  pickupTimezone: DEFAULT_TIMEZONE,
  dropoffBranchId: null,
  dropoffBranchName: "",
  differentDropoff: false,
  // default datetime ตาม timezone เริ่มต้น (วันนี้ + 2 วันข้างหน้า เวลา 12:00)
  pickupDatetime: defaultPickupInTz(DEFAULT_TIMEZONE),
  dropoffDatetime: defaultDropoffInTz(DEFAULT_TIMEZONE),
}

// ─── Zustand store ─────────────────────────────────────────────────────────────

export const useSearchStore = create<SearchState & SearchActions>((set) => ({
  ...INITIAL_STATE,

  setPickup: (branchId, branchName, countryId, timezone) =>
    set((state) => {
      // ถ้าประเทศเปลี่ยนให้ reset dropoff เพื่อป้องกัน drop-off ข้ามประเทศ
      const countryChanged = state.pickupCountryId !== countryId
      return {
        pickupBranchId: branchId,
        pickupBranchName: branchName,
        pickupCountryId: countryId,
        pickupTimezone: timezone,
        dropoffBranchId: countryChanged ? null : state.dropoffBranchId,
        dropoffBranchName: countryChanged ? "" : state.dropoffBranchName,
      }
    }),

  setDropoff: (branchId, branchName) =>
    set({ dropoffBranchId: branchId, dropoffBranchName: branchName }),

  setDifferentDropoff: (value) =>
    set((state) => ({
      differentDropoff: value,
      // ปิด toggle → กลับมาใช้สาขาเดียวกับ pickup (null = ใช้ pickup)
      dropoffBranchId: value ? state.dropoffBranchId : null,
      dropoffBranchName: value ? state.dropoffBranchName : "",
    })),

  setPickupDatetime: (iso) => set({ pickupDatetime: iso }),

  setDropoffDatetime: (iso) => set({ dropoffDatetime: iso }),

  reset: () => set(INITIAL_STATE),
}))
