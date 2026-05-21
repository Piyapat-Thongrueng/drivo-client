/**
 * Unit tests สำหรับ pickup-wizard utilities
 *
 * ทดสอบ pure functions ทั้งหมดที่ไม่ต้องการ DOM:
 * - initPhotoRecord: สร้างสถานะเริ่มต้นครบ 4 มุม
 * - isPhotoRecordComplete: ตรวจว่ามีรูปครบทุกมุม
 * - validatePickupForm: ตรวจ fuel level + รูปครบก่อน submit
 * - buildPickupPayload: สร้าง payload จาก record + fuelLevel
 * - missingAngles: คืนมุมที่ยังไม่มีรูป
 * - createSlotFromFile / markSlotUploaded / markSlotError: state transitions
 */

import {
  initPhotoRecord,
  isPhotoRecordComplete,
  validatePickupForm,
  buildPickupPayload,
  missingAngles,
  createSlotFromFile,
  markSlotUploaded,
  markSlotError,
} from "@/lib/pickup-wizard"
import type { PhotoRecord, PhotoSlot } from "@/lib/pickup-wizard"
import type { PhotoAngle } from "@/types/handover"
import { PHOTO_ANGLES } from "@/types/handover"

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function emptySlot(): PhotoSlot {
  return { file: null, previewUrl: null, uploaded: null, error: null }
}

function uploadedSlot(angle: PhotoAngle): PhotoSlot {
  return {
    file: null,
    previewUrl: null,
    uploaded: {
      storagePath: `bookings/1/pickup/${angle}/abc.jpg`,
      url: `https://storage.example.com/bookings/1/pickup/${angle}/abc.jpg`,
    },
    error: null,
  }
}

function fileSlot(): PhotoSlot {
  const mockFile = new File(["bytes"], "photo.jpg", { type: "image/jpeg" })
  return { file: mockFile, previewUrl: "blob:preview", uploaded: null, error: null }
}

/** สร้าง record ที่มีรูปครบ 4 มุม (ใช้ uploaded) */
function fullUploadedRecord(): PhotoRecord {
  return {
    front: uploadedSlot("front"),
    back: uploadedSlot("back"),
    left: uploadedSlot("left"),
    right: uploadedSlot("right"),
  }
}

/** สร้าง record ที่มีรูปครบ 4 มุม (ใช้ file) */
function fullFileRecord(): PhotoRecord {
  return {
    front: fileSlot(),
    back: fileSlot(),
    left: fileSlot(),
    right: fileSlot(),
  }
}

// ─── initPhotoRecord ──────────────────────────────────────────────────────────

describe("initPhotoRecord", () => {
  it("creates a record with all 4 angles", () => {
    const record = initPhotoRecord()
    for (const angle of PHOTO_ANGLES) {
      expect(record[angle]).toBeDefined()
    }
  })

  it("all slots start empty", () => {
    const record = initPhotoRecord()
    for (const angle of PHOTO_ANGLES) {
      const slot = record[angle]
      expect(slot.file).toBeNull()
      expect(slot.previewUrl).toBeNull()
      expect(slot.uploaded).toBeNull()
      expect(slot.error).toBeNull()
    }
  })
})

// ─── isPhotoRecordComplete ────────────────────────────────────────────────────

describe("isPhotoRecordComplete", () => {
  it("returns false when all slots are empty", () => {
    expect(isPhotoRecordComplete(initPhotoRecord())).toBe(false)
  })

  it("returns true when all slots have uploaded result", () => {
    expect(isPhotoRecordComplete(fullUploadedRecord())).toBe(true)
  })

  it("returns true when all slots have a file (not yet uploaded)", () => {
    expect(isPhotoRecordComplete(fullFileRecord())).toBe(true)
  })

  it("returns false when one angle is missing", () => {
    const record = fullUploadedRecord()
    record.left = emptySlot()
    expect(isPhotoRecordComplete(record)).toBe(false)
  })

  it("counts slot as complete if it has a file even without uploaded", () => {
    const record: PhotoRecord = {
      front: fileSlot(),
      back: uploadedSlot("back"),
      left: fileSlot(),
      right: uploadedSlot("right"),
    }
    expect(isPhotoRecordComplete(record)).toBe(true)
  })
})

// ─── validatePickupForm ───────────────────────────────────────────────────────

describe("validatePickupForm", () => {
  it("returns error when fuelLevel is null", () => {
    const err = validatePickupForm(fullUploadedRecord(), null)
    expect(err).toBe("Please select the fuel level.")
  })

  it("returns error when photos are missing", () => {
    const incomplete: PhotoRecord = { ...fullUploadedRecord(), left: emptySlot() }
    const err = validatePickupForm(incomplete, "full")
    expect(err).toBe("Please upload photos for all 4 angles.")
  })

  it("returns null when both fuel level and all photos are set", () => {
    const err = validatePickupForm(fullUploadedRecord(), "half")
    expect(err).toBeNull()
  })

  it("validates fuel level check before photos check", () => {
    // When both are missing, fuel level error should come first
    const err = validatePickupForm(initPhotoRecord(), null)
    expect(err).toBe("Please select the fuel level.")
  })
})

