"use client"

import { useMemo } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatCurrency } from "@/lib/currency"
import {
  buildMultiCurrencyChartRows,
  buildSingleCurrencyChartRows,
  CHART_LINE_COLORS,
  getChartViewMode,
} from "@/lib/dashboard-chart"
import type { DashboardRevenueChart as DashboardChartData } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardRevenueChartProps {
  chart: DashboardChartData | null
  isLoading: boolean
  currencyOptions: string[]
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
}

function formatYAxisTick(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}

export function DashboardRevenueChart({
  chart,
  isLoading,
  currencyOptions,
  selectedCurrency,
  onCurrencyChange,
}: DashboardRevenueChartProps): React.JSX.Element {
  const viewMode = getChartViewMode(selectedCurrency)
  const showAllTab = currencyOptions.length > 1

  const plotRows = useMemo(() => {
    if (!chart?.days.length) return []
    if (viewMode === "single" && selectedCurrency !== "all") {
      return buildSingleCurrencyChartRows(
        chart.days,
        chart.series,
        selectedCurrency,
      )
    }
    return buildMultiCurrencyChartRows(chart.days, chart.series)
  }, [chart, viewMode, selectedCurrency])

  const lineKeys = useMemo(() => {
    if (viewMode === "single") return ["revenue"] as const
    return chart?.series.map((s) => s.currency) ?? []
  }, [chart, viewMode])

  const tooltipCurrency =
    viewMode === "single" && selectedCurrency !== "all"
      ? selectedCurrency
      : undefined

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-gray-900">
            Daily Revenue Trend
          </h2>
          <p className="body-3 text-brand-gray-500">
            Rental + damage per day (deposit excluded)
          </p>
        </div>

        {currencyOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {showAllTab && (
              <button
                type="button"
                onClick={() => onCurrencyChange("all")}
                className={`rounded-lg px-3 py-1.5 body-3 font-medium transition-colors ${
                  selectedCurrency === "all"
                    ? "bg-brand-red-200 text-white"
                    : "bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200"
                }`}
              >
                All
              </button>
            )}
            {currencyOptions.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onCurrencyChange(code)}
                className={`rounded-lg px-3 py-1.5 body-3 font-medium transition-colors ${
                  selectedCurrency === code
                    ? "bg-brand-red-200 text-white"
                    : "bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-brand-gray-100 bg-white p-4 shadow-sm md:p-6">
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : plotRows.length > 0 && lineKeys.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={plotRows}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tickFormatter={formatYAxisTick}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const num = Number(value ?? 0)
                    const key = String(name)
                    const code =
                      key === "revenue" ? (tooltipCurrency ?? "") : key
                    const label =
                      key === "revenue" ? (tooltipCurrency ?? "Revenue") : key
                    return [formatCurrency(num, code), label]
                  }}
                  labelStyle={{ color: "#111827", fontWeight: 600 }}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid #E5E7EB",
                  }}
                />
                {lineKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={
                      key === "revenue" && tooltipCurrency
                        ? tooltipCurrency
                        : key
                    }
                    stroke={CHART_LINE_COLORS[index % CHART_LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART_LINE_COLORS[index % CHART_LINE_COLORS.length] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="body-3 py-16 text-center text-brand-gray-500">
            No chart data for this period.
          </p>
        )}
      </div>
    </section>
  )
}
