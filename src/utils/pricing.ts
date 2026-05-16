/**
 * Client-side pricing utilities — logic mirrors drivo-server/src/utils/pricing.ts exactly.
 * Keep both files in sync whenever pricing rules change.
 */
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

/** Return time is strictly after 14:00 on that calendar day (14:00:00 does not count). */
function isReturnAfter14(dropoff: dayjs.Dayjs): boolean {
  const cutoff = dropoff.startOf("day").hour(14).minute(0).second(0).millisecond(0)
  return dropoff.isAfter(cutoff)
}

export interface PricingBreakdown {
  days: number
  hours: number
  baseAmount: number
  addonAmount: number
  oneWayFee: number
  totalAmount: number
  depositAmount: number
}

/**
 * Calculate billable days and hours for a rental using branch timezone.
 *
 * Rules (reviewer spec):
 *  1. Return strictly after 14:00 → 1 full day for that period
 *  2. Usage strictly over 8 hours (same day) → 1 full day
 *  3. Multi-day: remaining hours reset from pickup clock-time each day
 */
export function calculateDaysAndHours(
  pickupISO: string,
  dropoffISO: string,
  branchTimezone: string,
): { days: number; hours: number } {
  const pickup = dayjs(pickupISO).tz(branchTimezone)
  const dropoff = dayjs(dropoffISO).tz(branchTimezone)

  const totalMinutes = dropoff.diff(pickup, "minute")

  const pickupDay = pickup.startOf("day")
  const dropoffDay = dropoff.startOf("day")
  const calendarDaySpan = dropoffDay.diff(pickupDay, "day")

  if (calendarDaySpan === 0) {
    if (isReturnAfter14(dropoff)) return { days: 1, hours: 0 }
    if (totalMinutes > 8 * 60) return { days: 1, hours: 0 }
    return { days: 0, hours: Math.floor(totalMinutes / 60) }
  }

  if (isReturnAfter14(dropoff)) return { days: calendarDaySpan + 1, hours: 0 }

  const pickupTimeOnFinalDay = pickup.add(calendarDaySpan, "day")
  const remainingMinutes = dropoff.diff(pickupTimeOnFinalDay, "minute")
  const remainingHours = Math.max(0, Math.floor(remainingMinutes / 60))

  if (remainingMinutes > 8 * 60) return { days: calendarDaySpan + 1, hours: 0 }

  return { days: calendarDaySpan, hours: remainingHours }
}

export function calculatePricing(
  pickupISO: string,
  dropoffISO: string,
  branchTimezone: string,
  dailyRate: number,
  hourlyRate: number,
  addonAmount: number,
  oneWayFee: number,
  depositAmount: number,
): PricingBreakdown {
  const { days, hours } = calculateDaysAndHours(
    pickupISO,
    dropoffISO,
    branchTimezone,
  )

  const baseAmount =
    Math.round((days * dailyRate + hours * hourlyRate) * 100) / 100
  const totalAmount =
    Math.round((baseAmount + addonAmount + oneWayFee) * 100) / 100

  return { days, hours, baseAmount, addonAmount, oneWayFee, totalAmount, depositAmount }
}

export function calculateAddonAmount(
  addons: { pricePerDay: number }[],
  billingDays: number,
): number {
  const chargeableDays = billingDays > 0 ? billingDays : 1
  const total = addons.reduce(
    (sum, a) => sum + a.pricePerDay * chargeableDays,
    0,
  )
  return Math.round(total * 100) / 100
}
