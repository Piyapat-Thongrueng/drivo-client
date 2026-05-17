import {
  combineDatetimeInTz,
  splitDatetimeInTz,
  todayInTz,
  formatDatetimeInTz,
  defaultPickupInTz,
  defaultDropoffInTz,
  isDropoffAfterPickup,
  DEFAULT_TIMEZONE,
} from "@/lib/datetime"

// ─── ชุดทดสอบ: combineDatetimeInTz ──────────────────────────────────────────────

describe("combineDatetimeInTz", () => {
  it("รวม date + time ใน Asia/Bangkok → มี offset +07:00 ไม่ใช่ Z", () => {
    const result = combineDatetimeInTz("2026-05-17", "12:00", "Asia/Bangkok")
    // ต้องได้ ISO พร้อม offset +07:00
    expect(result).toMatch(/\+07:00$/)
    // ต้องได้เวลา 12:00:00 ในนั้น
    expect(result).toContain("T12:00:00")
  })

  it("รวม date + time ใน Asia/Tokyo (UTC+9) → offset +09:00", () => {
    const result = combineDatetimeInTz("2026-05-17", "09:00", "Asia/Tokyo")
    expect(result).toMatch(/\+09:00$/)
    expect(result).toContain("T09:00:00")
  })

  it("ใช้ DEFAULT_TIMEZONE เมื่อไม่ส่ง tz มา", () => {
    const result = combineDatetimeInTz("2026-05-17", "14:30")
    // DEFAULT_TIMEZONE = Asia/Bangkok = +07:00
    expect(result).toMatch(/\+07:00$/)
    expect(result).toContain("T14:30:00")
  })

  it("เวลา 14:30 ใน Bangkok — UTC จะเป็น 07:30 (14:30 - 7)", () => {
    const result = combineDatetimeInTz("2026-05-17", "14:30", "Asia/Bangkok")
    const utc = new Date(result).toISOString()
    expect(utc).toContain("T07:30:00")
  })
})

// ─── ชุดทดสอบ: splitDatetimeInTz ────────────────────────────────────────────────

describe("splitDatetimeInTz", () => {
  it("แยก ISO UTC Z → วัน-เวลาใน Bangkok ไม่ใช่ UTC", () => {
    // 2026-05-17T05:00:00.000Z = 12:00 PM Bangkok
    const { date, time } = splitDatetimeInTz("2026-05-17T05:00:00.000Z", "Asia/Bangkok")
    expect(date).toBe("2026-05-17")
    expect(time).toBe("12:00")
  })

  it("แยก ISO พร้อม offset → ไม่ใช้ browser timezone", () => {
    // 2026-05-17T12:00:00+07:00 = 12:00 PM Bangkok
    const { date, time } = splitDatetimeInTz("2026-05-17T12:00:00+07:00", "Asia/Bangkok")
    expect(date).toBe("2026-05-17")
    expect(time).toBe("12:00")
  })

  it("snap นาที < 30 → ได้ :00", () => {
    // 2026-05-17T05:15:00.000Z = 12:15 Bangkok → snap → 12:00
    const { time } = splitDatetimeInTz("2026-05-17T05:15:00.000Z", "Asia/Bangkok")
    expect(time).toBe("12:00")
  })

  it("snap นาที ≥ 30 → ได้ :30", () => {
    // 2026-05-17T05:45:00.000Z = 12:45 Bangkok → snap → 12:30
    const { time } = splitDatetimeInTz("2026-05-17T05:45:00.000Z", "Asia/Bangkok")
    expect(time).toBe("12:30")
  })

  it("ข้ามวัน: 17:00 UTC = 00:00 Bangkok วันถัดไป", () => {
    // 2026-05-17T17:00:00.000Z = 00:00 2026-05-18 Bangkok
    const { date, time } = splitDatetimeInTz("2026-05-17T17:00:00.000Z", "Asia/Bangkok")
    expect(date).toBe("2026-05-18")
    expect(time).toBe("00:00")
  })

  it("ใช้ DEFAULT_TIMEZONE เมื่อไม่ส่ง tz", () => {
    // DEFAULT_TIMEZONE = Asia/Bangkok
    const { date, time } = splitDatetimeInTz("2026-05-17T05:00:00.000Z")
    expect(date).toBe("2026-05-17")
    expect(time).toBe("12:00")
  })
})

// ─── ชุดทดสอบ: combine + split กลับมาได้ค่าเดิม ─────────────────────────────────

