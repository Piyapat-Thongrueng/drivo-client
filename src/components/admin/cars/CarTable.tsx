"use client"

import { Pencil, Trash2, Truck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Car } from "@/types/car"
import type { Branch } from "@/types/branch"
import type { Country } from "@/types/country"

interface CarTableProps {
  cars: Car[]
  branches: Branch[]
  countries: Country[]
  isLoading: boolean
  onEdit: (car: Car) => void
  onDelete: (car: Car) => void
}

function branchName(branches: Branch[], branchId: number): string {
  return branches.find((b) => b.id === branchId)?.name ?? "—"
}

function currencyForBranch(
  branches: Branch[],
  countries: Country[],
  branchId: number,
): string {
  const branch = branches.find((b) => b.id === branchId)
  if (!branch) return ""
  const country = countries.find((c) => c.id === branch.countryId)
  return country?.currencyCode ?? ""
}

export function CarTable({
  cars,
  branches,
  countries,
  isLoading,
  onEdit,
  onDelete,
}: CarTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-brand-gray-100">
        <thead className="bg-brand-gray-50">
          <tr>
            {["Photo", "Make & Model", "License", "Branch", "Price / day", "Status", "Actions"].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left body-3 font-semibold text-brand-gray-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-gray-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-brand-gray-100">
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-10 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : cars.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center body-3 text-brand-gray-400">
                No cars match your filters.
              </td>
            </tr>
          ) : (
            cars.map((car) => {
              const currency = currencyForBranch(branches, countries, car.currentBranchId)
              const branch = branchName(branches, car.currentBranchId)
              const isAvail = car.status === "available"

              return (
                <tr key={car.id} className="hover:bg-brand-gray-50 transition-colors">
                  <td className="px-4 py-2">
                    <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-brand-gray-100 bg-brand-gray-100">
                      {car.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={car.imageUrl}
                          alt={`${car.make} ${car.model}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center body-3 text-brand-gray-400">
                          —
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 body-3 font-medium text-brand-gray-900">
                    <span className="block">{car.make}</span>
                    <span className="body-3 text-brand-gray-600">{car.model}</span>
                  </td>
                  <td className="px-4 py-3 body-3 text-brand-gray-800 whitespace-nowrap">
                    {car.licensePlate}
                  </td>
                  <td className="px-4 py-3 body-3 text-brand-gray-700 max-w-[160px] truncate">
                    {branch}
                  </td>
                  <td className="px-4 py-3 body-3 text-brand-gray-800 whitespace-nowrap">
                    {car.dailyRate} {currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 body-3 font-medium ${
                        isAvail
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {isAvail ? "Available" : "Maintenance"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => onEdit(car)}
                        className="rounded-lg p-1.5 text-brand-gray-500 transition-colors hover:bg-brand-gray-100 hover:text-brand-gray-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => onDelete(car)}
                        className="rounded-lg p-1.5 text-brand-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled
                        title="Coming soon"
                        className="rounded-lg p-1.5 text-brand-gray-300 cursor-not-allowed"
                      >
                        <Truck className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
