import axios from "axios"
import type {
  PickupHandoverPayload,
  ReturnHandoverPayload,
  HandoverWithPhotos,
  QueueBookingItem,
} from "@/types/handover"
import { publicApiUrl } from "./base-url"

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// ─── Branch info ──────────────────────────────────────────────────────────────

export interface BranchMe {
  branchId: number
  branchName: string
}

/** GET /api/branch/me — ดึงข้อมูลสาขาของ staff ที่ล็อกอิน */
export async function getBranchMe(token: string): Promise<BranchMe> {
  const { data } = await axios.get<{ success: boolean; data: BranchMe }>(
    publicApiUrl("/api/branch/me"),
    { headers: authHeader(token) },
  )
  return data.data
}

// ─── Queues ───────────────────────────────────────────────────────────────────

/** GET /api/branch/queues/pickup?search= — รายการรอส่งมอบรถ */
export async function getPickupQueue(
  token: string,
  search?: string,
): Promise<QueueBookingItem[]> {
  const params = search ? { search } : {}
  const { data } = await axios.get<{ success: boolean; data: QueueBookingItem[] }>(
    publicApiUrl("/api/branch/queues/pickup"),
    { headers: authHeader(token), params },
  )
  return data.data
}

/** GET /api/branch/queues/return?search= — รายการรอรับคืน */
export async function getReturnQueue(
  token: string,
  search?: string,
): Promise<QueueBookingItem[]> {
  const params = search ? { search } : {}
  const { data } = await axios.get<{ success: boolean; data: QueueBookingItem[] }>(
    publicApiUrl("/api/branch/queues/return"),
    { headers: authHeader(token), params },
  )
  return data.data
}

// ─── Booking detail (for handover form) ──────────────────────────────────────

export interface HandoverBookingDetail {
  bookingId: number
  reference: string
  customerFirstName: string
  customerLastName: string
  customerPhone: string | null
  carMake: string
  carModel: string
  carYear: number
  licensePlate: string
  pickupBranchName: string
  dropoffBranchName: string
  pickupDatetime: string
  dropoffDatetime: string
  depositAmount: string
  currencyCode: string
  addons: Array<{ name: string; totalPrice: string }>
  existingHandovers: HandoverWithPhotos[]
}

/** GET /api/branch/bookings/:id — ข้อมูล booking สำหรับฟอร์มส่งมอบ/รับคืน */
export async function getBranchBookingDetail(
  bookingId: number,
  token: string,
): Promise<HandoverBookingDetail> {
  const { data } = await axios.get<{ success: boolean; data: HandoverBookingDetail }>(
    publicApiUrl(`/api/branch/bookings/${bookingId}`),
    { headers: authHeader(token) },
  )
  return data.data
}

// ─── Handover actions ─────────────────────────────────────────────────────────

/** POST /api/branch/bookings/:id/pickup — ส่งมอบรถ */
export async function submitPickup(
  bookingId: number,
  payload: PickupHandoverPayload,
  token: string,
): Promise<HandoverWithPhotos> {
  const { data } = await axios.post<{ success: boolean; data: HandoverWithPhotos }>(
    publicApiUrl(`/api/branch/bookings/${bookingId}/pickup`),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}

/** POST /api/branch/bookings/:id/return — รับรถคืน */
export async function submitReturn(
  bookingId: number,
  payload: ReturnHandoverPayload,
  token: string,
): Promise<HandoverWithPhotos> {
  const { data } = await axios.post<{ success: boolean; data: HandoverWithPhotos }>(
    publicApiUrl(`/api/branch/bookings/${bookingId}/return`),
    payload,
    { headers: authHeader(token) },
  )
  return data.data
}
