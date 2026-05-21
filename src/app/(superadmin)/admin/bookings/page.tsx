"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAdminBookings } from "@/hooks/useAdminBookings"
import { fetchCar } from "@/lib/api/cars"
import { BookingTable } from "@/components/admin/bookings/BookingTable"
import { BookingDetailDrawer } from "@/components/admin/bookings/BookingDetailDrawer"
import { Pagination } from "@/components/ui/Pagination"
import type { Booking, BookingStatus } from "@/types/booking"

const PAGE_SIZE = 15

const STATUS_OPTIONS: { value: BookingStatus | ""; label: string }[] = [
  { value: "",                 label: "All statuses" },
  { value: "pending_approval", label: "Awaiting approval" },
  { value: "pending_payment",  label: "Pending payment" },
  { value: "confirmed",        label: "Confirmed" },
  { value: "active",           label: "Active" },
  { value: "completed",        label: "Completed" },
  { value: "cancelled",        label: "Cancelled" },
  { value: "rejected",         label: "Rejected" },
]

export default function AllBookingsPage(): React.JSX.Element {
  const { session } = useAuth()
  const token = session?.access_token ?? ""

  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("")
  const [currentPage, setCurrentPage] = useState(1)

  const { bookings, isLoading, error, refetch } = useAdminBookings(token, {
    status: statusFilter || undefined,
    limit: 100,
  })

  const [carLabels, setCarLabels] = useState<Record<number, string>>({})
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  // Fetch car names
  useEffect(() => {
    if (bookings.length === 0) return
    const uniqueIds = [...new Set(bookings.map((b) => b.carId))]
    void Promise.all(
      uniqueIds.map(async (carId) => {
        if (carLabels[carId]) return
        try {
          const car = await fetchCar(carId)
          setCarLabels((prev) => ({ ...prev, [carId]: `${car.make} ${car.model}` }))
        } catch {
          setCarLabels((prev) => ({ ...prev, [carId]: `Vehicle #${carId}` }))
        }
      }),
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings])

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE))
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return bookings.slice(start, start + PAGE_SIZE)
  }, [bookings, currentPage])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-gray-900">All Bookings</h1>
          <p className="body-3 mt-0.5 text-brand-gray-500">
            Browse and inspect all customer bookings across every status.
          </p>
        </div>
        <span className="body-3 text-brand-gray-500">
          {isLoading ? "Loading…" : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="statusFilter" className="body-3 font-medium text-brand-gray-700 sr-only">
          Filter by status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")}
          className="rounded-lg border border-brand-gray-200 bg-white px-3 py-2 body-3 text-brand-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-red-200"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {statusFilter && (
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className="body-3 text-brand-gray-500 hover:text-brand-gray-800 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 body-3 text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <BookingTable
        bookings={paginatedBookings}
        isLoading={isLoading}
        carLabels={carLabels}
        onView={setSelectedBooking}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        token={token}
        onClose={() => setSelectedBooking(null)}
        onActionDone={() => {
          void refetch()
        }}
      />
    </div>
  )
}
