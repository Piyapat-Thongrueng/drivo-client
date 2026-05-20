"use client"

import { Plus, Minus } from "lucide-react"
import type { CarAddon } from "@/types/car-addon"
import { formatCurrency } from "@/lib/currency"

interface AddonSelectorProps {
  addons: CarAddon[]
  selectedIds: number[]
  currencyCode: string
  onToggle: (id: number) => void
}

export default function AddonSelector({
  addons,
  selectedIds,
  currencyCode,
  onToggle,
}: AddonSelectorProps): React.JSX.Element {
  if (addons.length === 0) {
    return (
      <p className="body-3 text-brand-gray-400 italic">
        No add-ons available for this vehicle.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {addons.map((addon) => {
        const selected = selectedIds.includes(addon.id)
        return (
          <div
            key={addon.id}
            className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors ${
              selected
                ? "border-brand-red-200 bg-red-50"
                : "border-brand-gray-100 bg-white"
            }`}
          >
            <div className="flex-1">
              <p className={`body-2 font-semibold ${selected ? "text-brand-red-200" : "text-brand-gray-900"}`}>
                {addon.name}
              </p>
              {addon.description && (
                <p className="body-3 mt-0.5 text-brand-gray-500">{addon.description}</p>
              )}
              <p className="body-3 mt-1 font-medium text-brand-gray-700">
                {formatCurrency(addon.pricePerDay, currencyCode)}
                <span className="text-brand-gray-400"> /day</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggle(addon.id)}
              aria-pressed={selected}
              aria-label={selected ? `Remove ${addon.name}` : `Add ${addon.name}`}
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-bold transition-colors ${
                selected
                  ? "border-brand-red-200 bg-brand-red-200 text-white hover:opacity-90"
                  : "border-brand-gray-200 bg-white text-brand-gray-700 hover:bg-brand-gray-50"
              }`}
            >
              {selected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
        )
      })}
    </div>
  )
}
