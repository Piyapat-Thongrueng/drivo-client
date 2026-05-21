import Image from "next/image"
import { Briefcase, MapPin, Users } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/currency"
import { VEHICLE_SEARCH_SECTION_ID } from "@/lib/landing-scroll"
import type { FleetCar } from "@/types/fleet"

const CAR_TYPE_LABELS: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  hatchback: "Hatchback",
  pickup: "Pickup",
}

interface FleetCarCardProps {
  car: FleetCar
}

export default function FleetCarCard({ car }: FleetCarCardProps): React.JSX.Element {
  const carTypeLabel = CAR_TYPE_LABELS[car.carType] ?? car.carType
  const bookHref = `/#${VEHICLE_SEARCH_SECTION_ID}`

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-brand-gray-100 bg-brand-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full bg-brand-gray-50">
        {car.imageUrl ? (
          <Image
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-gray-300">
            <span className="body-3">No image</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-brand-gray-900/75 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {carTypeLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="body-3 text-brand-gray-500">{car.year}</p>
          <h3 className="body-1 font-bold text-brand-gray-900">
            {car.make} {car.model}
          </h3>
          <p className="body-3 mt-1 flex items-center gap-1 text-brand-gray-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red-200" aria-hidden />
            {car.branchName}, {car.countryName}
          </p>
        </div>

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
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="body-3 text-brand-gray-500">Starting from</p>
            <p className="headline-3 font-bold text-brand-gray-900">
              {formatCurrency(car.dailyRate, car.currencyCode)}
              <span className="body-3 ml-1 font-normal text-brand-gray-500">
                /day
              </span>
            </p>
          </div>

          <Button href={bookHref} variant="primary" size="md" className="shrink-0">
            Book Now
          </Button>
        </div>
      </div>
    </article>
  )
}
