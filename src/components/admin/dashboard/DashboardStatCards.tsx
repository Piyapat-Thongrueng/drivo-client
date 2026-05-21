"use client"

import {
  CalendarCheck,
  Clock,
  Car,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react"
import type { DashboardStats } from "@/types/dashboard"
import { formatBookingsTodayDelta } from "@/lib/dashboard-display"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStatCardsProps {
  stats: DashboardStats | null
  isLoading: boolean
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  subTone?: "up" | "down" | "neutral"
  icon: React.ReactNode
}

function StatCard({
  label,
  value,
  sub,
  subTone = "neutral",
  icon,
}: StatCardProps): React.JSX.Element {
  const subColor =
    subTone === "up"
      ? "text-green-700"
      : subTone === "down"
        ? "text-red-600"
        : "text-brand-gray-500"

  const SubIcon =
    subTone === "up" ? TrendingUp : subTone === "down" ? TrendingDown : Minus

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="body-3 font-medium text-brand-gray-500">{label}</span>
        <span className="text-brand-red-200">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-brand-gray-900">{value}</p>
      {sub && (
        <p className={`body-3 flex items-center gap-1 font-medium ${subColor}`}>
          <SubIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {sub}
        </p>
      )}
    </div>
  )
}

export function DashboardStatCards({
  stats,
  isLoading,
}: DashboardStatCardsProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!stats) return <></>

  const delta = formatBookingsTodayDelta(stats.bookingsTodayDelta)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Bookings Today"
        value={stats.bookingsToday}
        sub={delta.label}
        subTone={delta.tone}
        icon={<CalendarCheck className="h-5 w-5" aria-hidden />}
      />
      <StatCard
        label="Pending Approval"
        value={stats.pendingApproval}
        icon={<Clock className="h-5 w-5" aria-hidden />}
      />
      <StatCard
        label="Active Rentals"
        value={stats.activeRentals}
        icon={<Car className="h-5 w-5" aria-hidden />}
      />
      <StatCard
        label="Completed Today"
        value={stats.completedToday}
        icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
      />
    </div>
  )
}
