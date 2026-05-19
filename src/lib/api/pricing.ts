import axios from "axios"
import type { PricingPreviewResult } from "@/types/pricing"
import { publicApiUrl } from "./base-url"

export interface PricingPreviewParams {
  carId: number
  pickupBranchId: number
  dropoffBranchId: number
  pickupDatetime: string
  dropoffDatetime: string
  addonIds?: number[]
}

/**
 * POST /api/pricing/preview — คำนวณราคาก่อนยืนยันการจอง
 * ใช้ได้โดยไม่ต้อง login (guest สามารถดูราคาได้)
 */
export async function previewPricing(
  params: PricingPreviewParams,
): Promise<PricingPreviewResult> {
  const { data } = await axios.post<{ success: boolean; data: PricingPreviewResult }>(
    publicApiUrl("/api/pricing/preview"),
    {
      ...params,
      addonIds: params.addonIds ?? [],
    },
  )
  return data.data
}
