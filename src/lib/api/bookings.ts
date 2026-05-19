import axios from "axios"
import type { Booking, BookingDetail, CreateBookingPayload } from "@/types/booking"
import { publicApiUrl } from "./base-url"

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
  return data.data
}

/** GET /api/bookings/:id — ดูรายละเอียดการจอง (owner หรือ admin) */
export async function getBooking(id: number, token: string): Promise<BookingDetail> {
  const { data } = await axios.get<{ success: boolean; data: BookingDetail }>(
    publicApiUrl(`/api/bookings/${id}`),
    { headers: authHeader(token) },
  )
  return data.data
}

/** GET /api/bookings — รายการจองของ user ที่ login */
export async function listMyBookings(token: string): Promise<Booking[]> {
  const { data } = await axios.get<{ success: boolean; data: Booking[] }>(
    publicApiUrl("/api/bookings"),
    { headers: authHeader(token) },
  )
  return data.data
}

/** POST /api/bookings/:id/checkout-session — สร้าง Stripe Checkout Session */
export async function createCheckoutSession(
  bookingId: number,
  successUrl: string,
  cancelUrl: string,
  token: string,
): Promise<string> {
  const { data } = await axios.post<{ success: boolean; data: { url: string } }>(
    publicApiUrl(`/api/bookings/${bookingId}/checkout-session`),
    { successUrl, cancelUrl },
    { headers: authHeader(token) },
  )
  return data.data.url
}

/** PATCH /api/bookings/:id/cancel — ลูกค้ายกเลิกการจอง */
export async function cancelBooking(id: number, token: string): Promise<Booking> {
  const { data } = await axios.patch<{ success: boolean; data: Booking }>(
    publicApiUrl(`/api/bookings/${id}/cancel`),
    {},
    { headers: authHeader(token) },
  )
  return data.data
}
