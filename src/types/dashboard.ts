/** Stat cards — top row */
export interface DashboardStats {
  bookingsToday: number
  bookingsTodayDelta: number
  pendingApproval: number
  activeRentals: number
  completedToday: number
}

export interface RevenueByCurrencyRow {
  currency: string
  rental: string
  deposit: string
  damage: string
  total: string
}

export interface DashboardRevenue {
  range: { from: string; to: string }
  byCurrency: RevenueByCurrencyRow[]
}

export interface DashboardChartSeries {
  currency: string
  points: number[]
}

export interface DashboardRevenueChart {
  days: string[]
  series: DashboardChartSeries[]
}

export interface RevenueBreakdownRow {
  country: string
  branch: string
  branchId: number
  currency: string
  bookings: number
  revenue: string
}

export interface DashboardRecentBooking {
  id: number
  reference: string
  status: string
  customerName: string
  carLabel: string
  pickupBranchName: string
  totalAmount: string | null
  currencyCode: string
  createdAt: string
}

export interface FleetByBranchRow {
  branchId: number
  branchName: string
  total: number
  available: number
  booked: number
  maintenance: number
}

/** GET /api/admin/dashboard — full payload */
export interface AdminDashboardData {
  stats: DashboardStats
  revenue: DashboardRevenue
  revenueChart: DashboardRevenueChart
  revenueBreakdown: RevenueBreakdownRow[]
  recentBookings: DashboardRecentBooking[]
  fleetByBranch: FleetByBranchRow[]
}
