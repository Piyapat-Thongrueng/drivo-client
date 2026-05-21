import {
  buildDashboardQueryFromFilter,
  formatBookingsTodayDelta,
  formatRevenuePeriodTitle,
} from "@/lib/dashboard-display"

describe("dashboard-display", () => {
  describe("buildDashboardQueryFromFilter", () => {
    it("returns period 7", () => {
      expect(buildDashboardQueryFromFilter("7", "", "")).toEqual({
        period: "7",
      })
    })

    it("returns period 30 by default path", () => {
      expect(buildDashboardQueryFromFilter("30", "", "")).toEqual({
        period: "30",
      })
    })

    it("returns custom range when filter is custom", () => {
      expect(
        buildDashboardQueryFromFilter("custom", "2026-05-01", "2026-05-10"),
      ).toEqual({ from: "2026-05-01", to: "2026-05-10" })
    })

    it("includes chartCurrency when not all", () => {
      expect(
        buildDashboardQueryFromFilter("30", "", "", "THB"),
      ).toEqual({ period: "30", chartCurrency: "THB" })
    })

    it("omits chartCurrency when all", () => {
      expect(buildDashboardQueryFromFilter("7", "", "", "all")).toEqual({
        period: "7",
      })
    })
  })

  describe("formatBookingsTodayDelta", () => {
    it("formats positive delta", () => {
      expect(formatBookingsTodayDelta(3)).toEqual({
        label: "+3 vs yesterday",
        tone: "up",
      })
    })

    it("formats negative delta", () => {
      expect(formatBookingsTodayDelta(-2)).toEqual({
        label: "-2 vs yesterday",
        tone: "down",
      })
    })

    it("formats zero delta", () => {
      expect(formatBookingsTodayDelta(0)).toEqual({
        label: "Same as yesterday",
        tone: "neutral",
      })
    })
  })

  describe("formatRevenuePeriodTitle", () => {
    it("formats single day", () => {
      expect(formatRevenuePeriodTitle("2026-05-01", "2026-05-01")).toBe(
        "Revenue on 2026-05-01",
      )
    })

    it("formats range", () => {
      expect(formatRevenuePeriodTitle("2026-05-01", "2026-05-21")).toBe(
        "Revenue 2026-05-01 – 2026-05-21",
      )
    })
  })
})
