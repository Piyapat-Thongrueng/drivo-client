import axios from "axios"
import type { Booking, BookingDetail, CreateBookingPayload } from "@/types/booking"
import { normalizeBookingIdFromApi } from "@/lib/booking-id"
import { publicApiUrl } from "./base-url"

function withBookingId<T extends { id: unknown }>(row: T): T & { id: number } {
  const id = normalizeBookingIdFromApi(row.id)
  if (id == null) {
    throw new Error("Booking response is missing a valid id")
  }
  return { ...row, id }
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

/** POST /api/bookings — สร้างการจองใหม่ (status → pending_approval) */
export async function createBooking(
  payload: CreateBookingPayload,
  token: string,
): Promise<Booking> {
  const { data } = await axios.post<{ success: boolean; data: Booking }>(
    publicApiUrl("/api/bookings"),
    payload,
    { headers: authHeader(token) },
  )
  return withBookingId(data.data)
}

/** GET /api/bookings/:id — ดูรายละเอียดการจอง (owner หรือ admin) */
export async function getBooking(id: number, token: string): Promise<BookingDetail> {
  const { data } = await axios.get<{ success: boolean; data: BookingDetail }>(
    publicApiUrl(`/api/bookings/${id}`),
    { headers: authHeader(token) },
  )
  return withBookingId(data.data) as BookingDetail
}

/** GET /api/bookings — รายการจองของ user ที่ login */
export async function listMyBookings(token: string): Promise<Booking[]> {
  const { data } = await axios.get<{ success: boolean; data: Booking[] }>(
    publicApiUrl("/api/bookings"),
    { headers: authHeader(token) },
  )
  return data.data.map((b) => withBookingId(b))
}

/** POST /api/bookings/:id/checkout-session — สร้าง Stripe Checkout Session */
export async function createCheckoutSession(
  bookingId: number,
  successUrl: string,
  cancelUrl: string,
  token: string,
): Promise<string> {
  const { data } = await axios.post<{ success: boolean; data: { sessionUrl: string; sessionId: string } }>(
    publicApiUrl(`/api/bookings/${bookingId}/checkout-session`),
    { successUrl, cancelUrl },
    { headers: authHeader(token) },
  )
  return data.data.sessionUrl
}

/** PATCH /api/bookings/:id/cancel — ลูกค้ายกเลิกการจอง */
export async function cancelBooking(id: number, token: string): Promise<Booking> {
  const { data } = await axios.patch<{ success: boolean; data: Booking }>(
    publicApiUrl(`/api/bookings/${id}/cancel`),
    {},
    { headers: authHeader(token) },
  )
  return withBookingId(data.data)
}
