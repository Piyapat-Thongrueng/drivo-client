"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getBranchBookingDetail } from "@/lib/api/branch-handover"
import type { HandoverBookingDetail } from "@/lib/api/branch-handover"
import { ReturnHandoverForm } from "@/components/branch/ReturnHandoverForm"

export default function BookingReturnPage(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()

  const bookingId = Number(params.id)
  const [detail, setDetail] = useState<HandoverBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.access_token) return
    if (isNaN(bookingId) || bookingId <= 0) {
      setError("Invalid booking ID")
      setLoading(false)
      return
    }

    getBranchBookingDetail(bookingId, session.access_token)
      .then((data) => {
        // Must be active (pickup already done)
        if (data.status !== "active") {
          setError(`Cannot process return — booking status is "${data.status}"`)
          return
        }
        // Must not already have a return handover
        const alreadyReturned = data.handovers.some((h) => h.type === "return")
        if (alreadyReturned) {
          setError("This vehicle has already been returned.")
          return
        }
        setDetail(data)
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to load booking details.")
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [session?.access_token, bookingId])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red-200 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="heading-5 text-brand-gray-900">Vehicle Return</h1>
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          {error}
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-brand-gray-500 underline"
        >
          ← Back
        </button>
      </div>
    )
  }

  if (!detail || !session?.access_token) return <></>

  return (
    <div>
      <h1 className="heading-5 mb-6 text-brand-gray-900">Vehicle Return</h1>
      <ReturnHandoverForm detail={detail} token={session.access_token} />
    </div>
  )
}
