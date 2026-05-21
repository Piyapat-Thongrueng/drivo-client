/** Query params for GET /api/admin/dashboard */
export interface AdminDashboardQueryParams {
  period?: "7" | "30"
  from?: string
  to?: string
  chartCurrency?: string
}

/**
 * สร้าง URLSearchParams สำหรับ dashboard API
 * custom range (from+to) ไม่ส่ง period — ตรงกับ backend
 */
export function buildDashboardSearchParams(
  params: AdminDashboardQueryParams,
): URLSearchParams {
  const query = new URLSearchParams()

  if (params.from && params.to) {
    query.set("from", params.from)
    query.set("to", params.to)
  } else if (params.period) {
    query.set("period", params.period)
  }

  if (params.chartCurrency?.trim()) {
    query.set("chartCurrency", params.chartCurrency.trim())
  }

  return query
}
