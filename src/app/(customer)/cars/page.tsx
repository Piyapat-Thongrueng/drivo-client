import type { Metadata } from "next"
import { MapPin, Calendar, ArrowRight } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import StepProgressBar, {
  DEFAULT_BOOKING_STEPS,
} from "@/components/customer/bookingflow/StepProgressBar"
import CarGrid from "@/components/customer/cars/CarGrid"
import SearchStoreHydrator from "@/components/customer/search/SearchStoreHydrator"
import { parseSearchParams } from "@/lib/search-params"
import { fetchAvailableCars } from "@/lib/api/cars"

export const metadata: Metadata = {
  title: "Available Vehicles",
  description: "Browse available vehicles for your trip.",
}

// ─── Helper: format ISO datetime → "May 17, 2026, 12:00 PM" ──────────────────────

function formatDatetime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return iso
  }
}

// ─── Trip Summary ────────────────────────────────────────────────────────────────

interface TripSummaryProps {
  pickupName: string
  dropoffName: string
  pickupDatetime: string
  dropoffDatetime: string
  differentDropoff: boolean
}

function TripSummary({
  pickupName,
  dropoffName,
  pickupDatetime,
  dropoffDatetime,
  differentDropoff,
}: TripSummaryProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-gray-100 bg-brand-gray-50 px-4 py-3 sm:gap-5 sm:px-6">
      {/* สาขารับรถ */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
        <span className="body-3 font-semibold text-brand-gray-900">
          {pickupName || "—"}
        </span>
      </div>

      {/* วันเวลารับรถ */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 shrink-0 text-brand-gray-500" aria-hidden />
        <span className="body-3 text-brand-gray-700">{formatDatetime(pickupDatetime)}</span>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-brand-gray-400" aria-hidden />

      {/* สาขาคืนรถ (แสดงเฉพาะถ้าเป็นสาขาคนละที่) */}
      {differentDropoff && dropoffName && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
          <span className="body-3 font-semibold text-brand-gray-900">{dropoffName}</span>
        </div>
      )}

      {/* วันเวลาคืนรถ */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 shrink-0 text-brand-gray-500" aria-hidden />
        <span className="body-3 text-brand-gray-700">{formatDatetime(dropoffDatetime)}</span>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────

interface CarsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CarsPage({ searchParams }: CarsPageProps): Promise<React.JSX.Element> {
  // รับ params จาก URL และ parse ให้ครบถ้วน
  const rawParams = await searchParams
  const search = parseSearchParams(rawParams)

  // serialize ค่ากลับเป็น query string สำหรับส่งต่อไปยัง CarCard (booking link)
  const currentQueryString = Object.entries(rawParams)
    .flatMap(([k, v]) => {
      if (!v) return []
      if (Array.isArray(v)) return v.map((s) => `${encodeURIComponent(k)}=${encodeURIComponent(s)}`)
      return [`${encodeURIComponent(k)}=${encodeURIComponent(v)}`]
    })
    .join("&")

  // fetch รถที่ว่างจาก backend (server-side)
  let cars: Awaited<ReturnType<typeof fetchAvailableCars>> = []
  let fetchError = false

  if (search.pickupBranchId) {
    try {
      cars = await fetchAvailableCars({
        pickupBranchId: search.pickupBranchId,
        pickupDatetime: search.pickupDatetime,
        dropoffDatetime: search.dropoffDatetime,
      })
    } catch {
      fetchError = true
    }
  }

  // ตั้งชื่อคืนรถ: ถ้าไม่ต่างสาขา ใช้ชื่อ pickup
  const dropoffName = search.differentDropoff
    ? search.dropoffBranchName
    : search.pickupBranchName

  return (
    <>
      <Navbar />

      {/* Hydrate Zustand store จาก URL params */}
      <SearchStoreHydrator search={search} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Step progress bar — ขั้น "Pick your vehicle" (index 1) */}
        <StepProgressBar steps={DEFAULT_BOOKING_STEPS} currentStepIndex={1} />

        {/* Trip summary */}
        {search.pickupBranchId ? (
          <TripSummary
            pickupName={search.pickupBranchName}
            dropoffName={dropoffName}
            pickupDatetime={search.pickupDatetime}
            dropoffDatetime={search.dropoffDatetime}
            differentDropoff={search.differentDropoff}
          />
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="body-3 text-amber-700">
              No search criteria found. Please{" "}
              <a href="/" className="font-semibold underline hover:no-underline">
                go back to search
              </a>{" "}
              and fill in your trip details.
            </p>
          </div>
        )}

        {/* Error banner ถ้า fetch ไม่ได้ */}
        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="body-3 text-red-700">
              Unable to load vehicles at this time. Please try again.
            </p>
          </div>
        )}

        {/* หัวข้อ + รายการรถ */}
        <section aria-label="Available vehicles">
          <h2 className="headline-3 mb-6 font-bold text-brand-gray-900">
            AVAILABLE VEHICLES{" "}
            {!fetchError && <span className="text-brand-gray-500">({cars.length})</span>}
          </h2>
          <CarGrid cars={cars} searchQuery={currentQueryString} />
        </section>
      </main>

      <Footer />
    </>
  )
}
