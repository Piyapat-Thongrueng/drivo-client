import type { Metadata } from "next"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import StepProgressBar, {
  DEFAULT_BOOKING_STEPS,
} from "@/components/customer/bookingflow/StepProgressBar"

export const metadata: Metadata = {
  title: "Booking Status",
  description: "View your booking status and complete payment.",
}

// Phase 4.3 — full implementation coming next
// สถานะที่ต้องรองรับ: pending_approval, pending_payment, confirmed, rejected, cancelled
export default function PaymentPage(): React.JSX.Element {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <StepProgressBar steps={DEFAULT_BOOKING_STEPS} currentStepIndex={3} />
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="headline-3 text-brand-gray-700">Loading your booking…</p>
          <p className="body-2 text-brand-gray-500">
            Payment page coming in Phase 4.3.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
