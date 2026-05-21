"use client"

import type { FleetByBranchRow } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardFleetByBranchTableProps {
  rows: FleetByBranchRow[]
  isLoading: boolean
}

export function DashboardFleetByBranchTable({
  rows,
  isLoading,
}: DashboardFleetByBranchTableProps): React.JSX.Element {
  const headers = [
    "Branch",
    "Total",
    "Available",
    "Booked",
    "Maintenance",
  ]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-gray-900">
          Cars per Branch
        </h2>
        <p className="body-3 text-brand-gray-500">
          Fleet distribution by current location — useful for one-way imbalance.
        </p>
      </div>

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
              Array.from({ length: 4 }).map((_, i) => (
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
                  No fleet data.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const imbalance =
                  row.total > 0 && row.booked / row.total >= 0.6

                return (
                  <tr
                    key={row.branchId}
                    className={
                      imbalance ? "bg-amber-50/60 hover:bg-amber-50" : "hover:bg-brand-gray-50"
                    }
                  >
                    <td className="px-4 py-3 body-3 font-medium text-brand-gray-900">
                      {row.branchName}
                      {imbalance && (
                        <span className="ml-2 body-3 font-normal text-amber-700">
                          (high utilization)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 body-3 text-brand-gray-800">
                      {row.total}
                    </td>
                    <td className="px-4 py-3 body-3 text-green-700 font-medium">
                      {row.available}
                    </td>
                    <td className="px-4 py-3 body-3 text-brand-gray-800">
                      {row.booked}
                    </td>
                    <td className="px-4 py-3 body-3 text-brand-gray-600">
                      {row.maintenance}
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
