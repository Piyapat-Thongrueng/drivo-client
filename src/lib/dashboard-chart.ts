import type { DashboardChartSeries } from "@/types/dashboard"

/** สีเส้นกราฟ — สอดคล้อง brand + neutral */
export const CHART_LINE_COLORS = [
  "#A6001F",
  "#1F2937",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
] as const

export type ChartViewMode = "all" | "single"

export interface ChartPlotRow {
  day: string
  label: string
  [key: string]: string | number
}

/** รวมรายการสกุลเงินจาก series + revenue cards */
export function listChartCurrencyOptions(
  series: DashboardChartSeries[],
  revenueCurrencies: string[] = [],
): string[] {
  const codes = new Set<string>()
  for (const s of series) {
    if (s.currency.trim()) codes.add(s.currency.trim())
  }
  for (const c of revenueCurrencies) {
    if (c.trim()) codes.add(c.trim())
  }
  return [...codes].sort()
}

/** เลือกสกุลที่แสดง — คงค่าเดิมถ้ายังอยู่ใน options */
export function resolveChartCurrencySelection(
  selected: string,
  options: string[],
): string {
  if (options.length === 1) return options[0]
  if (selected === "all") return "all"
  if (selected && options.includes(selected)) return selected
  return "all"
}

/** แปลง ISO date เป็นป้ายแกน X สั้นๆ (ภาษาอังกฤษ) */
export function formatChartDayLabel(isoDay: string): string {
  const date = new Date(`${isoDay}T12:00:00`)
  if (Number.isNaN(date.getTime())) return isoDay
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** แปลง days + series → rows สำหรับ recharts (หลายเส้น) */
export function buildMultiCurrencyChartRows(
  days: string[],
  series: DashboardChartSeries[],
): ChartPlotRow[] {
  return days.map((day, index) => {
    const row: ChartPlotRow = {
      day,
      label: formatChartDayLabel(day),
    }
    for (const s of series) {
      row[s.currency] = s.points[index] ?? 0
    }
    return row
  })
}

/** แปลง days + series สกุลเดียว → rows มี field revenue */
export function buildSingleCurrencyChartRows(
  days: string[],
  series: DashboardChartSeries[],
  currency: string,
): ChartPlotRow[] {
  const match = series.find((s) => s.currency === currency)
  const points = match?.points ?? days.map(() => 0)

  return days.map((day, index) => ({
    day,
    label: formatChartDayLabel(day),
    revenue: points[index] ?? 0,
  }))
}

/** chartCurrency ที่ส่ง API — ไม่ส่งเมื่อเลือก All */
export function chartCurrencyForApi(selection: string): string | undefined {
  if (!selection || selection === "all") return undefined
  return selection
}

/** โหมดแสดงผลจาก selection */
export function getChartViewMode(selection: string): ChartViewMode {
  return selection === "all" ? "all" : "single"
}
