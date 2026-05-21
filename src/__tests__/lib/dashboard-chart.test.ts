import {
  buildMultiCurrencyChartRows,
  buildSingleCurrencyChartRows,
  chartCurrencyForApi,
  formatChartDayLabel,
  getChartViewMode,
  listChartCurrencyOptions,
  resolveChartCurrencySelection,
} from "@/lib/dashboard-chart"

describe("dashboard-chart", () => {
  const days = ["2026-05-15", "2026-05-16", "2026-05-21"]
  const series = [
    { currency: "THB", points: [100, 200, 300] },
    { currency: "GBP", points: [10, 20, 30] },
  ]

  describe("listChartCurrencyOptions", () => {
    it("merges series and revenue currencies", () => {
      expect(
        listChartCurrencyOptions(series, ["USD", "THB"]),
      ).toEqual(["GBP", "THB", "USD"])
    })
  })

  describe("resolveChartCurrencySelection", () => {
    it("defaults to all when multiple options", () => {
      expect(resolveChartCurrencySelection("", ["THB", "GBP"])).toBe("all")
    })

    it("keeps valid selection", () => {
      expect(resolveChartCurrencySelection("GBP", ["THB", "GBP"])).toBe("GBP")
    })

    it("uses sole currency when only one option", () => {
      expect(resolveChartCurrencySelection("all", ["THB"])).toBe("THB")
      expect(resolveChartCurrencySelection("", ["THB"])).toBe("THB")
    })
  })

  describe("formatChartDayLabel", () => {
    it("formats ISO day in English", () => {
      expect(formatChartDayLabel("2026-05-21")).toMatch(/May\s+21/)
    })
  })

  describe("buildMultiCurrencyChartRows", () => {
    it("maps each currency to a column", () => {
      const rows = buildMultiCurrencyChartRows(days, series)
      expect(rows).toHaveLength(3)
      expect(rows[0]).toMatchObject({
        day: "2026-05-15",
        THB: 100,
        GBP: 10,
      })
      expect(rows[0].label).toMatch(/May\s+15/)
    })
  })

  describe("buildSingleCurrencyChartRows", () => {
    it("uses revenue field for one currency", () => {
      const rows = buildSingleCurrencyChartRows(days, series, "THB")
      expect(rows[1]).toEqual({
        day: "2026-05-16",
        label: expect.any(String),
        revenue: 200,
      })
    })

    it("zero-fills missing currency", () => {
      const rows = buildSingleCurrencyChartRows(days, series, "USD")
      expect(rows.every((r) => r.revenue === 0)).toBe(true)
    })
  })

  describe("chartCurrencyForApi", () => {
    it("omits all", () => {
      expect(chartCurrencyForApi("all")).toBeUndefined()
    })

    it("returns code for single selection", () => {
      expect(chartCurrencyForApi("THB")).toBe("THB")
    })
  })

  describe("getChartViewMode", () => {
    it("returns all or single", () => {
      expect(getChartViewMode("all")).toBe("all")
      expect(getChartViewMode("THB")).toBe("single")
    })
  })
})
