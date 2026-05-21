"use client"

import { useEffect, useState } from "react"

import FleetCarCard from "@/components/customer/fleet/FleetCarCard"
import { fetchFleetCars } from "@/lib/api/cars"
import { fetchCountries } from "@/lib/api/countries"
import type { Country } from "@/types/country"
import type { FleetCar } from "@/types/fleet"

const ALL_COUNTRIES = "all" as const

export default function FleetCatalog(): React.JSX.Element {
  const [countries, setCountries] = useState<Country[]>([])
  const [cars, setCars] = useState<FleetCar[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>(ALL_COUNTRIES)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const countryId =
    selectedCountry === ALL_COUNTRIES ? undefined : Number(selectedCountry)

  useEffect(() => {
    let cancelled = false

    async function loadCountries(): Promise<void> {
      try {
        const data = await fetchCountries()
        if (!cancelled) setCountries(data.filter((c) => c.isActive))
      } catch {
        if (!cancelled) setError("Failed to load countries.")
      }
    }

    void loadCountries()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadFleet(): Promise<void> {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchFleetCars(countryId)
        if (!cancelled) setCars(data)
      } catch {
        if (!cancelled) {
          setError("Failed to load vehicles. Please try again.")
          setCars([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadFleet()
    return () => {
      cancelled = true
    }
  }, [countryId])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <label
            htmlFor="fleet-country-filter"
            className="body-3 font-semibold text-brand-gray-900"
          >
            Filter by country
          </label>
          <p className="body-3 mt-0.5 text-brand-gray-500">
            Browse every vehicle in our network by destination.
          </p>
        </div>

        <select
          id="fleet-country-filter"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="body-2 min-h-11 min-w-[min(100%,16rem)] rounded-lg border border-brand-gray-300 bg-brand-white px-3 py-2 text-brand-gray-900 focus:border-brand-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-gray-700"
        >
          <option value={ALL_COUNTRIES}>All countries</option>
          {countries.map((country) => (
            <option key={country.id} value={String(country.id)}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="body-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-brand-gray-100"
              aria-hidden
            />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-gray-200 bg-brand-gray-50 py-16 text-center">
          <p className="body-1 font-semibold text-brand-gray-700">No vehicles found</p>
          <p className="body-2 mt-2 text-brand-gray-500">
            {selectedCountry === ALL_COUNTRIES
              ? "There are no vehicles in the fleet yet."
              : "Try another country or view all countries."}
          </p>
        </div>
      ) : (
        <>
          <p className="body-3 text-brand-gray-600">
            Showing {cars.length} vehicle{cars.length === 1 ? "" : "s"}
            {selectedCountry !== ALL_COUNTRIES
              ? ` in ${countries.find((c) => String(c.id) === selectedCountry)?.name ?? "selected country"}`
              : " across all countries"}
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <FleetCarCard key={car.id} car={car} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
