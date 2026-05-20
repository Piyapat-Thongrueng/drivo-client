"use client"

import { useEffect } from "react"
import { useSearchStore } from "@/stores/searchStore"
import type { ParsedSearchParams } from "@/lib/search-params"

interface SearchStoreHydratorProps {
  /** ค่าที่ parse มาจาก URL — ส่งมาจาก Server Component */
  search: ParsedSearchParams
}

/**
 * Client component ที่ทำหน้าที่ sync ค่าจาก URL query params เข้า Zustand store
 * รัน 1 ครั้งหลัง mount (ไม่ก่อให้เกิด hydration mismatch เพราะใช้ useEffect)
 */
export default function SearchStoreHydrator({ search }: SearchStoreHydratorProps): null {
  const store = useSearchStore()

  useEffect(() => {
    // hydrate ข้อมูล pickup — ส่ง timezone ด้วยเพื่อให้ store รู้ว่าใช้ timezone ไหน
    if (search.pickupBranchId && search.pickupCountryId) {
      store.setPickup(
        search.pickupBranchId,
        search.pickupBranchName,
        search.pickupCountryId,
        search.pickupTimezone,
      )
    }

    // hydrate ข้อมูล dropoff (ถ้ามี)
    if (search.differentDropoff && search.dropoffBranchId) {
      store.setDifferentDropoff(true)
      store.setDropoff(search.dropoffBranchId, search.dropoffBranchName)
    }

    // hydrate วันเวลา
    store.setPickupDatetime(search.pickupDatetime)
    store.setDropoffDatetime(search.dropoffDatetime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // รัน 1 ครั้งตอน mount เท่านั้น

  return null
}
