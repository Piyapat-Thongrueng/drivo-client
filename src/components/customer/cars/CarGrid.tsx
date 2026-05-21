import type { Car } from "@/types/car"
import CarCard from "./CarCard"

// ─── Props ──────────────────────────────────────────────────────────────────────

interface CarGridProps {
  cars: Car[]
  /** query string ส่งต่อไปยัง CarCard เพื่อ preserve search context */
  searchQuery: string
  /** รหัสสกุลเงินของสาขารับรถ เช่น "THB", "GBP" */
  currencyCode: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function CarGrid({ cars, searchQuery, currencyCode }: CarGridProps): React.JSX.Element {
  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-gray-200 bg-brand-gray-50 py-20 text-center">
        <p className="body-1 font-semibold text-brand-gray-700">No vehicles available</p>
        <p className="body-2 text-brand-gray-500">
          Try adjusting your dates or pick-up location.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} searchQuery={searchQuery} currencyCode={currencyCode} />
      ))}
    </div>
  )
}
