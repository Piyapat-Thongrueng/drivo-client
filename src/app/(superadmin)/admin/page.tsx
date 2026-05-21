"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"
import { buildDashboardQueryFromFilter } from "@/lib/dashboard-display"
import type { RevenuePeriodFilter } from "@/lib/dashboard-display"
import {
  chartCurrencyForApi,
  listChartCurrencyOptions,
  resolveChartCurrencySelection,
} from "@/lib/dashboard-chart"
import { DashboardStatCards } from "@/components/admin/dashboard/DashboardStatCards"
import { DashboardRevenueSection } from "@/components/admin/dashboard/DashboardRevenueSection"
import { DashboardRevenueChart } from "@/components/admin/dashboard/DashboardRevenueChart"
import { DashboardRevenueBreakdownTable } from "@/components/admin/dashboard/DashboardRevenueBreakdownTable"
import { DashboardRecentBookingsTable } from "@/components/admin/dashboard/DashboardRecentBookingsTable"
import { DashboardFleetByBranchTable } from "@/components/admin/dashboard/DashboardFleetByBranchTable"
import { BookingDetailDrawer } from "@/components/admin/bookings/BookingDetailDrawer"
import { Button } from "@/components/ui/Button"
import type { Booking } from "@/types/booking"

export default function DashboardPage(): React.JSX.Element {
  const { session } = useAuth()
  const token = session?.access_token ?? ""

  const [filter, setFilter] = useState<RevenuePeriodFilter>("30")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [appliedCustom, setAppliedCustom] = useState({ from: "", to: "" })
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [chartCurrency, setChartCurrency] = useState("all")

  const queryParams = useMemo(() => {
    const apiCurrency = chartCurrencyForApi(chartCurrency)
    if (filter === "custom" && appliedCustom.from && appliedCustom.to) {
      return buildDashboardQueryFromFilter(
        "custom",
        appliedCustom.from,
        appliedCustom.to,
        apiCurrency,
      )
    }
    return buildDashboardQueryFromFilter(filter, "", "", apiCurrency)
  }, [filter, appliedCustom, chartCurrency])

  const { data, isLoading, error, refetch } = useAdminDashboard(
    token,
    queryParams,
  )

  const currencyOptions = useMemo(
    () =>
      listChartCurrencyOptions(
        data?.revenueChart?.series ?? [],
        data?.revenue?.byCurrency.map((r) => r.currency) ?? [],
      ),
    [data?.revenueChart?.series, data?.revenue?.byCurrency],
  )

  useEffect(() => {
    if (!data || isLoading) return
    const next = resolveChartCurrencySelection(chartCurrency, currencyOptions)
    if (next !== chartCurrency) setChartCurrency(next)
  }, [data, isLoading, currencyOptions, chartCurrency])

  function handleFilterChange(next: RevenuePeriodFilter): void {
    setFilter(next)
    if (next !== "custom") {
      setAppliedCustom({ from: "", to: "" })
    }
  }

  function handleApplyCustom(): void {
    setAppliedCustom({ from: customFrom, to: customTo })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-gray-900">
            Dashboard
          </h1>
          <p className="body-3 mt-0.5 text-brand-gray-500">
            Platform revenue and fleet overview across all branches.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            aria-hidden
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      <DashboardStatCards stats={data?.stats ?? null} isLoading={isLoading} />

      <DashboardRevenueSection
        revenue={data?.revenue ?? null}
        isLoading={isLoading}
        filter={filter}
        customFrom={customFrom}
        customTo={customTo}
        onFilterChange={handleFilterChange}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onApplyCustom={handleApplyCustom}
      />

      <DashboardRevenueChart
        chart={data?.revenueChart ?? null}
        isLoading={isLoading}
        currencyOptions={currencyOptions}
        selectedCurrency={chartCurrency}
        onCurrencyChange={setChartCurrency}
      />

      <DashboardRevenueBreakdownTable
        rows={data?.revenueBreakdown ?? []}
        isLoading={isLoading}
      />

      <DashboardRecentBookingsTable
        rows={data?.recentBookings ?? []}
        isLoading={isLoading}
        token={token}
        onViewBooking={setSelectedBooking}
        onActionDone={() => void refetch()}
      />

      <DashboardFleetByBranchTable
        rows={data?.fleetByBranch ?? []}
        isLoading={isLoading}
      />

      <BookingDetailDrawer
        booking={selectedBooking}
        token={token}
        onClose={() => setSelectedBooking(null)}
        onActionDone={() => {
          void refetch()
        }}
      />
    </div>
  )
}
