import Image from "next/image"
import Link from "next/link"
import { Briefcase, Users } from "lucide-react"

import type { Car } from "@/types/car"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/currency"

// ─── Helper: ป้าย carType ────────────────────────────────────────────────────────

const CAR_TYPE_LABELS: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  hatchback: "Hatchback",
  pickup: "Pickup",
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface CarCardProps {
  car: Car
  /** query string ที่ต้องส่งต่อไปยัง booking page เพื่อ preserve search context */
  searchQuery: string
  /** รหัสสกุลเงินของสาขารับรถ เช่น "THB", "GBP" */
  currencyCode: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CarCard({ car, searchQuery, currencyCode }: CarCardProps): React.JSX.Element {
  const carTypeLabel = CAR_TYPE_LABELS[car.carType] ?? car.carType
  const bookingHref = `/cars/${car.id}?${searchQuery}`

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-brand-gray-100 bg-brand-white shadow-sm transition-shadow hover:shadow-md">
      {/* รูปรถ */}
      <div className="relative aspect-video w-full bg-brand-gray-50">
        {car.imageUrl ? (
          <Image
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 opacity-30"
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

        {/* badge ประเภทรถ */}
        <span className="absolute left-3 top-3 rounded-full bg-brand-gray-900/75 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {carTypeLabel}
        </span>
      </div>

      {/* รายละเอียดรถ */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* ชื่อรถ */}
        <div>
          <p className="body-3 text-brand-gray-500">{car.year}</p>
          <h3 className="body-1 font-bold text-brand-gray-900">
            {car.make} {car.model}
          </h3>
        </div>

        {/* สเปค */}
        <div className="flex flex-wrap gap-3 text-brand-gray-600">
          <span className="body-3 flex items-center gap-1">
            <Users className="h-4 w-4" aria-hidden />
            {car.seats} seats
          </span>
          <span className="body-3 flex items-center gap-1">
            <Briefcase className="h-4 w-4" aria-hidden />
            {car.luggageCapacity} bags
          </span>
          <span className="body-3 capitalize">{car.transmission}</span>
          <span className="body-3 capitalize">{car.fuelType}</span>
        </div>

        {/* ราคา + ปุ่ม */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="body-3 text-brand-gray-500">Starting from</p>
            <p className="headline-3 font-bold text-brand-gray-900">
              {formatCurrency(car.dailyRate, currencyCode)}
              <span className="body-3 ml-1 font-normal text-brand-gray-500">/day</span>
            </p>
            <p className="body-3 text-brand-gray-500">
              or {formatCurrency(car.hourlyRate, currencyCode)}/hr
            </p>
          </div>

          <Button
            href={bookingHref}
            variant="primary"
            size="md"
            className="shrink-0"
          >
            Select
          </Button>
        </div>
      </div>
    </article>
  )
}