describe("combineDatetimeInTz + splitDatetimeInTz (roundtrip)", () => {
  it("combine แล้ว split กลับมาได้ date + time เดิม", () => {
    const tz = "Asia/Bangkok"
    const iso = combineDatetimeInTz("2026-06-01", "10:00", tz)
    const { date, time } = splitDatetimeInTz(iso, tz)
    expect(date).toBe("2026-06-01")
    expect(time).toBe("10:00")
  })

  it("timezone ต่างกัน: Tokyo combine แล้ว split ด้วย Bangkok → วันเวลาต่างกัน", () => {
    // รวมด้วย Tokyo (UTC+9) → เมื่อดูใน Bangkok (UTC+7) เวลาจะต่างกัน
    const isoTokyo = combineDatetimeInTz("2026-06-01", "10:00", "Asia/Tokyo")
    const { time: bangkokTime } = splitDatetimeInTz(isoTokyo, "Asia/Bangkok")
    // 10:00 Tokyo = 08:00 Bangkok (Tokyo = Bangkok + 2 ชั่วโมง)
    expect(bangkokTime).toBe("08:00")
  })
})

// ─── ชุดทดสอบ: todayInTz ────────────────────────────────────────────────────────

describe("todayInTz", () => {
  it("คืน string ในรูปแบบ YYYY-MM-DD", () => {
    const result = todayInTz("Asia/Bangkok")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("ใช้ DEFAULT_TIMEZONE เมื่อไม่ส่ง tz", () => {
    const result = todayInTz()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// ─── ชุดทดสอบ: formatDatetimeInTz ───────────────────────────────────────────────

describe("formatDatetimeInTz", () => {
  it("format UTC Z → Bangkok time", () => {
    // 2026-05-17T05:00:00.000Z = 12:00 PM Bangkok
    const result = formatDatetimeInTz("2026-05-17T05:00:00.000Z", "Asia/Bangkok")
    expect(result).toBe("May 17, 2026, 12:00 PM")
  })

  it("format ISO offset → Bangkok time", () => {
    const result = formatDatetimeInTz("2026-05-17T12:00:00+07:00", "Asia/Bangkok")
    expect(result).toBe("May 17, 2026, 12:00 PM")
  })

  it("format ใน Tokyo → แสดง Tokyo time", () => {
    // 2026-05-17T05:00:00.000Z = 14:00 Tokyo
    const result = formatDatetimeInTz("2026-05-17T05:00:00.000Z", "Asia/Tokyo")
    expect(result).toBe("May 17, 2026, 2:00 PM")
  })

  it("ใช้ DEFAULT_TIMEZONE เมื่อไม่ส่ง tz", () => {
    const result = formatDatetimeInTz("2026-05-17T05:00:00.000Z")
    expect(result).toBe("May 17, 2026, 12:00 PM")
  })
})

// ─── ชุดทดสอบ: defaultPickupInTz / defaultDropoffInTz ──────────────────────────

describe("defaultPickupInTz / defaultDropoffInTz", () => {
  it("defaultPickup คืน ISO พร้อม offset", () => {
    const result = defaultPickupInTz("Asia/Bangkok")
    expect(result).toMatch(/\+07:00$/)
    // เวลาต้องเป็น 12:00
    const { time } = splitDatetimeInTz(result, "Asia/Bangkok")
    expect(time).toBe("12:00")
  })

  it("defaultDropoff อยู่หลัง defaultPickup 2 วัน", () => {
    const pickup = defaultPickupInTz("Asia/Bangkok")
    const dropoff = defaultDropoffInTz("Asia/Bangkok")
    const pickupDate = splitDatetimeInTz(pickup, "Asia/Bangkok").date
    const dropoffDate = splitDatetimeInTz(dropoff, "Asia/Bangkok").date

    const diffDays =
      (new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) /
      (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(2)
  })
})

// ─── ชุดทดสอบ: isDropoffAfterPickup ─────────────────────────────────────────────

describe("isDropoffAfterPickup", () => {
  it("dropoff หลัง pickup → true", () => {
    expect(
      isDropoffAfterPickup(
        "2026-05-17T12:00:00+07:00",
        "2026-05-18T12:00:00+07:00",
      ),
    ).toBe(true)
  })

  it("dropoff เท่ากับ pickup → false", () => {
    expect(
      isDropoffAfterPickup(
        "2026-05-17T12:00:00+07:00",
        "2026-05-17T12:00:00+07:00",
      ),
    ).toBe(false)
  })

  it("dropoff ก่อน pickup → false", () => {
    expect(
      isDropoffAfterPickup(
        "2026-05-18T12:00:00+07:00",
        "2026-05-17T12:00:00+07:00",
      ),
    ).toBe(false)
  })

  it("ทำงานข้าม timezone (UTC vs offset)", () => {
    // pickup: 12:00 Bangkok = 05:00 UTC
    // dropoff: 20:00 UTC = 03:00 Bangkok วันถัดไป → หลัง pickup
    expect(
      isDropoffAfterPickup(
        "2026-05-17T05:00:00.000Z",
        "2026-05-17T20:00:00.000Z",
      ),
    ).toBe(true)
  })
})

// ─── ชุดทดสอบ: DEFAULT_TIMEZONE ─────────────────────────────────────────────────

describe("DEFAULT_TIMEZONE", () => {
  it("ค่า default ต้องเป็น Asia/Bangkok", () => {
    expect(DEFAULT_TIMEZONE).toBe("Asia/Bangkok")
  })
})
