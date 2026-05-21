import type { FuelLevel, HandoverPhotoInput } from "@/types/handover"
import { PHOTO_ANGLES } from "@/types/handover"
import type { PhotoRecord } from "@/lib/pickup-wizard"
import { isPhotoRecordComplete } from "@/lib/pickup-wizard"

// ─── Extra charge validation ──────────────────────────────────────────────────

/**
 * Validates the raw string from the extra charge input.
 * Returns an error message, or null if valid.
 *
 * Rules:
 *  - Must not be blank
 *  - Must be a valid non-negative number
 *  - Must not exceed depositAmount
 */
export function validateExtraCharge(raw: string, depositAmount: number): string | null {
  const trimmed = raw.trim()
  if (trimmed === "") return "Please enter an amount (enter 0 if no extra charge)."

  const value = Number(trimmed)
  if (isNaN(value)) return "Please enter a valid number."
  if (value < 0) return "Amount cannot be negative."
  if (value > depositAmount) {
    return `Amount cannot exceed the deposit of ${depositAmount}.`
  }
  return null
}

/**
 * Parses the raw string to a float (assumes validation already passed).
 */
export function parseExtraCharge(raw: string): number {
  return parseFloat(raw.trim()) || 0
}

// ─── Full form validation ─────────────────────────────────────────────────────

/**
 * Validates all return form fields before submit.
 * Returns the first error message found, or null if everything is valid.
 */
export function validateReturnForm(
  record: PhotoRecord,
  fuelLevel: FuelLevel | null,
  extraChargeRaw: string,
  depositAmount: number,
): string | null {
  if (!isPhotoRecordComplete(record)) return "Please upload photos for all 4 angles."
  if (!fuelLevel) return "Please select the fuel level."
  return validateExtraCharge(extraChargeRaw, depositAmount)
}

// ─── Payload builder ──────────────────────────────────────────────────────────

/**
 * Builds the POST /api/branch/bookings/:id/return payload.
 * Throws if any photo has not been uploaded yet.
 */
export function buildReturnPayload(
  record: PhotoRecord,
  fuelLevel: FuelLevel,
  extraChargeRaw: string,
): { fuelLevel: FuelLevel; extraCharge: number; photos: HandoverPhotoInput[] } {
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
  return {
    fuelLevel,
    extraCharge: parseExtraCharge(extraChargeRaw),
    photos,
  }
}
