import axios from "axios"
import type { Booking, BookingDetail, BookingStatus } from "@/types/booking"
import { normalizeBookingIdFromApi } from "@/lib/booking-id"
import { publicApiUrl } from "./base-url"

function withBookingId<T extends { id: unknown }>(row: T): T & { id: number } {
  const id = normalizeBookingIdFromApi(row.id)
  if (id == null) throw new Error("Booking response is missing a valid id")
  return { ...row, id }
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export interface ListAdminBookingsParams {
  status?: BookingStatus
  page?: number
  limit?: number
}

/** GET /api/admin/bookings — รายการจองทั้งหมด (super_admin) */
export async function listAdminBookings(
  params: ListAdminBookingsParams,
  token: string,
): Promise<Booking[]> {
  const query = new URLSearchParams()
  if (params.status) query.set("status", params.status)
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))

  const { data } = await axios.get<{ success: boolean; data: Booking[] }>(
    publicApiUrl(`/api/admin/bookings?${query.toString()}`),
    { headers: authHeader(token) },
  )
  return data.data.map((b) => withBookingId(b))
}

/** GET /api/bookings/:id — ดูรายละเอียด (admin เห็นได้) */
export async function getAdminBooking(id: number, token: string): Promise<BookingDetail> {
  const { data } = await axios.get<{ success: boolean; data: BookingDetail }>(
    publicApiUrl(`/api/bookings/${id}`),
    { headers: authHeader(token) },
  )
  return withBookingId(data.data) as BookingDetail
}

/** PATCH /api/admin/bookings/:id/approve — อนุมัติการจอง */
export async function approveBooking(id: number, token: string): Promise<Booking> {
  const { data } = await axios.patch<{ success: boolean; data: Booking }>(
    publicApiUrl(`/api/admin/bookings/${id}/approve`),
    {},
    { headers: authHeader(token) },
  )
  return withBookingId(data.data)
}

/** PATCH /api/admin/bookings/:id/reject — ปฏิเสธการจอง */
export async function rejectBooking(
  id: number,
  rejectionNote: string,
  token: string,
): Promise<Booking> {
  const { data } = await axios.patch<{ success: boolean; data: Booking }>(
    publicApiUrl(`/api/admin/bookings/${id}/reject`),
    { rejectionNote },
    { headers: authHeader(token) },
  )
  return withBookingId(data.data)
}
