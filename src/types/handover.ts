export type HandoverType = "pickup" | "return"
export type FuelLevel = "full" | "three_quarters" | "half" | "quarter" | "empty"
export type PhotoAngle = "front" | "back" | "left" | "right"

export const PHOTO_ANGLES: readonly PhotoAngle[] = ["front", "back", "left", "right"]

export const FUEL_LEVEL_LABELS: Record<FuelLevel, string> = {
  full: "Full",
  three_quarters: "3/4",
  half: "1/2",
  quarter: "1/4",
  empty: "Empty",
}

export interface HandoverPhotoInput {
  angle: PhotoAngle
  /** path ใน Supabase Storage bucket handover-photos */
  storagePath: string
  /** public URL สำหรับแสดงรูป */
  url: string
}

export interface HandoverPhoto extends HandoverPhotoInput {
  id: number
  handoverId: number
  createdAt: string
}

export interface Handover {
  id: number
  bookingId: number
  type: HandoverType
  branchId: number
  handledBy: number
  actualDatetime: string
  fuelLevel: FuelLevel
  damageNote: string | null
  extraCharge: string
  createdAt: string
}

export interface HandoverWithPhotos extends Handover {
  photos: HandoverPhoto[]
}

// ─── API request payloads ─────────────────────────────────────────────────────

export interface PickupHandoverPayload {
  fuelLevel: FuelLevel
  photos: HandoverPhotoInput[]
}

export interface ReturnHandoverPayload {
  fuelLevel: FuelLevel
  extraCharge: number
  photos: HandoverPhotoInput[]
}

// ─── Queue item shapes (ใช้ใน Pick-up / Return queue lists) ──────────────────

export interface QueueBookingItem {
  bookingId: number
  reference: string
  customerName: string
  carLabel: string
  licensePlate: string
  pickupDatetime: string
  dropoffDatetime: string
  pickupBranchName: string
  dropoffBranchName: string
}

// ─── Deposit settlement preview (mirror server logic) ────────────────────────

export type DepositStatus = "held" | "released" | "partial" | "forfeited"

export interface DepositSettlement {
  refundAmount: number
  forfeitAmount: number
  depositStatus: DepositStatus
}

/**
 * คำนวณ refund/forfeit ฝั่ง client เพื่อแสดง preview ก่อนยืนยัน
 * Server เป็นคนตัดสินจริง
 */
export function previewDepositSettlement(
  depositAmount: number,
  extraCharge: number,
): DepositSettlement {
  if (extraCharge <= 0) {
    return { refundAmount: depositAmount, forfeitAmount: 0, depositStatus: "released" }
  }
  if (extraCharge >= depositAmount) {
    return { refundAmount: 0, forfeitAmount: depositAmount, depositStatus: "forfeited" }
  }
  return {
    refundAmount: depositAmount - extraCharge,
    forfeitAmount: extraCharge,
    depositStatus: "partial",
  }
}
