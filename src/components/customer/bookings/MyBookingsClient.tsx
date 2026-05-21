"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CalendarDays } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import BookingCard from "@/components/customer/bookings/BookingCard"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/contexts/auth-context"
import { listMyBookings } from "@/lib/api/bookings"
import { fetchCar } from "@/lib/api/cars"
import type { Booking } from "@/types/booking"

export default function MyBookingsClient(): React.JSX.Element {
  const router = useRouter()
  const { session, isInitialized } = useAuth()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [carLabels, setCarLabels] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBookings = useCallback(async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listMyBookings(token)
      setBookings(data)

      const uniqueCarIds = [...new Set(data.map((b) => b.carId))]
      const labels: Record<number, string> = {}
      await Promise.all(
        uniqueCarIds.map(async (carId) => {
          try {
            const car = await fetchCar(carId)
            labels[carId] = `${car.make} ${car.model}`
          } catch {
            labels[carId] = `Vehicle #${carId}`
          }
        }),
      )
      setCarLabels(labels)
    } catch {
      setError("Unable to load your bookings. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    if (!session) {
      router.push("/login?returnUrl=/my-account")
      return
    }

    void loadBookings(session.access_token)
  }, [isInitialized, session, loadBookings, router])

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

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="headline-2 font-bold text-brand-gray-900">My Bookings</h1>
          <p className="body-2 mt-1 text-brand-gray-500">
            View and manage your rental reservations.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gray-400" />
            <p className="body-2 text-brand-gray-500">Loading your bookings…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="body-1 font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => session && void loadBookings(session.access_token)}
              className="body-3 font-medium text-brand-red-200 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-gray-200 bg-brand-gray-50 px-6 py-16 text-center">
            <CalendarDays className="h-12 w-12 text-brand-gray-300" aria-hidden />
            <div>
              <p className="body-1 font-semibold text-brand-gray-800">No bookings yet</p>
              <p className="body-3 mt-1 text-brand-gray-500">
                When you book a vehicle, it will appear here.
              </p>
            </div>
            <Button href="/" variant="primary" size="md">
              Search for a vehicle
            </Button>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <ul className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <BookingCard
                  booking={booking}
                  carLabel={carLabels[booking.carId]}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </>
  )
}
