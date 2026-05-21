/**
 * Unit tests สำหรับ return-wizard utilities
 *
 * ทดสอบ pure functions ที่ใช้ใน ReturnHandoverForm:
 * - validateExtraCharge: ตรวจ input extra charge
 * - validateReturnForm: ตรวจทุก field ก่อน submit
 * - buildReturnPayload: สร้าง payload จาก record + fuelLevel + extraCharge
 * - parseExtraCharge: แปลง string → number อย่างปลอดภัย
 */

import {
  validateExtraCharge,
  validateReturnForm,
  buildReturnPayload,
  parseExtraCharge,
} from "@/lib/return-wizard"
import { initPhotoRecord } from "@/lib/pickup-wizard"
import type { PhotoRecord, PhotoSlot } from "@/lib/pickup-wizard"
import type { PhotoAngle } from "@/types/handover"
import { PHOTO_ANGLES } from "@/types/handover"

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const DEPOSIT = 5000

function uploadedSlot(angle: PhotoAngle): PhotoSlot {
  return {
    file: null,
    previewUrl: null,
    uploaded: {
      storagePath: `bookings/1/return/${angle}/abc.jpg`,
      url: `https://storage.example.com/bookings/1/return/${angle}/abc.jpg`,
    },
    error: null,
  }
}

function emptySlot(): PhotoSlot {
  return { file: null, previewUrl: null, uploaded: null, error: null }
}

function fileSlot(): PhotoSlot {
  return {
    file: new File(["x"], "photo.jpg", { type: "image/jpeg" }),
    previewUrl: "blob:preview",
    uploaded: null,
    error: null,
  }
}

function fullUploadedRecord(): PhotoRecord {
  return {
    front: uploadedSlot("front"),
    back: uploadedSlot("back"),
    left: uploadedSlot("left"),
    right: uploadedSlot("right"),
  }
}

// ─── validateExtraCharge ──────────────────────────────────────────────────────

describe("validateExtraCharge", () => {
  it("returns error for empty string", () => {
    const err = validateExtraCharge("", DEPOSIT)
    expect(err).toBe("Please enter an amount (enter 0 if no extra charge).")
  })

  it("returns error for whitespace-only string", () => {
    expect(validateExtraCharge("   ", DEPOSIT)).not.toBeNull()
  })

  it("returns error for non-numeric input", () => {
    expect(validateExtraCharge("abc", DEPOSIT)).toBe("Please enter a valid number.")
  })

  it("returns error for negative value", () => {
    expect(validateExtraCharge("-1", DEPOSIT)).toBe("Amount cannot be negative.")
  })

  it("returns error when value exceeds deposit", () => {
    const err = validateExtraCharge("6000", DEPOSIT)
    expect(err).toContain("5000")
  })

  it("returns null for zero (no extra charge)", () => {
    expect(validateExtraCharge("0", DEPOSIT)).toBeNull()
  })

  it("returns null for valid positive amount within deposit", () => {
    expect(validateExtraCharge("1500", DEPOSIT)).toBeNull()
  })

  it("returns null for exact deposit amount", () => {
    expect(validateExtraCharge("5000", DEPOSIT)).toBeNull()
  })

  it("returns null for decimal values", () => {
    expect(validateExtraCharge("1234.56", DEPOSIT)).toBeNull()
  })

  it("handles leading/trailing spaces (trims before parsing)", () => {
    expect(validateExtraCharge("  200  ", DEPOSIT)).toBeNull()
  })
})

// ─── validateReturnForm ───────────────────────────────────────────────────────

describe("validateReturnForm", () => {
  it("returns error when photos are missing", () => {
    const err = validateReturnForm(initPhotoRecord(), "full", "0", DEPOSIT)
    expect(err).toBe("Please upload photos for all 4 angles.")
  })

  it("returns error when fuel level is missing", () => {
    const err = validateReturnForm(fullUploadedRecord(), null, "0", DEPOSIT)
    expect(err).toBe("Please select the fuel level.")
  })

  it("returns error for invalid extra charge", () => {
    const err = validateReturnForm(fullUploadedRecord(), "full", "-500", DEPOSIT)
    expect(err).toBe("Amount cannot be negative.")
  })

  it("returns null when all fields are valid", () => {
    expect(validateReturnForm(fullUploadedRecord(), "half", "200", DEPOSIT)).toBeNull()
  })

  it("validates photos first, then fuel, then charge (error priority)", () => {
    // All wrong — should get photo error first
    const err = validateReturnForm(initPhotoRecord(), null, "abc", DEPOSIT)
    expect(err).toBe("Please upload photos for all 4 angles.")
  })

  it("fuel error comes before charge error when photos are complete", () => {
    const err = validateReturnForm(fullUploadedRecord(), null, "abc", DEPOSIT)
    expect(err).toBe("Please select the fuel level.")
  })

  it("accepts 0 extra charge as valid", () => {
    expect(validateReturnForm(fullUploadedRecord(), "empty", "0", DEPOSIT)).toBeNull()
  })
})

// ─── buildReturnPayload ───────────────────────────────────────────────────────

describe("buildReturnPayload", () => {
  it("builds payload with correct fuelLevel, extraCharge and 4 photos", () => {
    const payload = buildReturnPayload(fullUploadedRecord(), "full", "1500")
    expect(payload.fuelLevel).toBe("full")
    expect(payload.extraCharge).toBe(1500)
    expect(payload.photos).toHaveLength(4)
  })

  it("maps each angle to correct storagePath and url", () => {
    const payload = buildReturnPayload(fullUploadedRecord(), "quarter", "0")
    for (const angle of PHOTO_ANGLES) {
      const photo = payload.photos.find((p) => p.angle === angle)
      expect(photo).toBeDefined()
      expect(photo!.storagePath).toContain(angle)
    }
  })

  it("parses extraCharge string to number correctly", () => {
    const payload = buildReturnPayload(fullUploadedRecord(), "half", "2500.50")
    expect(payload.extraCharge).toBeCloseTo(2500.5)
  })

  it("throws when a photo slot has not been uploaded", () => {
    const record: PhotoRecord = { ...fullUploadedRecord(), back: fileSlot() }
    expect(() => buildReturnPayload(record, "full", "0")).toThrow(
      'Photo for angle "back" has not been uploaded yet.',
    )
  })

  it("throws when a photo slot is empty", () => {
    const record: PhotoRecord = { ...fullUploadedRecord(), left: emptySlot() }
    expect(() => buildReturnPayload(record, "full", "0")).toThrow(
      'Photo for angle "left" has not been uploaded yet.',
    )
  })

  it("builds payload with extraCharge = 0 for no-charge case", () => {
    const payload = buildReturnPayload(fullUploadedRecord(), "three_quarters", "0")
    expect(payload.extraCharge).toBe(0)
  })
})

// ─── parseExtraCharge ─────────────────────────────────────────────────────────

describe("parseExtraCharge", () => {
  it("parses integer string correctly", () => {
    expect(parseExtraCharge("1500")).toBe(1500)
  })

  it("parses decimal string correctly", () => {
    expect(parseExtraCharge("99.99")).toBeCloseTo(99.99)
  })

  it("returns 0 for '0'", () => {
    expect(parseExtraCharge("0")).toBe(0)
  })

  it("returns 0 for empty string (safe fallback)", () => {
    expect(parseExtraCharge("")).toBe(0)
  })

  it("trims whitespace before parsing", () => {
    expect(parseExtraCharge("  300  ")).toBe(300)
  })
})
