import type { FuelLevel, HandoverPhotoInput, PhotoAngle } from "@/types/handover"
import { PHOTO_ANGLES } from "@/types/handover"

// ─── Photo slot state ─────────────────────────────────────────────────────────

export interface PhotoSlot {
  /** ไฟล์รูปที่ user เลือกไว้ (ยังไม่ได้ upload) */
  file: File | null
  /** URL สำหรับ preview (สร้างจาก URL.createObjectURL) */
  previewUrl: string | null
  /** ผลหลัง upload สำเร็จ — ถ้า null แปลว่ายังไม่ได้ upload */
  uploaded: { storagePath: string; url: string } | null
  /** error message สำหรับรูปนี้ถ้ามี */
  error: string | null
}

export type PhotoRecord = Record<PhotoAngle, PhotoSlot>

// ─── Initializer ─────────────────────────────────────────────────────────────

/** Creates an empty PhotoRecord for all 4 angles */
export function initPhotoRecord(): PhotoRecord {
  return {
    front: { file: null, previewUrl: null, uploaded: null, error: null },
    back: { file: null, previewUrl: null, uploaded: null, error: null },
    left: { file: null, previewUrl: null, uploaded: null, error: null },
    right: { file: null, previewUrl: null, uploaded: null, error: null },
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * ตรวจว่าทุกมุมมีรูปพร้อม (file หรือ uploaded อย่างใดอย่างหนึ่ง)
 */
export function isPhotoRecordComplete(record: PhotoRecord): boolean {
  return PHOTO_ANGLES.every(
    (angle) => record[angle].file !== null || record[angle].uploaded !== null,
  )
}

/**
 * ตรวจสอบ form ก่อน submit:
 * - ต้องเลือก fuelLevel
 * - ต้องมีรูปครบ 4 มุม
 * คืน error message แรกที่พบ หรือ null ถ้าทุกอย่างผ่าน
 */
export function validatePickupForm(
  record: PhotoRecord,
  fuelLevel: FuelLevel | null,
): string | null {
  if (!fuelLevel) return "Please select the fuel level."
  if (!isPhotoRecordComplete(record)) return "Please upload photos for all 4 angles."
  return null
}

// ─── Payload builder ──────────────────────────────────────────────────────────

/**
 * สร้าง payload สำหรับ POST /api/branch/bookings/:id/pickup
 * ใช้ uploaded URL ก่อน — ถ้ายังไม่มีให้ throw (ต้องเรียก upload ก่อน)
 */
export function buildPickupPayload(
  record: PhotoRecord,
  fuelLevel: FuelLevel,
): { fuelLevel: FuelLevel; photos: HandoverPhotoInput[] } {
  const photos: HandoverPhotoInput[] = PHOTO_ANGLES.map((angle) => {
    const slot = record[angle]
    if (!slot.uploaded) {
      throw new Error(`Photo for angle "${angle}" has not been uploaded yet.`)
    }
    return {
      angle,
      storagePath: slot.uploaded.storagePath,
      url: slot.uploaded.url,
    }
  })
  return { fuelLevel, photos }
}

// ─── Slot helpers ─────────────────────────────────────────────────────────────

/**
 * สร้าง slot ใหม่เมื่อ user เลือกไฟล์
 * ยกเลิก previewUrl เก่าก่อน (revoke URL) เพื่อป้องกัน memory leak
 */
export function createSlotFromFile(
  prev: PhotoSlot,
  file: File,
  previewUrl: string,
): PhotoSlot {
  if (prev.previewUrl) {
    URL.revokeObjectURL(prev.previewUrl)
  }
  return { file, previewUrl, uploaded: null, error: null }
}

/**
 * อัปเดต slot หลัง upload สำเร็จ
 */
export function markSlotUploaded(
  prev: PhotoSlot,
  uploaded: { storagePath: string; url: string },
): PhotoSlot {
  return { ...prev, uploaded, error: null }
}

/**
 * อัปเดต slot เมื่อ upload ล้มเหลว
 */
export function markSlotError(prev: PhotoSlot, error: string): PhotoSlot {
  return { ...prev, error }
}

// ─── Missing angles helper ────────────────────────────────────────────────────

/**
 * คืน list ของ angles ที่ยังไม่มีไฟล์
 * ใช้แสดง "กรุณาถ่ายรูปมุม: หน้า, หลัง" ใน UI
 */
export function missingAngles(record: PhotoRecord): PhotoAngle[] {
  return PHOTO_ANGLES.filter(
    (angle) => record[angle].file === null && record[angle].uploaded === null,
  )
}
