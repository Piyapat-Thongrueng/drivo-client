"use client"

import { useCallback, useEffect, useState } from "react"
import {
  fetchAdminDashboard,
  type AdminDashboardQueryParams,
} from "@/lib/api/admin-dashboard"
import type { AdminDashboardData } from "@/types/dashboard"

/**
 * โหลดข้อมูล dashboard จาก GET /api/admin/dashboard
 * เปลี่ยน params แล้ว refetch อัตโนมัติ (period / custom range / chartCurrency)
 */
export function useAdminDashboard(
  token: string,
  params: AdminDashboardQueryParams = {},
) {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      setData(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchAdminDashboard(params, token)
      setData(result)
    } catch {
      setError("Failed to load dashboard. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [
    token,
    params.period,
    params.from,
    params.to,
    params.chartCurrency,
  ])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(t)
  }, [load])

  return { data, isLoading, error, refetch: load }
}
