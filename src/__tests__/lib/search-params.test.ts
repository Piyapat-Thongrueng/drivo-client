import { serializeSearchParams, parseSearchParams, SEARCH_PARAM_KEYS } from "@/lib/search-params"
import { DEFAULT_TIMEZONE } from "@/lib/datetime"
import type { SearchState } from "@/stores/searchStore"

// ─── ตัวอย่าง state สำหรับใช้ในเทส ──────────────────────────────────────────────

const SAMPLE_STATE: SearchState = {
  pickupBranchId: 1,
  pickupBranchName: "Bangkok Airport",
  pickupCountryId: 1,
  pickupTimezone: "Asia/Bangkok",
  dropoffBranchId: 2,
  dropoffBranchName: "Phuket Branch",
  differentDropoff: true,
  pickupDatetime: "2026-06-01T12:00:00+07:00",
  dropoffDatetime: "2026-06-03T12:00:00+07:00",
}

// ─── ชุดทดสอบ: serializeSearchParams ────────────────────────────────────────────

describe("serializeSearchParams", () => {
  it("รวม state → query string มี key ครบ", () => {
    const qs = serializeSearchParams(SAMPLE_STATE)
    expect(qs).toContain("pickupBranchId=1")
    expect(qs).toContain("pickupBranchName=Bangkok+Airport")
    expect(qs).toContain("pickupCountryId=1")
    expect(qs).toContain("pickupTimezone=Asia%2FBangkok")
    expect(qs).toContain("dropoffBranchId=2")
    expect(qs).toContain("differentDropoff=1")
  })

  it("pickupTimezone ถูก encode และอ่านกลับได้", () => {
    const qs = serializeSearchParams(SAMPLE_STATE)
    const params = new URLSearchParams(qs)
    expect(params.get("pickupTimezone")).toBe("Asia/Bangkok")
  })

  it("differentDropoff=false → encode เป็น 0", () => {
    const qs = serializeSearchParams({ ...SAMPLE_STATE, differentDropoff: false })
    expect(qs).toContain("differentDropoff=0")
  })

  it("pickupBranchId = null → ไม่มี key ใน query string", () => {
    const qs = serializeSearchParams({ ...SAMPLE_STATE, pickupBranchId: null })
    expect(qs).not.toContain("pickupBranchId")
  })

  it("pickupTimezone ว่าง → ไม่มี key ใน query string", () => {
    const qs = serializeSearchParams({ ...SAMPLE_STATE, pickupTimezone: "" })
    expect(qs).not.toContain("pickupTimezone")
  })

  it("ISO datetime ถูก encode และ decode กลับได้", () => {
    const qs = serializeSearchParams(SAMPLE_STATE)
    const params = new URLSearchParams(qs)
    expect(params.get("pickupDatetime")).toBe("2026-06-01T12:00:00+07:00")
    expect(params.get("dropoffDatetime")).toBe("2026-06-03T12:00:00+07:00")
  })
})

// ─── ชุดทดสอบ: parseSearchParams ────────────────────────────────────────────────

