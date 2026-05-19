import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { fetchCar } from "@/lib/api/cars"
import { fetchCountry } from "@/lib/api/countries"
import { fetchCarAddonsPublic } from "@/lib/api/car-addons"
import { parseSearchParams } from "@/lib/search-params"
import CheckoutPageClient from "@/components/customer/bookingflow/CheckoutPageClient"

export const metadata: Metadata = {
  title: "Review & Checkout",
  description: "Review your booking and complete checkout.",
}

interface CheckoutPageProps {
  params: Promise<{ carId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps): Promise<React.JSX.Element> {
  const { carId } = await params
  const id = Number(carId)
  if (!id || isNaN(id)) notFound()

  const rawParams = await searchParams
  const search = parseSearchParams(rawParams)

  // ── Fetch car + addons + country (in parallel) ────────────────────────────
  const [carResult, addonsResult, countryResult] = await Promise.allSettled([
    fetchCar(id),
    fetchCarAddonsPublic(id),
    search.pickupCountryId ? fetchCountry(search.pickupCountryId) : Promise.resolve(null),
  ])

  if (carResult.status === "rejected") notFound()
  const car = carResult.value

  const addons = addonsResult.status === "fulfilled" ? addonsResult.value : []
  const country = countryResult.status === "fulfilled" ? countryResult.value : null
  const currencyCode = country?.currencyCode ?? "THB"

  // ── Rebuild query string ───────────────────────────────────────────────────
  const currentQueryString = Object.entries(rawParams)
    .flatMap(([k, v]) => {
      if (!v) return []
      if (Array.isArray(v)) return v.map((s) => `${encodeURIComponent(k)}=${encodeURIComponent(s)}`)
      return [`${encodeURIComponent(k)}=${encodeURIComponent(v)}`]
    })
    .join("&")

  const dropoffBranchId =
    search.differentDropoff && search.dropoffBranchId
      ? search.dropoffBranchId
      : (search.pickupBranchId ?? 0)

  const dropoffBranchName =
    search.differentDropoff && search.dropoffBranchName
      ? search.dropoffBranchName
      : search.pickupBranchName

  if (!search.pickupBranchId) notFound()

  return (
    <CheckoutPageClient
      car={car}
      addons={addons}
      carId={id}
      pickupBranchId={search.pickupBranchId}
      dropoffBranchId={dropoffBranchId}
      pickupBranchName={search.pickupBranchName}
      dropoffBranchName={dropoffBranchName}
      pickupDatetime={search.pickupDatetime}
      dropoffDatetime={search.dropoffDatetime}
      pickupTimezone={search.pickupTimezone}
      searchQuery={currentQueryString}
      currencyCode={currencyCode}
    />
  )
}
