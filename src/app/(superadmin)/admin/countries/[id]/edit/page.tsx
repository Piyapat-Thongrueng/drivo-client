"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"
import { fetchCountry, updateCountry } from "@/lib/api/countries"
import { CountryForm } from "@/components/admin/countries/CountryForm"
import { Skeleton } from "@/components/ui/skeleton"
import type { Country, CreateCountryPayload } from "@/types/country"

export default function EditCountryPage() {
  const router = useRouter()
  const params = useParams()
  const { session } = useAuth()
  const countryId = Number(params.id)

  const [country, setCountry] = useState<Country | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch the country to pre-fill the form
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCountry(countryId)
        setCountry(data)
      } catch {
        setFetchError("Country not found.")
      } finally {
        setIsFetching(false)
      }
    }
    if (countryId) load()
  }, [countryId])

  async function handleSubmit(data: CreateCountryPayload) {
    const token = session?.access_token ?? ""
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await updateCountry(countryId, data, token)
      router.push("/admin/countries")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message ?? "Failed to update country.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-2xl font-semibold text-brand-gray-900">Edit Country</p>
        <p className="body-3 mt-1 text-brand-gray-500">
          Update the details for this country.
        </p>
      </div>

      {/* Loading skeleton while fetching country data */}
      {isFetching && (
        <div className="rounded-2xl border border-brand-gray-100 bg-white p-8">
          <Skeleton className="mb-2 h-7 w-48" />
          <Skeleton className="mb-8 h-4 w-80" />
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fetch error */}
      {!isFetching && fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{fetchError}</p>
        </div>
      )}

      {/* Form with pre-filled data */}
      {!isFetching && country && (
        <CountryForm
          initialData={country}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/countries")}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  )
}
