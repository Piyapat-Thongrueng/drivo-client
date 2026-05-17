import { create } from "zustand"

// ─── ชนิดข้อมูล ────────────────────────────────────────────────────────────────

export interface SearchState {
  // ข้อมูลสาขารับรถ
  pickupBranchId: number | null
  pickupBranchName: string
  pickupCountryId: number | null

  // ข้อมูลสาขาคืนรถ
  dropoffBranchId: number | null
  dropoffBranchName: string

  // toggle "คืนที่สาขาอื่น"
  differentDropoff: boolean

  // วัน-เวลารับและคืนรถ (ISO 8601 string)
  pickupDatetime: string
  dropoffDatetime: string
}

export interface SearchActions {
  // เลือกสาขารับรถ — reset สาขาคืนถ้าประเทศเปลี่ยน
  setPickup: (branchId: number, branchName: string, countryId: number) => void

  // เลือกสาขาคืนรถ (ใช้เมื่อ differentDropoff เปิดอยู่)
  setDropoff: (branchId: number, branchName: string) => void

  // เปิด/ปิด toggle คืนคนละที่
  // เมื่อปิด → dropoff กลับมาเป็นสาขาเดียวกับ pickup
  setDifferentDropoff: (value: boolean) => void

  // อัปเดตวันเวลา
  setPickupDatetime: (iso: string) => void
  setDropoffDatetime: (iso: string) => void

  // reset ทั้งหมด
  reset: () => void
}

// ─── ค่าเริ่มต้น ────────────────────────────────────────────────────────────────

function defaultPickupDatetime(): string {
  // วันนี้ เวลา 12:00 น.
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

function defaultDropoffDatetime(): string {
  // 2 วันข้างหน้า เวลา 12:00 น.
  const d = new Date()
  d.setDate(d.getDate() + 2)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

const INITIAL_STATE: SearchState = {
  pickupBranchId: null,
  pickupBranchName: "",
  pickupCountryId: null,
  dropoffBranchId: null,
  dropoffBranchName: "",
  differentDropoff: false,
  pickupDatetime: defaultPickupDatetime(),
  dropoffDatetime: defaultDropoffDatetime(),
}

// ─── Zustand store ─────────────────────────────────────────────────────────────

export const useSearchStore = create<SearchState & SearchActions>((set) => ({
  ...INITIAL_STATE,

  setPickup: (branchId, branchName, countryId) =>
    set((state) => {
      // ถ้าประเทศเปลี่ยนให้ reset dropoff เพื่อป้องกัน drop-off ข้ามประเทศ
      const countryChanged = state.pickupCountryId !== countryId
      return {
        pickupBranchId: branchId,
        pickupBranchName: branchName,
        pickupCountryId: countryId,
        dropoffBranchId: countryChanged ? null : state.dropoffBranchId,
        dropoffBranchName: countryChanged ? "" : state.dropoffBranchName,
      }
    }),

  setDropoff: (branchId, branchName) =>
    set({ dropoffBranchId: branchId, dropoffBranchName: branchName }),

  setDifferentDropoff: (value) =>
    set((state) => ({
      differentDropoff: value,
      // ปิด toggle → กลับมาใช้สาขาเดียวกับ pickup (dropoffBranchId = null หมายถึงใช้ pickup)
      dropoffBranchId: value ? state.dropoffBranchId : null,
      dropoffBranchName: value ? state.dropoffBranchName : "",
    })),

  setPickupDatetime: (iso) => set({ pickupDatetime: iso }),

  setDropoffDatetime: (iso) => set({ dropoffDatetime: iso }),

  reset: () => set(INITIAL_STATE),
}))
