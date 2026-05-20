"use client";

import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AdminBookingStatusBadge from "@/components/admin/bookings/AdminBookingStatusBadge";
import type { Booking } from "@/types/booking";
import { formatCurrency } from "@/lib/currency";
import { formatDatetimeInTz, DEFAULT_TIMEZONE } from "@/lib/datetime";

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  /** ชื่อรถ cache: carId → "Toyota Yaris" */
  carLabels: Record<number, string>;
  onView: (booking: Booking) => void;
}

export function BookingTable({
  bookings,
  isLoading,
  carLabels,
  onView,
}: BookingTableProps): React.JSX.Element {
  const headers = [
    "Reference",
    "Status",
    "Vehicle",
    "Pickup",
    "Return",
    "Total",
    "Actions",
  ];

  return (
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
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : bookings.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-12 text-center body-3 text-brand-gray-400"
              >
                No bookings found.
              </td>
            </tr>
          ) : (
            bookings.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-brand-gray-50 transition-colors cursor-pointer"
                onClick={() => onView(b)}
              >
                <td className="px-4 py-3 body-3 font-mono font-medium text-brand-gray-900 whitespace-nowrap">
                  {b.reference}
                </td>
                <td className="px-4 py-3">
                  <AdminBookingStatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3 body-3 text-brand-gray-700 max-w-[160px] truncate">
                  {carLabels[b.carId] ?? `Vehicle #${b.carId}`}
                </td>
                <td className="px-4 py-3 body-3 text-brand-gray-700 whitespace-nowrap">
                  {formatDatetimeInTz(b.pickupDatetime, DEFAULT_TIMEZONE)}
                </td>
                <td className="px-4 py-3 body-3 text-brand-gray-700 whitespace-nowrap">
                  {formatDatetimeInTz(b.dropoffDatetime, DEFAULT_TIMEZONE)}
                </td>
                <td className="px-4 py-3 body-3 font-medium text-brand-gray-900 whitespace-nowrap">
                  {b.totalAmount
                    ? formatCurrency(parseFloat(b.totalAmount), b.currencyCode)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    title="View details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(b);
                    }}
                    className="rounded-lg p-1.5 text-brand-gray-500 transition-colors hover:bg-brand-gray-100 hover:text-brand-gray-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
