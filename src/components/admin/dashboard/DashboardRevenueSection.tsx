"use client"

import { formatCurrency } from "@/lib/currency"
import { formatRevenuePeriodTitle } from "@/lib/dashboard-display"
import type { RevenuePeriodFilter } from "@/lib/dashboard-display"
import type { DashboardRevenue } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardRevenueSectionProps {
  revenue: DashboardRevenue | null
  isLoading: boolean
  filter: RevenuePeriodFilter
  customFrom: string
  customTo: string
  onFilterChange: (filter: RevenuePeriodFilter) => void
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
  onApplyCustom: () => void
}

const FILTER_OPTIONS: { value: RevenuePeriodFilter; label: string }[] = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
]

export function DashboardRevenueSection({
  revenue,
  isLoading,
  filter,
  customFrom,
  customTo,
  onFilterChange,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
}: DashboardRevenueSectionProps): React.JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-gray-900">
            Revenue
          </h2>
          {revenue && !isLoading && (
            <p className="body-3 text-brand-gray-500">
              {formatRevenuePeriodTitle(
                revenue.range.from,
                revenue.range.to,
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange(opt.value)}
              className={`rounded-lg px-3 py-1.5 body-3 font-medium transition-colors ${
                filter === opt.value
                  ? "bg-brand-red-200 text-white"
                  : "bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filter === "custom" && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-brand-gray-100 bg-brand-gray-50 p-4">
          <label className="flex flex-col gap-1">
            <span className="body-3 font-medium text-brand-gray-600">From</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="rounded-lg border border-brand-gray-200 px-3 py-2 body-3"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="body-3 font-medium text-brand-gray-600">To</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="rounded-lg border border-brand-gray-200 px-3 py-2 body-3"
            />
          </label>
          <button
            type="button"
            onClick={onApplyCustom}
            disabled={!customFrom || !customTo}
            className="rounded-lg bg-brand-gray-900 px-4 py-2 body-3 font-medium text-white disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : revenue && revenue.byCurrency.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {revenue.byCurrency.map((row) => (
            <div
              key={row.currency}
              className="rounded-2xl border border-brand-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="body-2 font-bold text-brand-gray-900">
                {row.currency}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between body-3">
                  <span className="text-brand-gray-600">Rental</span>
                  <span className="font-medium text-brand-gray-900">
                    {formatCurrency(row.rental, row.currency)}
                  </span>
                </div>
                <div className="flex justify-between body-3">
                  <span className="text-brand-gray-600">Deposit (held)</span>
                  <span className="font-medium text-brand-gray-800">
                    {formatCurrency(row.deposit, row.currency)}
                  </span>
                </div>
                <div className="flex justify-between body-3">
                  <span className="text-brand-gray-600">Damage</span>
                  <span className="font-medium text-brand-gray-800">
                    {formatCurrency(row.damage, row.currency)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-brand-gray-200 pt-2 body-3">
                  <span className="font-semibold text-brand-gray-900">
                    Total Revenue
                  </span>
                  <span className="font-bold text-brand-red-200">
                    {formatCurrency(row.total, row.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="body-3 rounded-xl border border-dashed border-brand-gray-200 px-4 py-8 text-center text-brand-gray-500">
          No revenue in this period.
        </p>
      )}
    </section>
  )
}
