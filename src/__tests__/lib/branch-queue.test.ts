/**
 * Unit tests สำหรับ branch-queue utilities
 *
 * ทดสอบ pure functions ที่ไม่ต้องการ DOM หรือ API:
 * - filterQueue: ค้นหาใน client side
 * - isOneWay: ตรวจ one-way rental
 * - rentalDurationLabel: แสดงจำนวนวันเช่า
 * - previewDepositSettlement: คำนวณ refund preview (จาก types/handover)
 */

import { filterQueue, isOneWay, rentalDurationLabel } from "@/lib/branch-queue"
import { previewDepositSettlement } from "@/types/handover"
import type { QueueBookingItem } from "@/types/handover"

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<QueueBookingItem> = {}): QueueBookingItem {
  return {
    bookingId: 1,
    reference: "DRV-2026-001",
    customerName: "John Doe",
    carLabel: "Toyota Camry",
    licensePlate: "1กข1234",
    pickupDatetime: "2026-06-01T10:00:00+07:00",
    dropoffDatetime: "2026-06-04T10:00:00+07:00",
    pickupBranchName: "BKK Airport",
    dropoffBranchName: "BKK Airport",
    ...overrides,
  }
}

// ─── filterQueue ──────────────────────────────────────────────────────────────

describe("filterQueue", () => {
  const items = [
    makeItem({ bookingId: 1, reference: "DRV-2026-001", customerName: "John Doe", licensePlate: "1กข1234", carLabel: "Toyota Camry" }),
    makeItem({ bookingId: 2, reference: "DRV-2026-002", customerName: "Jane Smith", licensePlate: "2กข5678", carLabel: "Honda CRV" }),
    makeItem({ bookingId: 3, reference: "DRV-2026-003", customerName: "สมชาย ใจดี", licensePlate: "กก9999", carLabel: "BMW 3 Series" }),
  ]

  it("returns all items when keyword is empty", () => {
    expect(filterQueue(items, "")).toHaveLength(3)
    expect(filterQueue(items, "   ")).toHaveLength(3)
  })

  it("filters by booking reference (case-insensitive)", () => {
    const result = filterQueue(items, "DRV-2026-001")
    expect(result).toHaveLength(1)
    expect(result[0].bookingId).toBe(1)
  })

  it("filters by customer name", () => {
    const result = filterQueue(items, "jane")
    expect(result).toHaveLength(1)
    expect(result[0].bookingId).toBe(2)
  })

  it("filters by Thai customer name", () => {
    const result = filterQueue(items, "สมชาย")
    expect(result).toHaveLength(1)
    expect(result[0].bookingId).toBe(3)
  })

  it("filters by license plate", () => {
    const result = filterQueue(items, "2กข5678")
    expect(result).toHaveLength(1)
    expect(result[0].bookingId).toBe(2)
  })

  it("filters by car model", () => {
    const result = filterQueue(items, "bmw")
    expect(result).toHaveLength(1)
    expect(result[0].bookingId).toBe(3)
  })

  it("returns empty array when no match", () => {
    expect(filterQueue(items, "xyz-not-found")).toHaveLength(0)
  })

  it("returns multiple items when keyword matches more than one", () => {
    // "DRV-2026" ตรงกับ reference ทุกรายการ
    expect(filterQueue(items, "DRV-2026")).toHaveLength(3)
  })

  it("trims whitespace from keyword before searching", () => {
    const result = filterQueue(items, "  john  ")
    expect(result).toHaveLength(1)
    expect(result[0].bookingId).toBe(1)
  })
})

// ─── isOneWay ─────────────────────────────────────────────────────────────────

describe("isOneWay", () => {
  it("returns false when pickup and dropoff branches are the same", () => {
    const item = makeItem({ pickupBranchName: "BKK Airport", dropoffBranchName: "BKK Airport" })
    expect(isOneWay(item)).toBe(false)
  })

  it("returns true when pickup and dropoff branches differ", () => {
    const item = makeItem({ pickupBranchName: "BKK Airport", dropoffBranchName: "Pattaya" })
    expect(isOneWay(item)).toBe(true)
  })
})

// ─── rentalDurationLabel ──────────────────────────────────────────────────────

describe("rentalDurationLabel", () => {
  it("returns '1 day' for a 1-day rental", () => {
    expect(
      rentalDurationLabel("2026-06-01T10:00:00+07:00", "2026-06-02T10:00:00+07:00"),
    ).toBe("1 day")
  })

  it("returns '3 days' for a 3-day rental", () => {
    expect(
      rentalDurationLabel("2026-06-01T10:00:00+07:00", "2026-06-04T10:00:00+07:00"),
    ).toBe("3 days")
  })

  it("returns '1 day' for less-than-24h rental (rounds up)", () => {
    // ชั่วโมงเดียวก็ถือว่า 1 วัน (ceil)
    expect(
      rentalDurationLabel("2026-06-01T10:00:00+07:00", "2026-06-01T15:00:00+07:00"),
    ).toBe("1 day")
  })
})

// ─── previewDepositSettlement (client-side mirror) ────────────────────────────

describe("previewDepositSettlement", () => {
  const DEPOSIT = 5000

  it("returns released + full refund when extraCharge is 0", () => {
    const result = previewDepositSettlement(DEPOSIT, 0)
    expect(result).toEqual({
      refundAmount: 5000,
      forfeitAmount: 0,
      depositStatus: "released",
    })
  })

  it("returns partial + correct amounts when extraCharge is between 0 and deposit", () => {
    const result = previewDepositSettlement(DEPOSIT, 2000)
    expect(result).toEqual({
      refundAmount: 3000,
      forfeitAmount: 2000,
      depositStatus: "partial",
    })
  })

  it("returns forfeited when extraCharge equals deposit", () => {
    const result = previewDepositSettlement(DEPOSIT, 5000)
    expect(result).toEqual({
      refundAmount: 0,
      forfeitAmount: 5000,
      depositStatus: "forfeited",
    })
  })

  it("returns forfeited when extraCharge exceeds deposit", () => {
    // client side ไม่ throw เพื่อให้ UI แสดง preview ได้ก่อน validation จริงที่ server
    const result = previewDepositSettlement(DEPOSIT, 9999)
    expect(result.depositStatus).toBe("forfeited")
    expect(result.refundAmount).toBe(0)
    expect(result.forfeitAmount).toBe(DEPOSIT)
  })

  it("handles negative extraCharge as 0 (treats as released)", () => {
    const result = previewDepositSettlement(DEPOSIT, -100)
    expect(result.depositStatus).toBe("released")
  })
})
