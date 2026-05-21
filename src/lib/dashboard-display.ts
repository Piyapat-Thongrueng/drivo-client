import type { AdminDashboardQueryParams } from "@/lib/dashboard-params"

export type RevenuePeriodFilter = "7" | "30" | "custom"

/** แปลง UI filter → query params สำหรับ API */
export function buildDashboardQueryFromFilter(
  filter: RevenuePeriodFilter,
  customFrom: string,
  customTo: string,
  chartCurrency?: string,
): AdminDashboardQueryParams {
  const chartParam =
    chartCurrency?.trim() && chartCurrency !== "all"
      ? { chartCurrency: chartCurrency.trim() }
      : {}

  if (filter === "custom" && customFrom && customTo) {
    return { from: customFrom, to: customTo, ...chartParam }
  }
  if (filter === "7") {
    return { period: "7", ...chartParam }
  }
  return { period: "30", ...chartParam }
}

/** ข้อความ delta สำหรับ stat card Bookings Today */
export function formatBookingsTodayDelta(delta: number): {
  label: string
  tone: "up" | "down" | "neutral"
} {
  if (delta > 0) {
    return { label: `+${delta} vs yesterday`, tone: "up" }
  }
  if (delta < 0) {
    return { label: `${delta} vs yesterday`, tone: "down" }
  }
  return { label: "Same as yesterday", tone: "neutral" }
}

/** หัวข้อช่วงรายได้จาก range ใน response */
export function formatRevenuePeriodTitle(
  from: string,
  to: string,
): string {
  if (from === to) {
    return `Revenue on ${from}`
  }
  return `Revenue ${from} – ${to}`
}
