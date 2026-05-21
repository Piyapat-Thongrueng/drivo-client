import { buildDashboardSearchParams } from "@/lib/dashboard-params"

describe("buildDashboardSearchParams", () => {
  it("sets period when no custom range", () => {
    const q = buildDashboardSearchParams({ period: "30" })
    expect(q.get("period")).toBe("30")
    expect(q.get("from")).toBeNull()
  })

  it("prefers custom from/to over period", () => {
    const q = buildDashboardSearchParams({
      period: "7",
      from: "2026-05-01",
      to: "2026-05-21",
    })
    expect(q.get("from")).toBe("2026-05-01")
    expect(q.get("to")).toBe("2026-05-21")
    expect(q.get("period")).toBeNull()
  })

  it("includes chartCurrency when provided", () => {
    const q = buildDashboardSearchParams({
      period: "30",
      chartCurrency: "THB",
    })
    expect(q.get("chartCurrency")).toBe("THB")
  })

  it("returns empty params when nothing set (server defaults to 30 days)", () => {
    const q = buildDashboardSearchParams({})
    expect(q.toString()).toBe("")
  })
})
