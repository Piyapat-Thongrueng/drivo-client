"use client"

import { useState } from "react"
import { Eye, CheckCircle2, Loader2 } from "lucide-react"
import AdminBookingStatusBadge from "@/components/admin/bookings/AdminBookingStatusBadge"
import { formatCurrency } from "@/lib/currency"
import { approveBooking, getAdminBooking } from "@/lib/api/admin-bookings"
import type { DashboardRecentBooking } from "@/types/dashboard"
import type { Booking, BookingStatus } from "@/types/booking"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardRecentBookingsTableProps {
  rows: DashboardRecentBooking[]
  isLoading: boolean
  token: string
  onViewBooking: (booking: Booking) => void
  onActionDone: () => void
}

export function DashboardRecentBookingsTable({
  rows,
  isLoading,
  token,
  onViewBooking,
  onActionDone,
}: DashboardRecentBookingsTableProps): React.JSX.Element {
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleView(id: number): Promise<void> {
    try {
      const booking = await getAdminBooking(id, token)
      onViewBooking(booking)
    } catch {
      setActionError("Failed to load booking details.")
    }
  }

  async function handleApprove(id: number): Promise<void> {
    setApprovingId(id)
    setActionError(null)
    try {
      await approveBooking(id, token)
      onActionDone()
    } catch {
      setActionError("Failed to approve booking.")
    } finally {
      setApprovingId(null)
    }
  }

  const headers = [
    "Reference",
    "Customer",
    "Vehicle",
    "Branch",
    "Amount",
    "Status",
    "Actions",
  ]

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-brand-gray-900">
        Recent Bookings
      </h2>

      {actionError && (
        <p className="body-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
          {actionError}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-brand-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-brand-gray-100">
          <thead className="bg-brand-gray-50">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left body-3 font-semibold text-brand-gray-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {headers.map((h) => (
                    <td key={h} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center body-3 text-brand-gray-400"
                >
                  No recent bookings.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isPending = row.status === "pending_approval"
                const isApproving = approvingId === row.id

                return (
                  <tr key={row.id} className="hover:bg-brand-gray-50">
                    <td className="px-4 py-3 body-3 font-mono font-medium text-brand-gray-900">
                      {row.reference}
                    </td>
                    <td className="px-4 py-3 body-3 text-brand-gray-800 max-w-[140px] truncate">
                      {row.customerName}
                    </td>
                    <td className="px-4 py-3 body-3 text-brand-gray-700 max-w-[140px] truncate">
                      {row.carLabel}
                    </td>
                    <td className="px-4 py-3 body-3 text-brand-gray-700 max-w-[160px] truncate">
                      {row.pickupBranchName}
                    </td>
                    <td className="px-4 py-3 body-3 font-medium whitespace-nowrap">
                      {row.totalAmount
                        ? formatCurrency(
                            parseFloat(row.totalAmount),
                            row.currencyCode,
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <AdminBookingStatusBadge
                        status={row.status as BookingStatus}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="View details"
                          onClick={() => void handleView(row.id)}
                          className="rounded-lg p-1.5 text-brand-gray-500 hover:bg-brand-gray-100 hover:text-brand-gray-900"
                        >
                          <Eye className="h-4 w-4" aria-hidden />
                        </button>
                        {isPending && (
                          <button
                            type="button"
                            title="Approve"
                            disabled={isApproving}
                            onClick={() => void handleApprove(row.id)}
                            className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50"
                          >
                            {isApproving ? (
                              <Loader2
                                className="h-4 w-4 animate-spin"
                                aria-hidden
                              />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
