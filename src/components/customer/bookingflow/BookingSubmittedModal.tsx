"use client"

import { Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface BookingSubmittedModalProps {
  reference: string
  bookingId: number
}

export default function BookingSubmittedModal({
  reference,
  bookingId,
}: BookingSubmittedModalProps): React.JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-submitted-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-9 w-9 text-amber-600" aria-hidden />
          </span>
        </div>

        <h2
          id="booking-submitted-title"
          className="headline-3 mb-2 text-brand-gray-900"
        >
          Booking request submitted
        </h2>

        <p className="body-3 mb-1 font-medium text-brand-gray-700">
          Your booking reference:{" "}
          <span className="font-bold text-brand-gray-900">{reference}</span>
        </p>

        <p className="body-3 mb-1 text-brand-gray-500">
          Our team is reviewing your request. You will be able to pay once it is approved.
        </p>

        <p className="body-3 mb-7 text-brand-gray-400">
          Payment is not charged until you complete checkout after approval.
        </p>

        <Button
          href={`/payment/${bookingId}`}
          variant="primary"
          size="lg"
          className="w-full justify-center font-bold"
        >
          View booking status
        </Button>
      </div>
    </div>
  )
}
