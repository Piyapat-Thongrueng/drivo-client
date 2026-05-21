import axios from "axios"
import { fetchAdminDashboard } from "@/lib/api/admin-dashboard"
import sample from "../fixtures/dashboard-response.sample.json"

jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

jest.mock("@/lib/api/base-url", () => ({
  publicApiUrl: (path: string) => `http://api.test${path}`,
}))

const mockedGet = jest.fn()
mockedAxios.get = mockedGet

const token = "test-token"

beforeEach(() => {
  jest.clearAllMocks()
  mockedGet.mockResolvedValue({
    data: sample,
  })
})

describe("fetchAdminDashboard", () => {
  it("calls GET /api/admin/dashboard with period query", async () => {
    const result = await fetchAdminDashboard({ period: "30" }, token)

    expect(mockedGet).toHaveBeenCalledWith(
      "http://api.test/api/admin/dashboard?period=30",
      { headers: { Authorization: `Bearer ${token}` } },
    )
    expect(result.stats.bookingsToday).toBe(4)
    expect(result.revenue.byCurrency[0].currency).toBe("THB")
  })

  it("calls GET with custom date range", async () => {
    await fetchAdminDashboard(
      { from: "2026-05-01", to: "2026-05-10" },
      token,
    )

    expect(mockedGet).toHaveBeenCalledWith(
      "http://api.test/api/admin/dashboard?from=2026-05-01&to=2026-05-10",
      expect.any(Object),
    )
  })

  it("calls GET without query when params empty", async () => {
    await fetchAdminDashboard({}, token)

    expect(mockedGet).toHaveBeenCalledWith(
      "http://api.test/api/admin/dashboard",
      expect.any(Object),
    )
  })

  it("includes chartCurrency in query string", async () => {
    await fetchAdminDashboard(
      { period: "7", chartCurrency: "GBP" },
      token,
    )

    const url = mockedGet.mock.calls[0][0] as string
    expect(url).toContain("period=7")
    expect(url).toContain("chartCurrency=GBP")
  })
})
