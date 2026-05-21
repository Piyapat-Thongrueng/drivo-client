"use client"

import { formatCurrency } from "@/lib/currency"
import type { RevenueBreakdownRow } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardRevenueBreakdownTableProps {
  rows: RevenueBreakdownRow[]
  isLoading: boolean
}

export function DashboardRevenueBreakdownTable({
  rows,
  isLoading,
}: DashboardRevenueBreakdownTableProps): React.JSX.Element {
  const headers = [
    "Country",
    "Branch",
    "Currency",
    "Bookings",
    "Revenue",
  ]

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-brand-gray-900">
        Revenue by Country / Branch
      </h2>

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
                  colSpan={5}
                  className="px-4 py-10 text-center body-3 text-brand-gray-400"
                >
                  No breakdown data for this period.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={`${row.branchId}-${row.currency}`}
                  className="hover:bg-brand-gray-50"
                >
                  <td className="px-4 py-3 body-3 text-brand-gray-800">
                    {row.country}
                  </td>
                  <td className="px-4 py-3 body-3 font-medium text-brand-gray-900">
                    {row.branch}
                  </td>
                  <td className="px-4 py-3 body-3 text-brand-gray-700">
                    {row.currency}
                  </td>
                  <td className="px-4 py-3 body-3 text-brand-gray-700">
                    {row.bookings}
                  </td>
                  <td className="px-4 py-3 body-3 font-medium text-brand-gray-900 whitespace-nowrap">
                    {formatCurrency(row.revenue, row.currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
