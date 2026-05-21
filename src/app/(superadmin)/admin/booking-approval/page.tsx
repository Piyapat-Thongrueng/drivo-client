"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAdminBookings } from "@/hooks/useAdminBookings"
import { fetchCar } from "@/lib/api/cars"
import { BookingTable } from "@/components/admin/bookings/BookingTable"
import { BookingDetailDrawer } from "@/components/admin/bookings/BookingDetailDrawer"
import { Pagination } from "@/components/ui/Pagination"
import type { Booking } from "@/types/booking"

const PAGE_SIZE = 15

export default function BookingApprovalPage(): React.JSX.Element {
  const { session } = useAuth()
  const token = session?.access_token ?? ""

  const { bookings, isLoading, error, refetch } = useAdminBookings(token, {
    status: "pending_approval",
    limit: 100,
  })

  const [carLabels, setCarLabels] = useState<Record<number, string>>({})
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch car names for all bookings
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
          <h1 className="text-2xl font-bold text-brand-gray-900">Booking Approval</h1>
          <p className="body-3 mt-0.5 text-brand-gray-500">
            Review and approve or reject pending booking requests.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
          <span className="body-3 font-semibold text-amber-800">
            {isLoading ? "…" : bookings.length} awaiting approval
          </span>
        </div>
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
