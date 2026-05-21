"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, Car, Loader2, Search, UserRound } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPickupQueue } from "@/lib/api/branch-handover"
import { filterQueue, formatQueueDatetime } from "@/lib/branch-queue"
import type { QueueBookingItem } from "@/types/handover"

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-gray-200 bg-brand-gray-50 px-6 py-16 text-center">
      <ArrowDownToLine className="h-12 w-12 text-brand-gray-300" aria-hidden />
      <div>
        <p className="body-1 font-semibold text-brand-gray-800">
          {search ? "No matching bookings" : "No bookings awaiting pick-up"}
        </p>
        <p className="body-3 mt-1 text-brand-gray-500">
          {search
            ? `No results for "${search}"`
            : "Confirmed bookings scheduled for pick-up at your branch will appear here."}
        </p>
      </div>
    </div>
  )
}

// ─── Queue card (one booking row) ─────────────────────────────────────────────

function QueueCard({ item }: { item: QueueBookingItem }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-brand-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Left: booking info */}
      <div className="flex min-w-0 flex-col gap-2">
        {/* Reference + customer */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="body-3 rounded-full bg-brand-gray-100 px-2.5 py-0.5 font-medium text-brand-gray-700">
            {item.reference}
          </span>
          <span className="body-3 flex items-center gap-1 text-brand-gray-600">
            <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {item.customerName}
          </span>
        </div>

        {/* Car */}
        <p className="body-2 flex items-center gap-1.5 font-medium text-brand-gray-900">
          <Car className="h-4 w-4 shrink-0 text-brand-gray-400" aria-hidden />
          {item.carLabel}
          <span className="body-3 rounded border border-brand-gray-200 px-1.5 py-0.5 font-mono text-brand-gray-600">
            {item.licensePlate}
          </span>
        </p>

        {/* Dates */}
        <div className="body-3 flex flex-col gap-0.5 text-brand-gray-500">
          <span>
            <span className="font-medium text-brand-gray-700">Pick-up: </span>
            {formatQueueDatetime(item.pickupDatetime)}
          </span>
          <span>
            <span className="font-medium text-brand-gray-700">Return: </span>
            {formatQueueDatetime(item.dropoffDatetime)}
            {item.pickupBranchName !== item.dropoffBranchName && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                One-way → {item.dropoffBranchName}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Right: action button */}
      <div className="shrink-0">
        <Link
          href={`/branch/bookings/${item.bookingId}/pickup`}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-red-200 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-200"
        >
          <ArrowDownToLine className="h-4 w-4" aria-hidden />
          ส่งมอบรถ
        </Link>
      </div>
    </article>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PickupQueuePage(): React.JSX.Element {
  const { session } = useAuth()
  const [items, setItems] = useState<QueueBookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadQueue = useCallback(
    async (token: string, q?: string) => {
      setLoading(true)
      setError(null)
      try {
        const data = await getPickupQueue(token, q)
        setItems(data)
      } catch {
        setError("Unable to load the pick-up queue. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Initial load
  useEffect(() => {
    if (!session?.access_token) return
    void loadQueue(session.access_token)
  }, [session?.access_token, loadQueue])

  // Debounced search (500ms)
  const handleSearch = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (session?.access_token) {
        void loadQueue(session.access_token, value.trim() || undefined)
      }
    }, 500)
  }

  const displayed = filterQueue(items, search)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="heading-5 font-bold text-brand-gray-900">Pick-up Queue</h1>
          <p className="body-3 mt-1 text-brand-gray-500">
            Confirmed bookings waiting for vehicle handover at your branch.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search reference, customer, plate…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="body-3 w-full rounded-xl border border-brand-gray-200 bg-white py-2 pl-9 pr-3 text-brand-gray-900 placeholder-brand-gray-400 shadow-sm outline-none transition focus:border-brand-red-200 focus:ring-2 focus:ring-brand-red-200/20"
            aria-label="Search pick-up queue"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gray-400" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="body-2 font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => session && void loadQueue(session.access_token)}
            className="body-3 font-medium text-brand-red-200 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && displayed.length === 0 && <EmptyState search={search} />}

      {/* Queue list */}
      {!loading && !error && displayed.length > 0 && (
        <ul className="flex flex-col gap-3">
          {displayed.map((item) => (
            <li key={item.bookingId}>
              <QueueCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {/* Result count */}
      {!loading && !error && items.length > 0 && (
        <p className="body-3 text-brand-gray-400">
          Showing {displayed.length} of {items.length}{" "}
          {items.length === 1 ? "booking" : "bookings"}
        </p>
      )}
    </div>
  )
}
