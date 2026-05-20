"use client"

import Image from "next/image"
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Car,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react"
import dayjs from "dayjs"

import type { BookingDetail } from "@/types/booking"
import type { CarDetail } from "@/types/car"
import { Button } from "@/components/ui/Button"
import PaymentCountdown from "@/components/customer/bookingflow/PaymentCountdown"
import { formatCurrency } from "@/lib/currency"
import { formatDatetimeInTz } from "@/lib/datetime"
import { DEFAULT_TIMEZONE } from "@/lib/datetime"

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookingStatusViewProps {
  booking: BookingDetail
  car: CarDetail | null
  pickupBranchName: string
  dropoffBranchName: string
  onPayNow: () => void
  isPaying: boolean
  payError: string | null
  onRefresh: () => void
  isRefreshing?: boolean
}

// ─── Helper: Booking summary strip ────────────────────────────────────────────

function BookingSummary({
  booking,
  car,
  pickupBranchName,
  dropoffBranchName,
}: {
  booking: BookingDetail
  car: CarDetail | null
  pickupBranchName: string
  dropoffBranchName: string
}): React.JSX.Element {
  const currency = booking.currencyCode

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-gray-100 bg-brand-gray-50 p-5">
      {/* รูปรถ + ชื่อ */}
      {car && (
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-gray-200">
            {car.imageUrl ? (
              <Image
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Car className="h-6 w-6 text-brand-gray-400" aria-hidden />
              </div>
            )}
          </div>
          <div>
            <p className="body-3 text-brand-gray-500">{car.year}</p>
            <p className="body-1 font-bold text-brand-gray-900">
              {car.make} {car.model}
            </p>
          </div>
        </div>
      )}

      {/* วันเวลา */}
      <div className="flex flex-wrap items-center gap-2 text-brand-gray-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
          <span className="body-3 font-semibold text-brand-gray-800">
            {pickupBranchName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0 text-brand-gray-400" aria-hidden />
          <span className="body-3">{formatDatetimeInTz(booking.pickupDatetime, DEFAULT_TIMEZONE)}</span>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-brand-gray-300" aria-hidden />
        {booking.dropoffBranchId !== booking.pickupBranchId && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
            <span className="body-3 font-semibold text-brand-gray-800">
              {dropoffBranchName}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0 text-brand-gray-400" aria-hidden />
          <span className="body-3">{formatDatetimeInTz(booking.dropoffDatetime, DEFAULT_TIMEZONE)}</span>
        </div>
      </div>

      {/* Addons */}
      {booking.addons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {booking.addons.map((addon) => (
            <span
              key={addon.id}
              className="body-3 rounded-full border border-brand-gray-200 bg-white px-2.5 py-0.5 text-brand-gray-600"
            >
              {addon.name}
            </span>
          ))}
        </div>
      )}

      {/* Price breakdown */}
      {booking.totalAmount && (
        <div className="flex flex-col gap-1.5 border-t border-brand-gray-200 pt-3">
          {booking.baseAmount && parseFloat(booking.baseAmount) > 0 && (
            <PriceRow label="Vehicle rate" amount={parseFloat(booking.baseAmount)} currency={currency} />
          )}
          {parseFloat(booking.addonAmount) > 0 && (
            <PriceRow label="Add-ons" amount={parseFloat(booking.addonAmount)} currency={currency} />
          )}
          {parseFloat(booking.oneWayFee) > 0 && (
            <PriceRow label="One-way surcharge" amount={parseFloat(booking.oneWayFee)} currency={currency} />
          )}
          <div className="flex items-center justify-between border-t border-brand-gray-200 pt-1.5">
            <span className="body-2 font-semibold text-brand-gray-900">Rental total</span>
            <span className="body-2 font-bold text-brand-gray-900">
              {formatCurrency(parseFloat(booking.totalAmount), currency)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2">
            <div>
              <p className="body-3 font-semibold text-amber-800">Security deposit (hold)</p>
              <p className="body-3 text-amber-600">Not charged — released after return</p>
            </div>
            <span className="body-3 shrink-0 font-bold text-amber-800">
              {formatCurrency(parseFloat(booking.depositAmount), currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function PriceRow({
  label,
  amount,
  currency,
}: {
  label: string
  amount: number
  currency: string
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="body-3 text-brand-gray-600">{label}</span>
      <span className="body-3 font-medium text-brand-gray-900">{formatCurrency(amount, currency)}</span>
    </div>
  )
}

// ─── Status icon wrapper ──────────────────────────────────────────────────────

function StatusIcon({
  color,
  children,
}: {
  color: "amber" | "green" | "red" | "gray"
  children: React.ReactNode
}): React.JSX.Element {
  const bg: Record<string, string> = {
    amber: "bg-amber-100",
    green: "bg-green-100",
    red: "bg-red-100",
    gray: "bg-brand-gray-100",
  }
  return (
    <div className={`flex h-20 w-20 items-center justify-center rounded-full ${bg[color]}`}>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookingStatusView({
  booking,
  car,
  pickupBranchName,
  dropoffBranchName,
  onPayNow,
  isPaying,
  payError,
  onRefresh,
  isRefreshing,
}: BookingStatusViewProps): React.JSX.Element {
  const isDeadlineExpired =
    booking.paymentDeadline
      ? dayjs().isAfter(dayjs(booking.paymentDeadline))
      : false

  // ── pending_approval ───────────────────────────────────────────────────────
  if (booking.status === "pending_approval") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <StatusIcon color="amber">
            <Clock className="h-10 w-10 text-amber-600" aria-hidden />
          </StatusIcon>
          <h1 className="headline-2 font-bold text-brand-gray-900">Awaiting Approval</h1>
          <p className="body-2 max-w-md text-brand-gray-500">
            Our team is reviewing your request. You will be able to pay once it is approved.
          </p>
          <div className="rounded-xl border border-brand-gray-200 bg-white px-5 py-3 text-center">
            <p className="body-3 text-brand-gray-500">Booking reference</p>
            <p className="headline-3 font-bold text-brand-gray-900">{booking.reference}</p>
          </div>
        </div>

        <BookingSummary
          booking={booking}
          car={car}
          pickupBranchName={pickupBranchName}
          dropoffBranchName={dropoffBranchName}
        />

        <div className="flex flex-col gap-3">
          {/* Pay Now — disabled while pending approval */}
          <Button variant="primary" size="lg" className="w-full justify-center" disabled>
            Pay Now — Available after approval
          </Button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 body-3 text-brand-gray-500 hover:text-brand-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden />
            {isRefreshing ? "Checking…" : "Refresh status"}
          </button>
          <p className="body-3 text-center text-brand-gray-400">
            This page refreshes automatically every 30 seconds.
          </p>
        </div>
      </div>
    )
  }

  // ── pending_payment ────────────────────────────────────────────────────────
  if (booking.status === "pending_payment") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <StatusIcon color={isDeadlineExpired ? "gray" : "red"}>
            <Clock
              className={`h-10 w-10 ${isDeadlineExpired ? "text-brand-gray-400" : "text-brand-red-200"}`}
              aria-hidden
            />
          </StatusIcon>
          <h1 className="headline-2 font-bold text-brand-gray-900">
            {isDeadlineExpired ? "Payment Window Expired" : "Ready to Pay"}
          </h1>
          {!isDeadlineExpired && booking.paymentDeadline && (
            <div className="flex flex-col items-center gap-1">
              <p className="body-3 text-brand-gray-500">Time remaining to complete payment</p>
              <PaymentCountdown deadline={booking.paymentDeadline} />
              <p className="body-3 text-brand-gray-400">
                Complete payment before the timer expires or your booking will be cancelled.
              </p>
            </div>
          )}
          {isDeadlineExpired && (
            <p className="body-2 max-w-md text-brand-gray-500">
              The payment window for this booking has expired. Your booking has been cancelled.
            </p>
          )}
          <div className="rounded-xl border border-brand-gray-200 bg-white px-5 py-3 text-center">
            <p className="body-3 text-brand-gray-500">Booking reference</p>
            <p className="headline-3 font-bold text-brand-gray-900">{booking.reference}</p>
          </div>
        </div>

        <BookingSummary
          booking={booking}
          car={car}
          pickupBranchName={pickupBranchName}
          dropoffBranchName={dropoffBranchName}
        />

        {payError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
            <p className="body-3 text-red-700">{payError}</p>
          </div>
        )}

        {!isDeadlineExpired ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={onPayNow}
            disabled={isPaying}
          >
            {isPaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Redirecting to payment…
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        ) : (
          <Button href="/" variant="secondary" size="lg" className="w-full justify-center">
            Search for another vehicle
          </Button>
        )}
      </div>
    )
  }

  // ── confirmed ──────────────────────────────────────────────────────────────
  if (booking.status === "confirmed") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <StatusIcon color="green">
            <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden />
          </StatusIcon>
          <h1 className="headline-2 font-bold text-brand-gray-900">Booking Confirmed!</h1>
          <p className="body-2 max-w-md text-brand-gray-600">
            Your payment was successful. We look forward to seeing you!
          </p>
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-center">
            <p className="body-3 text-green-700">Booking reference</p>
            <p className="headline-3 font-bold text-green-800">{booking.reference}</p>
          </div>
        </div>

        <BookingSummary
          booking={booking}
          car={car}
          pickupBranchName={pickupBranchName}
          dropoffBranchName={dropoffBranchName}
        />

        <Button href="/" variant="secondary" size="lg" className="w-full justify-center">
          Back to home
        </Button>
      </div>
    )
  }

  // ── rejected ───────────────────────────────────────────────────────────────
  if (booking.status === "rejected") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <StatusIcon color="red">
            <XCircle className="h-10 w-10 text-red-500" aria-hidden />
          </StatusIcon>
          <h1 className="headline-2 font-bold text-brand-gray-900">Booking Not Approved</h1>
          <p className="body-2 max-w-md text-brand-gray-500">
            Unfortunately, we were unable to approve your booking request.
          </p>
          {booking.rejectionNote && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left">
              <p className="body-3 font-semibold text-red-700">Reason</p>
              <p className="body-3 mt-1 text-red-600">{booking.rejectionNote}</p>
            </div>
          )}
          <div className="rounded-xl border border-brand-gray-200 bg-white px-5 py-3">
            <p className="body-3 text-brand-gray-500">Reference: {booking.reference}</p>
          </div>
        </div>

        <Button href="/" variant="primary" size="lg" className="w-full justify-center">
          Search for another vehicle
        </Button>
      </div>
    )
  }

  // ── cancelled ──────────────────────────────────────────────────────────────
  if (booking.status === "cancelled") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <StatusIcon color="gray">
            <Ban className="h-10 w-10 text-brand-gray-400" aria-hidden />
          </StatusIcon>
          <h1 className="headline-2 font-bold text-brand-gray-900">Booking Cancelled</h1>
          <p className="body-2 max-w-md text-brand-gray-500">
            This booking has been cancelled. This can happen if the payment window expired or
            the booking was manually cancelled.
          </p>
          <div className="rounded-xl border border-brand-gray-200 bg-white px-5 py-3">
            <p className="body-3 text-brand-gray-500">Reference: {booking.reference}</p>
          </div>
        </div>

        <Button href="/" variant="primary" size="lg" className="w-full justify-center">
          Search for another vehicle
        </Button>
      </div>
    )
  }

  // ── active / completed ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <StatusIcon color="green">
          <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden />
        </StatusIcon>
        <h1 className="headline-2 font-bold text-brand-gray-900">
          {booking.status === "active" ? "Trip In Progress" : "Trip Completed"}
        </h1>
        <p className="body-2 max-w-md text-brand-gray-600">
          {booking.status === "active"
            ? "Your rental is currently active. Enjoy your journey!"
            : "Your trip has been completed. Thank you for choosing Drivo!"}
        </p>
        <div className="rounded-xl border border-brand-gray-200 bg-white px-5 py-3">
          <p className="body-3 text-brand-gray-500">Reference: {booking.reference}</p>
        </div>
      </div>

      <BookingSummary
        booking={booking}
        car={car}
        pickupBranchName={pickupBranchName}
        dropoffBranchName={dropoffBranchName}
      />
    </div>
  )
}
