import { create } from "zustand"
import type { PricingPreviewResult } from "@/types/pricing"

// ─── ชนิดข้อมูลฟอร์ม ─────────────────────────────────────────────────────────────

export interface BookingFormData {
  firstName: string
  lastName: string
  email: string
  /** รหัสประเทศ เช่น "+66", "+44" */
  countryCode: string
  /** เลขโทรศัพท์ (ตัวเลข local ไม่รวม country code, ไม่เกิน 10 หลัก) */
  phone: string
}

// ─── State ────────────────────────────────────────────────────────────────────────

export interface BookingState {
  selectedAddonIds: number[]
  form: BookingFormData
  pricingPreview: PricingPreviewResult | null
}

// ─── Actions ─────────────────────────────────────────────────────────────────────

export interface BookingActions {
  toggleAddon: (addonId: number) => void
  setSelectedAddonIds: (ids: number[]) => void
  setFormField: <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => void
  setForm: (form: Partial<BookingFormData>) => void
  setPricingPreview: (preview: PricingPreviewResult | null) => void
  reset: () => void
  /** บันทึก state ลง sessionStorage ก่อนไป login (guest flow) */
  persistToSession: () => void
  /** โหลด state จาก sessionStorage หลังกลับมาจาก login */
  hydrateFromSession: () => boolean
}

// ─── ค่าเริ่มต้น ──────────────────────────────────────────────────────────────────

const INITIAL_FORM: BookingFormData = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+66",
  phone: "",
}

const INITIAL_STATE: BookingState = {
  selectedAddonIds: [],
  form: INITIAL_FORM,
  pricingPreview: null,
}

const SESSION_KEY = "drivo_booking_draft"

// ─── Store ────────────────────────────────────────────────────────────────────────

export const useBookingStore = create<BookingState & BookingActions>((set, get) => ({
  ...INITIAL_STATE,

  toggleAddon: (addonId) =>
    set((state) => ({
      selectedAddonIds: state.selectedAddonIds.includes(addonId)
        ? state.selectedAddonIds.filter((id) => id !== addonId)
        : [...state.selectedAddonIds, addonId],
    })),

  setSelectedAddonIds: (ids) => set({ selectedAddonIds: ids }),

  setFormField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),

  setForm: (partial) =>
    set((state) => ({ form: { ...state.form, ...partial } })),

  setPricingPreview: (preview) => set({ pricingPreview: preview }),

  reset: () => set(INITIAL_STATE),

  persistToSession: () => {
    try {
      const { selectedAddonIds, form } = get()
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ selectedAddonIds, form }))
    } catch {
      /* sessionStorage ไม่พร้อม (เช่น SSR) — ข้ามไป */
    }
  },

  hydrateFromSession: () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return false
      const saved = JSON.parse(raw) as Partial<BookingState>
      set((state) => ({
        selectedAddonIds: saved.selectedAddonIds ?? state.selectedAddonIds,
        form: saved.form ? { ...state.form, ...saved.form } : state.form,
      }))
      sessionStorage.removeItem(SESSION_KEY)
      return true
    } catch {
      return false
    }
  },
}))