// ─── buildPickupPayload ───────────────────────────────────────────────────────

describe("buildPickupPayload", () => {
  it("builds payload with correct fuelLevel and 4 photos", () => {
    const payload = buildPickupPayload(fullUploadedRecord(), "full")
    expect(payload.fuelLevel).toBe("full")
    expect(payload.photos).toHaveLength(4)
  })

  it("maps each angle to correct storagePath and url", () => {
    const payload = buildPickupPayload(fullUploadedRecord(), "quarter")
    for (const angle of PHOTO_ANGLES) {
      const photo = payload.photos.find((p) => p.angle === angle)
      expect(photo).toBeDefined()
      expect(photo!.storagePath).toContain(angle)
      expect(photo!.url).toContain(angle)
    }
  })

  it("throws if any slot has not been uploaded yet", () => {
    const record: PhotoRecord = { ...fullUploadedRecord(), back: fileSlot() }
    expect(() => buildPickupPayload(record, "full")).toThrow(
      'Photo for angle "back" has not been uploaded yet.',
    )
  })

  it("throws if a slot is completely empty", () => {
    const record: PhotoRecord = { ...fullUploadedRecord(), right: emptySlot() }
    expect(() => buildPickupPayload(record, "three_quarters")).toThrow(
      'Photo for angle "right" has not been uploaded yet.',
    )
  })
})

// ─── missingAngles ────────────────────────────────────────────────────────────

describe("missingAngles", () => {
  it("returns all 4 angles when record is empty", () => {
    const missing = missingAngles(initPhotoRecord())
    expect(missing).toEqual(expect.arrayContaining(["front", "back", "left", "right"]))
    expect(missing).toHaveLength(4)
  })

  it("returns empty array when all slots have files", () => {
    expect(missingAngles(fullFileRecord())).toHaveLength(0)
  })

  it("returns only the angle that is missing", () => {
    const record: PhotoRecord = { ...fullUploadedRecord(), left: emptySlot() }
    expect(missingAngles(record)).toEqual(["left"])
  })

  it("treats slot with file as NOT missing", () => {
    const record: PhotoRecord = {
      ...initPhotoRecord(),
      front: fileSlot(),
    }
    const missing = missingAngles(record)
    expect(missing).not.toContain("front")
    expect(missing).toHaveLength(3)
  })
})

// ─── Slot state transitions ───────────────────────────────────────────────────

describe("createSlotFromFile", () => {
  it("creates a slot with the given file and previewUrl", () => {
    const file = new File(["x"], "front.jpg", { type: "image/jpeg" })
    const slot = createSlotFromFile(emptySlot(), file, "blob:123")
    expect(slot.file).toBe(file)
    expect(slot.previewUrl).toBe("blob:123")
    expect(slot.uploaded).toBeNull()
    expect(slot.error).toBeNull()
  })

  it("clears previous upload when replacing a file", () => {
    const prev: PhotoSlot = {
      file: null,
      previewUrl: null,
      uploaded: { storagePath: "old/path", url: "https://old.url" },
      error: null,
    }
    const newFile = new File(["y"], "new.jpg", { type: "image/jpeg" })
    const slot = createSlotFromFile(prev, newFile, "blob:new")
    expect(slot.uploaded).toBeNull()
    expect(slot.file).toBe(newFile)
  })
})

describe("markSlotUploaded", () => {
  it("sets uploaded result and clears error", () => {
    const prev: PhotoSlot = {
      file: new File(["x"], "f.jpg", { type: "image/jpeg" }),
      previewUrl: "blob:x",
      uploaded: null,
      error: "old error",
    }
    const result = { storagePath: "bookings/1/pickup/front/abc.jpg", url: "https://cdn/abc.jpg" }
    const slot = markSlotUploaded(prev, result)
    expect(slot.uploaded).toEqual(result)
    expect(slot.error).toBeNull()
    expect(slot.file).toBe(prev.file)
  })
})

describe("markSlotError", () => {
  it("sets error message on the slot", () => {
    const slot = markSlotError(emptySlot(), "Upload timed out")
    expect(slot.error).toBe("Upload timed out")
  })

  it("does not modify other slot fields", () => {
    const prev = fileSlot()
    const slot = markSlotError(prev, "Network error")
    expect(slot.file).toBe(prev.file)
    expect(slot.previewUrl).toBe(prev.previewUrl)
    expect(slot.uploaded).toBeNull()
  })
})