describe("parseSearchParams", () => {
  it("parse URLSearchParams กลับได้ครบถ้วน", () => {
    const qs = serializeSearchParams(SAMPLE_STATE)
    const parsed = parseSearchParams(new URLSearchParams(qs))

    expect(parsed.pickupBranchId).toBe(1)
    expect(parsed.pickupBranchName).toBe("Bangkok Airport")
    expect(parsed.pickupCountryId).toBe(1)
    expect(parsed.pickupTimezone).toBe("Asia/Bangkok")
    expect(parsed.dropoffBranchId).toBe(2)
    expect(parsed.dropoffBranchName).toBe("Phuket Branch")
    expect(parsed.differentDropoff).toBe(true)
    expect(parsed.pickupDatetime).toBe("2026-06-01T12:00:00+07:00")
    expect(parsed.dropoffDatetime).toBe("2026-06-03T12:00:00+07:00")
  })

  it("parse Record<string, string> (Next.js searchParams format)", () => {
    const parsed = parseSearchParams({
      pickupBranchId: "1",
      pickupBranchName: "Bangkok Airport",
      pickupTimezone: "Asia/Bangkok",
    })
    expect(parsed.pickupBranchId).toBe(1)
    expect(parsed.pickupTimezone).toBe("Asia/Bangkok")
  })

  it("ไม่มี pickupTimezone ใน URL → fallback เป็น DEFAULT_TIMEZONE", () => {
    const parsed = parseSearchParams({})
    expect(parsed.pickupTimezone).toBe(DEFAULT_TIMEZONE)
  })

  it("ไม่มี pickupBranchId ใน URL → null", () => {
    const parsed = parseSearchParams({})
    expect(parsed.pickupBranchId).toBeNull()
  })

  it("differentDropoff=0 → false", () => {
    const parsed = parseSearchParams({ differentDropoff: "0" })
    expect(parsed.differentDropoff).toBe(false)
  })

  it("differentDropoff=1 → true", () => {
    const parsed = parseSearchParams({ differentDropoff: "1" })
    expect(parsed.differentDropoff).toBe(true)
  })

  it("ID ที่ไม่ใช่ตัวเลข → null (ไม่ crash)", () => {
    const parsed = parseSearchParams({ pickupBranchId: "abc", pickupCountryId: "-1" })
    // "abc" ไม่ใช่ตัวเลข → null
    expect(parsed.pickupBranchId).toBeNull()
    // -1 ไม่ใช่ id ที่ถูกต้อง (ต้อง > 0) → null
    expect(parsed.pickupCountryId).toBeNull()
  })

  it("ID = 0 → null", () => {
    const parsed = parseSearchParams({ pickupBranchId: "0" })
    expect(parsed.pickupBranchId).toBeNull()
  })

  it("ไม่มี datetime ใน URL → ใช้ default ตาม timezone", () => {
    const parsed = parseSearchParams({ pickupTimezone: "Asia/Bangkok" })
    // default datetime ต้องมี offset +07:00
    expect(parsed.pickupDatetime).toMatch(/\+07:00$/)
    expect(parsed.dropoffDatetime).toMatch(/\+07:00$/)
  })
})

// ─── ชุดทดสอบ: serialize + parse (roundtrip) ─────────────────────────────────────

describe("serializeSearchParams + parseSearchParams (roundtrip)", () => {
  it("serialize แล้ว parse กลับมาได้ค่าเดิม", () => {
    const qs = serializeSearchParams(SAMPLE_STATE)
    const parsed = parseSearchParams(new URLSearchParams(qs))

    expect(parsed.pickupBranchId).toBe(SAMPLE_STATE.pickupBranchId)
    expect(parsed.pickupTimezone).toBe(SAMPLE_STATE.pickupTimezone)
    expect(parsed.pickupDatetime).toBe(SAMPLE_STATE.pickupDatetime)
    expect(parsed.dropoffDatetime).toBe(SAMPLE_STATE.dropoffDatetime)
    expect(parsed.differentDropoff).toBe(SAMPLE_STATE.differentDropoff)
  })
})

// ─── ชุดทดสอบ: SEARCH_PARAM_KEYS ────────────────────────────────────────────────

describe("SEARCH_PARAM_KEYS", () => {
  it("มี key ครบทุกตัว", () => {
    expect(SEARCH_PARAM_KEYS.pickupBranchId).toBe("pickupBranchId")
    expect(SEARCH_PARAM_KEYS.pickupTimezone).toBe("pickupTimezone")
    expect(SEARCH_PARAM_KEYS.differentDropoff).toBe("differentDropoff")
    expect(SEARCH_PARAM_KEYS.pickupDatetime).toBe("pickupDatetime")
    expect(SEARCH_PARAM_KEYS.dropoffDatetime).toBe("dropoffDatetime")
  })
})
