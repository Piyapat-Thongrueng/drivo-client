import { Calendar, Car } from "lucide-react"
import dayjs from "dayjs"

import type { Booking } from "@/types/booking"
import { Button } from "@/components/ui/Button"
import BookingStatusBadge from "@/components/customer/bookings/BookingStatusBadge"
import { normalizeBookingIdFromApi } from "@/lib/booking-id"
import { formatCurrency } from "@/lib/currency"
import { formatDatetimeInTz, DEFAULT_TIMEZONE } from "@/lib/datetime"

interface BookingCardProps {
  booking: Booking
  /** ชื่อรถ เช่น "Toyota Yaris" — ถ้ายังโหลดไม่ทัน แสดง fallback */
  carLabel?: string
}

export default function BookingCard({
  booking,
  carLabel,
}: BookingCardProps): React.JSX.Element {
  const paymentBookingId = normalizeBookingIdFromApi(booking.id)
  const paymentUrl =
    paymentBookingId != null ? `/payment/${paymentBookingId}` : "/my-account"
  const isPaymentExpired =
    booking.status === "pending_payment" &&
    booking.paymentDeadline
      ? dayjs().isAfter(dayjs(booking.paymentDeadline))
      : false
  const showPayNow =
    paymentBookingId != null &&
    booking.status === "pending_payment" &&
    !isPaymentExpired

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-brand-gray-100 bg-white p-5 shadow-sm">
      {/* Header: reference + status */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="body-3 text-brand-gray-500">Booking reference</p>
          <p className="body-1 font-bold text-brand-gray-900">{booking.reference}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Trip summary */}
      <div className="flex flex-col gap-2 text-brand-gray-600">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
          <span className="body-3 font-medium text-brand-gray-800">
            {carLabel ?? `Vehicle #${booking.carId}`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-gray-400" aria-hidden />
            <span className="body-3">
              Pickup: {formatDatetimeInTz(booking.pickupDatetime, DEFAULT_TIMEZONE)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-gray-400" aria-hidden />
            <span className="body-3">
              Return: {formatDatetimeInTz(booking.dropoffDatetime, DEFAULT_TIMEZONE)}
            </span>
          </div>
        </div>
        {booking.totalAmount && (
          <p className="body-3">
            Rental total:{" "}
            <span className="font-semibold text-brand-gray-900">
              {formatCurrency(parseFloat(booking.totalAmount), booking.currencyCode)}
            </span>
          </p>
        )}
        {isPaymentExpired && (
          <p className="body-3 font-medium text-red-600">Payment window expired</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-brand-gray-100 pt-3">
        <Button href={paymentUrl} variant="secondary" size="sm">
          View details
        </Button>
        {showPayNow && (
          <Button href={paymentUrl} variant="primary" size="sm">
            Pay now
          </Button>
        )}
      </div>
    </article>
  )
}
