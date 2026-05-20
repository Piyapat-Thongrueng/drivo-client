"use client"

import { useEffect, useState } from "react"
import {
  X,
  Car,
  MapPin,
  Calendar,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import AdminBookingStatusBadge from "@/components/admin/bookings/AdminBookingStatusBadge"
import { formatCurrency } from "@/lib/currency"
import { formatDatetimeInTz, DEFAULT_TIMEZONE } from "@/lib/datetime"
import { getAdminBooking, approveBooking, rejectBooking } from "@/lib/api/admin-bookings"
import { fetchCar } from "@/lib/api/cars"
import { fetchBranch } from "@/lib/api/branches"
import type { Booking, BookingDetail } from "@/types/booking"
import type { CarDetail } from "@/types/car"

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookingDetailDrawerProps {
  booking: Booking | null
  token: string
  onClose: () => void
  onActionDone: () => void
}

// ─── Price Row helper ─────────────────────────────────────────────────────────

function PriceRow({
  label,
  amount,
  currency,
  highlight,
}: {
  label: string
  amount: string | number
  currency: string
  highlight?: boolean
}): React.JSX.Element {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return (
    <div
      className={`flex items-center justify-between gap-4 ${highlight ? "border-t border-brand-gray-200 pt-2" : ""}`}
    >
      <span className={`body-3 ${highlight ? "font-semibold text-brand-gray-900" : "text-brand-gray-600"}`}>
        {label}
      </span>
      <span className={`body-3 shrink-0 ${highlight ? "font-bold text-brand-gray-900" : "font-medium text-brand-gray-800"}`}>
        {isNaN(num) ? "—" : formatCurrency(num, currency)}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BookingDetailDrawer({
  booking,
  token,
  onClose,
  onActionDone,
}: BookingDetailDrawerProps): React.JSX.Element | null {
  const [detail, setDetail] = useState<BookingDetail | null>(null)
  const [car, setCar] = useState<CarDetail | null>(null)
  const [pickupName, setPickupName] = useState("")
  const [dropoffName, setDropoffName] = useState("")
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  // Reject form state
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectNoteError, setRejectNoteError] = useState("")

  // Action state
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Load detail when booking changes
  useEffect(() => {
    if (!booking) {
      setDetail(null)
      setCar(null)
      setPickupName("")
      setDropoffName("")
      setShowRejectForm(false)
      setRejectNote("")
      setActionError(null)
      setActionSuccess(null)
      return
    }

    setDetailLoading(true)
    setDetailError(null)

    void Promise.all([
      getAdminBooking(booking.id, token),
      fetchBranch(booking.pickupBranchId),
      booking.dropoffBranchId !== booking.pickupBranchId
        ? fetchBranch(booking.dropoffBranchId)
        : Promise.resolve(null),
    ])
      .then(([d, pickup, dropoff]) => {
        setDetail(d)
        setPickupName(pickup.name)
        setDropoffName(dropoff?.name ?? pickup.name)
        // fetch car separately
        return fetchCar(d.carId).catch(() => null)
      })
      .then((c) => setCar(c))
      .catch(() => setDetailError("Failed to load booking details."))
      .finally(() => setDetailLoading(false))
  }, [booking, token])

  if (!booking) return null

  const isPendingApproval = booking.status === "pending_approval"
  const currency = detail?.currencyCode ?? booking.currencyCode

  async function handleApprove() {
    if (!detail) return
    setIsApproving(true)
    setActionError(null)
    try {
      await approveBooking(detail.id, token)
      setActionSuccess("Booking approved. The customer now has 35 minutes to complete payment.")
      onActionDone()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve booking."
      setActionError(msg)
    } finally {
      setIsApproving(false)
    }
  }

  async function handleReject() {
    if (!detail) return
    if (!rejectNote.trim()) {
      setRejectNoteError("A rejection note is required.")
      return
    }
    setIsRejecting(true)
    setActionError(null)
    try {
      await rejectBooking(detail.id, rejectNote.trim(), token)
      setActionSuccess("Booking rejected. The customer has been notified.")
      setShowRejectForm(false)
      onActionDone()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject booking."
      setActionError(msg)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-gray-100 px-6 py-4">
          <div>
            <p className="body-3 text-brand-gray-500">Booking reference</p>
            <p className="body-1 font-bold font-mono text-brand-gray-900">{booking.reference}</p>
          </div>
          <div className="flex items-center gap-3">
            <AdminBookingStatusBadge status={booking.status} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-brand-gray-500 transition-colors hover:bg-brand-gray-100 hover:text-brand-gray-900"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-6 px-6 py-5">
          {/* Loading */}
          {detailLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-brand-gray-400" />
            </div>
          )}

          {/* Error */}
          {!detailLoading && detailError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="body-3 text-red-700">{detailError}</p>
            </div>
          )}

          {/* Content */}
          {!detailLoading && detail && (
            <>
              {/* Vehicle */}
              <section className="flex flex-col gap-2">
                <h3 className="body-3 font-semibold uppercase tracking-wide text-brand-gray-400">
                  Vehicle
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gray-100">
                    <Car className="h-6 w-6 text-brand-gray-400" aria-hidden />
                  </div>
                  <div>
                    <p className="body-2 font-bold text-brand-gray-900">
                      {car ? `${car.make} ${car.model}` : `Vehicle #${detail.carId}`}
                    </p>
                    {car && (
                      <p className="body-3 text-brand-gray-500">
                        {car.year} · {car.color} · {car.carType}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Trip */}
              <section className="flex flex-col gap-2">
                <h3 className="body-3 font-semibold uppercase tracking-wide text-brand-gray-400">
                  Trip
                </h3>
                <div className="flex flex-col gap-2 rounded-xl border border-brand-gray-100 bg-brand-gray-50 p-4">
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
                      <div>
                        <p className="body-3 font-semibold text-brand-gray-800">{pickupName}</p>
                        <p className="body-3 text-brand-gray-500">
                          {formatDatetimeInTz(detail.pickupDatetime, DEFAULT_TIMEZONE)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-gray-300" aria-hidden />
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
                      <div>
                        <p className="body-3 font-semibold text-brand-gray-800">{dropoffName}</p>
                        <p className="body-3 text-brand-gray-500">
                          {formatDatetimeInTz(detail.dropoffDatetime, DEFAULT_TIMEZONE)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Addons */}
              {detail.addons.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h3 className="body-3 font-semibold uppercase tracking-wide text-brand-gray-400">
                    Add-ons
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.addons.map((addon) => (
                      <span
                        key={addon.id}
                        className="body-3 rounded-full border border-brand-gray-200 bg-white px-2.5 py-0.5 text-brand-gray-700"
                      >
                        {addon.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Pricing */}
              <section className="flex flex-col gap-2">
                <h3 className="body-3 font-semibold uppercase tracking-wide text-brand-gray-400">
                  Pricing
                </h3>
                <div className="flex flex-col gap-2 rounded-xl border border-brand-gray-100 bg-brand-gray-50 p-4">
                  {detail.baseAmount && parseFloat(detail.baseAmount) > 0 && (
                    <PriceRow label="Vehicle rate" amount={detail.baseAmount} currency={currency} />
                  )}
                  {parseFloat(detail.addonAmount) > 0 && (
                    <PriceRow label="Add-ons" amount={detail.addonAmount} currency={currency} />
                  )}
                  {parseFloat(detail.oneWayFee) > 0 && (
                    <PriceRow label="One-way surcharge" amount={detail.oneWayFee} currency={currency} />
                  )}
                  {detail.totalAmount && (
                    <PriceRow
                      label="Rental total"
                      amount={detail.totalAmount}
                      currency={currency}
                      highlight
                    />
                  )}
                  <div className="mt-1 flex items-start justify-between gap-4 rounded-lg bg-amber-50 px-3 py-2">
                    <div>
                      <p className="body-3 font-semibold text-amber-800">Security deposit (hold)</p>
                      <p className="body-3 text-amber-600">Not charged — released after return</p>
                    </div>
                    <span className="body-3 shrink-0 font-bold text-amber-800">
                      {formatCurrency(parseFloat(detail.depositAmount), currency)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Rejection note (if rejected) */}
              {detail.rejectionNote && (
                <section className="flex flex-col gap-2">
                  <h3 className="body-3 font-semibold uppercase tracking-wide text-brand-gray-400">
                    Rejection Note
                  </h3>
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="body-3 text-red-700">{detail.rejectionNote}</p>
                  </div>
                </section>
              )}

              {/* Timestamps */}
              <section className="flex flex-col gap-1.5">
                <h3 className="body-3 font-semibold uppercase tracking-wide text-brand-gray-400">
                  Timeline
                </h3>
                <TimeLine label="Created" value={detail.createdAt} />
                {detail.approvedAt && <TimeLine label="Approved" value={detail.approvedAt} />}
                {detail.paymentDeadline && (
                  <TimeLine label="Pay by" value={detail.paymentDeadline} />
                )}
                {detail.confirmedAt && <TimeLine label="Confirmed" value={detail.confirmedAt} />}
                {detail.cancelledAt && <TimeLine label="Cancelled" value={detail.cancelledAt} />}
              </section>

              {/* Action messages */}
              {actionSuccess && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
                  <p className="body-3 text-green-800">{actionSuccess}</p>
                </div>
              )}
              {actionError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
                  <p className="body-3 text-red-700">{actionError}</p>
                </div>
              )}

              {/* Reject form */}
              {showRejectForm && !actionSuccess && (
                <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="body-3 font-semibold text-red-800">
                    Rejection note (required — shown to the customer)
                  </p>
                  <textarea
                    rows={4}
                    value={rejectNote}
                    onChange={(e) => {
                      setRejectNote(e.target.value)
                      if (e.target.value.trim()) setRejectNoteError("")
                    }}
                    placeholder="e.g. Vehicle unavailable for the selected dates."
                    className="w-full resize-none rounded-lg border border-red-300 bg-white px-3 py-2 body-3 text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  {rejectNoteError && (
                    <p className="body-3 text-red-600">{rejectNoteError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-red-600 px-4 py-2 body-3 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      {isRejecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rejecting…
                        </>
                      ) : (
                        "Confirm Reject"
                      )}
                    </button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowRejectForm(false)
                        setRejectNote("")
                        setRejectNoteError("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions — only for pending_approval without a success */}
        {isPendingApproval && !actionSuccess && !detailLoading && (
          <div className="border-t border-brand-gray-100 bg-white px-6 py-4">
            <div className="flex gap-3">
              {!showRejectForm && (
                <>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="inline-flex flex-1 min-h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 body-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Approving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isApproving || isRejecting}
                    className="inline-flex flex-1 min-h-10 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 body-3 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function TimeLine({
  label,
  value,
}: {
  label: string
  value: string
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-gray-400" aria-hidden />
      <span className="body-3 text-brand-gray-500">{label}:</span>
      <span className="body-3 text-brand-gray-700">
        {formatDatetimeInTz(value, DEFAULT_TIMEZONE)}
      </span>
    </div>
  )
}
