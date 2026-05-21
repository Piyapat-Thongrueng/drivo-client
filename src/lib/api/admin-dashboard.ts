import axios from "axios"
import type { AdminDashboardData } from "@/types/dashboard"
import { buildDashboardSearchParams } from "@/lib/dashboard-params"
import type { AdminDashboardQueryParams } from "@/lib/dashboard-params"
import { publicApiUrl } from "./base-url"

export type { AdminDashboardQueryParams }

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

/** GET /api/admin/dashboard — platform stats and revenue (super_admin) */
export async function fetchAdminDashboard(
  params: AdminDashboardQueryParams,
  token: string,
): Promise<AdminDashboardData> {
  const query = buildDashboardSearchParams(params)
  const qs = query.toString()
  const url = publicApiUrl(
    qs ? `/api/admin/dashboard?${qs}` : "/api/admin/dashboard",
  )

  const { data } = await axios.get<{
    success: boolean
    data: AdminDashboardData
  }>(url, { headers: authHeader(token) })

  return data.data
}
