"use client"

import { Pencil, Trash2, ArrowLeftRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Toggle } from "@/components/ui/Toggle"
import { formatTimeTo12hr } from "@/lib/constants/times"
import type { Branch } from "@/types/branch"
import type { Country } from "@/types/country"

interface BranchTableProps {
  branches: Branch[]
  countries: Country[]
  isLoading: boolean
  onEdit: (branch: Branch) => void
  onDelete: (branch: Branch) => void
  onToggleStatus: (branch: Branch) => void
  onOneWayFee: (branch: Branch) => void
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-brand-gray-100">
          {Array.from({ length: 8 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function BranchTable({
  branches,
  countries,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onOneWayFee,
}: BranchTableProps) {
  function getCountryName(countryId: number): string {
    return countries.find((c) => c.id === countryId)?.name ?? "-"
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-brand-gray-100">
        <thead className="bg-brand-gray-50">
          <tr>
            {["No.", "Branch Name", "Country", "Address", "Status", "Opening", "Closing", "Action"].map((h) => (
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
            <SkeletonRows />
          ) : branches.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center body-3 text-brand-gray-400">
                No branches found.
              </td>
            </tr>
          ) : (
            branches.map((branch, idx) => (
              <tr key={branch.id} className="hover:bg-brand-gray-50 transition-colors">
                <td className="px-4 py-3 body-3 text-brand-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 body-3 font-medium text-brand-gray-900 max-w-[180px] truncate">
                  {branch.name}
                </td>
                <td className="px-4 py-3 body-3 text-brand-gray-700 whitespace-nowrap">
                  {getCountryName(branch.countryId)}
                </td>
                <td className="px-4 py-3 body-3 text-brand-gray-700 max-w-[200px] truncate">
                  {branch.address}
                </td>
                <td className="px-4 py-3">
                  <Toggle
                    checked={branch.isActive}
                    onChange={() => onToggleStatus(branch)}
                  />
                </td>
                <td className="px-4 py-3 body-3 text-brand-gray-700 whitespace-nowrap">
                  {branch.openingTime ? formatTimeTo12hr(branch.openingTime) : "-"}
                </td>
                <td className="px-4 py-3 body-3 text-brand-gray-700 whitespace-nowrap">
                  {branch.closingTime ? formatTimeTo12hr(branch.closingTime) : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(branch)}
                      title="Edit branch"
                      className="rounded-lg p-1.5 text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-gray-700 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(branch)}
                      title="Delete branch"
                      className="rounded-lg p-1.5 text-brand-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOneWayFee(branch)}
                      title="Manage one-way fees"
                      className="rounded-lg p-1.5 text-brand-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
