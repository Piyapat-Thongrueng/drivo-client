"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Country } from "@/types/country"

interface CountryTableProps {
  countries: Country[]
  isLoading: boolean
  onEdit: (country: Country) => void
  onDelete: (country: Country) => void
  onToggleStatus: (country: Country) => void
}

export function CountryTable({
  countries,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: CountryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-gray-100 bg-white">
      <table className="w-full">
        <thead className="border-b border-brand-gray-100 bg-brand-gray-50">
          <tr>
            {["No.", "Country Name", "Code", "Branch", "Timezone", "Status", "Actions"].map(
              (col) => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-left body-3 font-semibold text-brand-gray-500"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-brand-gray-100">
          {/* Loading state: 5 skeleton rows */}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}

          {/* Empty state */}
          {!isLoading && countries.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center body-3 text-brand-gray-500">
                No countries found. Add your first country to get started.
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!isLoading &&
            countries.map((country, index) => (
              <tr key={country.id} className="transition-colors hover:bg-brand-gray-50/50">
                <td className="px-5 py-4 body-3 text-brand-gray-500">{index + 1}</td>

                <td className="px-5 py-4 body-3 font-medium text-brand-gray-900">
                  {country.name}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-md bg-brand-gray-50 px-2 py-1 body-3 font-semibold text-brand-gray-700">
                    {country.code}
                  </span>
                </td>

                {/* Branch: shows "–" until a branches API is available */}
                <td className="px-5 py-4 body-3 text-brand-gray-500">–</td>

                <td className="px-5 py-4 body-3 text-brand-gray-700">{country.timezone}</td>

                {/* Status toggle badge */}
                <td className="px-5 py-4">
                  <button
                    onClick={() => onToggleStatus(country)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 body-3 font-medium transition-opacity hover:opacity-75",
                      country.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-brand-gray-100 text-brand-gray-500",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        country.isActive ? "bg-emerald-500" : "bg-brand-gray-400",
                      )}
                    />
                    {country.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(country)}
                      className="rounded-lg p-2 text-brand-gray-500 transition-colors hover:bg-brand-gray-100 hover:text-brand-gray-900"
                      title="Edit country"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(country)}
                      className="rounded-lg p-2 text-brand-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete country"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
