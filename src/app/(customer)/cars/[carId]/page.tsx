import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { MapPin, Calendar, ArrowRight, Users, Briefcase, Fuel, Settings2, Info } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import StepProgressBar, {
  DEFAULT_BOOKING_STEPS,
} from "@/components/customer/bookingflow/StepProgressBar"
import { Button } from "@/components/ui/Button"
import { fetchCar } from "@/lib/api/cars"
import { fetchCountry } from "@/lib/api/countries"
import { parseSearchParams } from "@/lib/search-params"
import { formatDatetimeInTz } from "@/lib/datetime"
import { formatCurrency } from "@/lib/currency"

// ─── Metadata ────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ carId: string }>
}): Promise<Metadata> {
  const { carId } = await params
  const id = Number(carId)
  if (!id) return { title: "Vehicle Details" }
  try {
    const car = await fetchCar(id)
    return { title: `${car.make} ${car.model} ${car.year}` }
  } catch {
    return { title: "Vehicle Details" }
  }
}

// ─── Spec row ────────────────────────────────────────────────────────────────────

function SpecRow({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}): React.JSX.Element {
  return (
    <span className="body-3 flex items-center gap-1.5 text-brand-gray-600">
      {icon}
      {label}
    </span>
  )
}

// ─── Deposit Notice ───────────────────────────────────────────────────────────────

function DepositNotice({ amount, currencyCode }: { amount: number; currencyCode: string }): React.JSX.Element {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="body-3 text-amber-800">
        <p className="font-semibold">Security Deposit Required</p>
        <p className="mt-1">
          A security deposit of{" "}
          <span className="font-bold">{formatCurrency(amount, currencyCode)}</span> will
          be placed as an authorization hold on your card. This is{" "}
          <span className="font-semibold">not charged</span> — it is only a temporary
          hold that will be released once you return the vehicle in good condition.
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────────

interface CarDetailPageProps {
  params: Promise<{ carId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CarDetailPage({
  params,
  searchParams,
}: CarDetailPageProps): Promise<React.JSX.Element> {
  const { carId } = await params
  const id = Number(carId)
  if (!id || isNaN(id)) notFound()

  const rawParams = await searchParams
  const search = parseSearchParams(rawParams)

  // ── Fetch car + country ────────────────────────────────────────────────────
  let car: Awaited<ReturnType<typeof fetchCar>>
  try {
    car = await fetchCar(id)
  } catch {
    notFound()
  }

  let currencyCode = "THB"
  let depositAmount = 5000
  if (search.pickupCountryId) {
    try {
      const country = await fetchCountry(search.pickupCountryId)
      currencyCode = country.currencyCode
      depositAmount = parseFloat(country.defaultDepositAmount)
    } catch {
      // use fallbacks
    }
  }

  // ── Build URLs ────────────────────────────────────────────────────────────
  const currentQueryString = Object.entries(rawParams)
    .flatMap(([k, v]) => {
      if (!v) return []
      if (Array.isArray(v)) return v.map((s) => `${encodeURIComponent(k)}=${encodeURIComponent(s)}`)
      return [`${encodeURIComponent(k)}=${encodeURIComponent(v)}`]
    })
    .join("&")

  const checkoutHref = `/cars/${id}/checkout?${currentQueryString}`
  const backHref = `/cars?${currentQueryString}`

  const dropoffName = search.differentDropoff ? search.dropoffBranchName : search.pickupBranchName

  const CAR_TYPE_LABELS: Record<string, string> = {
    sedan: "Sedan",
    suv: "SUV",
    van: "Van",
    hatchback: "Hatchback",
    pickup: "Pickup",
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Step progress — ยังอยู่ใน "Pick your vehicle" */}
        <StepProgressBar steps={DEFAULT_BOOKING_STEPS} currentStepIndex={1} />

        {/* Back link */}
        <a
          href={backHref}
          className="body-3 flex w-fit items-center gap-1.5 text-brand-gray-500 hover:text-brand-gray-700"
        >
          ← Back to vehicles
        </a>

        {/* Trip summary */}
        {search.pickupBranchId && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-gray-100 bg-brand-gray-50 px-4 py-3 sm:gap-5 sm:px-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
              <span className="body-3 font-semibold text-brand-gray-900">{search.pickupBranchName || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-brand-gray-500" aria-hidden />
              <span className="body-3 text-brand-gray-700">
                {formatDatetimeInTz(search.pickupDatetime, search.pickupTimezone)}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-brand-gray-400" aria-hidden />
            {search.differentDropoff && dropoffName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-red-200" aria-hidden />
                <span className="body-3 font-semibold text-brand-gray-900">{dropoffName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-brand-gray-500" aria-hidden />
              <span className="body-3 text-brand-gray-700">
                {formatDatetimeInTz(search.dropoffDatetime, search.pickupTimezone)}
              </span>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left — รูปรถ */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-gray-100">
            {car.imageUrl ? (
              <Image
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-brand-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 opacity-20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" />
                  <circle cx="7.5" cy="14.5" r="1.5" />
                  <circle cx="16.5" cy="14.5" r="1.5" />
                </svg>
              </div>
            )}

            {/* type badge */}
            <span className="absolute left-3 top-3 rounded-full bg-brand-gray-900/75 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {CAR_TYPE_LABELS[car.carType] ?? car.carType}
            </span>
          </div>

          {/* Right — สเปค + ราคา + CTA */}
          <div className="flex flex-col gap-6">
            {/* ชื่อและราคา */}
            <div>
              <p className="body-3 text-brand-gray-500">{car.year}</p>
              <h1 className="headline-2 font-bold text-brand-gray-900">
                {car.make} {car.model}
              </h1>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <span className="headline-3 font-bold text-brand-gray-900">
                  {formatCurrency(car.dailyRate, currencyCode)}
                  <span className="body-2 ml-1 font-normal text-brand-gray-500">/day</span>
                </span>
                <span className="body-2 text-brand-gray-500">
                  or {formatCurrency(car.hourlyRate, currencyCode)}/hr
                </span>
              </div>
            </div>

            {/* สเปค */}
            <div className="flex flex-wrap gap-4">
              <SpecRow icon={<Users className="h-4 w-4" />} label={`${car.seats} seats`} />
              <SpecRow icon={<Briefcase className="h-4 w-4" />} label={`${car.luggageCapacity} bags`} />
              <SpecRow
                icon={<Settings2 className="h-4 w-4" />}
                label={car.transmission === "auto" ? "Automatic" : "Manual"}
              />
              <SpecRow
                icon={<Fuel className="h-4 w-4" />}
                label={car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1)}
              />
            </div>

            {/* คำอธิบาย */}
            {car.description && (
              <p className="body-2 text-brand-gray-600">{car.description}</p>
            )}

            {/* Deposit notice */}
            <DepositNotice amount={depositAmount} currencyCode={currencyCode} />

            {/* CTA */}
            {search.pickupBranchId ? (
              <Button href={checkoutHref} variant="primary" size="lg" className="w-full justify-center">
                Continue Booking
              </Button>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="body-3 text-amber-700">
                  Please{" "}
                  <a href="/" className="font-semibold underline hover:no-underline">
                    search for a pick-up location
                  </a>{" "}
                  before continuing.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
