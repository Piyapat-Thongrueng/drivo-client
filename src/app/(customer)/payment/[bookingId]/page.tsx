"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import StepProgressBar, {
  DEFAULT_BOOKING_STEPS,
} from "@/components/customer/bookingflow/StepProgressBar"
import BookingStatusView from "@/components/customer/bookingflow/BookingStatusView"
import { useAuth } from "@/contexts/auth-context"
import { getBooking, createCheckoutSession } from "@/lib/api/bookings"
import { fetchBranch } from "@/lib/api/branches"
import { fetchCar } from "@/lib/api/cars"
import type { BookingDetail } from "@/types/booking"
import type { CarDetail } from "@/types/car"

// poll ทุก 30 วินาที เมื่อสถานะเป็น pending_approval
const POLL_INTERVAL_MS = 30_000

// ─── Banner เมื่อกลับจาก Stripe ──────────────────────────────────────────────

function StripeBanner({ result }: { result: "success" | "cancelled" }): React.JSX.Element {
  if (result === "success") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
        <p className="body-3 font-medium text-green-700">
          Payment received! Your booking is now confirmed.
        </p>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <XCircle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <p className="body-3 font-medium text-amber-700">
        Payment was cancelled. You can try again before the timer expires.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentPage(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session, isInitialized } = useAuth()

  const bookingId = Number(params.bookingId)
  // Stripe redirects back กลับมาพร้อม ?payment=success หรือ ?payment=cancelled
  const paymentReturn = searchParams.get("payment") as "success" | "cancelled" | null

  // ── State ─────────────────────────────────────────────────────────────────
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [car, setCar] = useState<CarDetail | null>(null)
  const [pickupBranchName, setPickupBranchName] = useState("")
  const [dropoffBranchName, setDropoffBranchName] = useState("")
  const [pageLoading, setPageLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const carFetchedRef = useRef(false)
  const branchesFetchedRef = useRef(false)

  // ── Fetch booking (+ car ครั้งแรก) ───────────────────────────────────────
  const loadBooking = useCallback(
    async (token: string, silent = false) => {
      if (!silent) setIsRefreshing(true)
      try {
        const data = await getBooking(bookingId, token)
        setBooking(data)

        // fetch car + branch names ครั้งเดียว
        if (!carFetchedRef.current) {
          carFetchedRef.current = true
          fetchCar(data.carId)
            .then((c) => setCar(c))
            .catch(() => {/* car image optional */})
        }
        if (!branchesFetchedRef.current) {
          branchesFetchedRef.current = true
          const pickupId = data.pickupBranchId
          const dropoffId = data.dropoffBranchId
          void Promise.all([
            fetchBranch(pickupId),
            pickupId === dropoffId
              ? Promise.resolve(null)
              : fetchBranch(dropoffId),
          ]).then(([pickup, dropoff]) => {
            setPickupBranchName(pickup.name)
            setDropoffBranchName(
              dropoff?.name ?? pickup.name,
            )
          }).catch(() => {
            setPickupBranchName(`Branch #${pickupId}`)
            setDropoffBranchName(`Branch #${dropoffId}`)
          })
        }
      } catch {
        setFetchError("Unable to load booking details. Please refresh.")
      } finally {
        setPageLoading(false)
        setIsRefreshing(false)
      }
    },
    [bookingId],
  )

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return

    if (!session) {
      // ยังไม่ login → ส่งไปหน้า login พร้อม returnUrl
      router.push(`/login?returnUrl=/payment/${bookingId}`)
      return
    }

    void loadBooking(session.access_token)
  }, [isInitialized, session, bookingId, loadBooking, router])

  // ── Auto-poll เมื่อ pending_approval ─────────────────────────────────────
  useEffect(() => {
    if (!booking || !session) return

    // หยุด poll เก่าก่อน
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    if (booking.status === "pending_approval") {
      pollRef.current = setInterval(() => {
        void loadBooking(session.access_token, true)
      }, POLL_INTERVAL_MS)
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [booking?.status, session, loadBooking])

  // ── Handle Pay Now → Stripe ───────────────────────────────────────────────
  async function handlePayNow(): Promise<void> {
    if (!session) return
    setIsPaying(true)
    setPayError(null)
    try {
      const origin = window.location.origin
      const successUrl = `${origin}/payment/${bookingId}?payment=success`
      const cancelUrl = `${origin}/payment/${bookingId}?payment=cancelled`
      const checkoutUrl = await createCheckoutSession(
        bookingId,
        successUrl,
        cancelUrl,
        session.access_token,
      )
      // redirect ไป Stripe Checkout
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Payment failed. Please try again."
      setPayError(msg)
      setIsPaying(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // auth ยังไม่พร้อม หรือ กำลัง redirect
  if (!isInitialized || (isInitialized && !session)) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gray-400" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <StepProgressBar steps={DEFAULT_BOOKING_STEPS} currentStepIndex={3} />

        {/* Banner เมื่อ Stripe redirect กลับมา */}
        {paymentReturn && <StripeBanner result={paymentReturn} />}

        {/* Loading state */}
        {pageLoading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gray-400" />
            <p className="body-2 text-brand-gray-500">Loading your booking…</p>
          </div>
        )}

        {/* Error state */}
        {!pageLoading && fetchError && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="body-1 font-semibold text-red-600">{fetchError}</p>
            <button
              type="button"
              onClick={() => session && void loadBooking(session.access_token)}
              className="body-3 font-medium text-brand-red-200 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Main status view */}
        {!pageLoading && !fetchError && booking && (
          <BookingStatusView
            booking={booking}
            car={car}
            pickupBranchName={
              pickupBranchName || `Branch #${booking.pickupBranchId}`
            }
            dropoffBranchName={
              dropoffBranchName || `Branch #${booking.dropoffBranchId}`
            }
            onPayNow={handlePayNow}
            isPaying={isPaying}
            payError={payError}
            onRefresh={() => session && void loadBooking(session.access_token)}
            isRefreshing={isRefreshing}
          />
        )}
      </main>

      <Footer />
    </>
  )
}
