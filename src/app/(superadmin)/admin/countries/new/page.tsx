"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"
import { createCountry } from "@/lib/api/countries"
import { CountryForm } from "@/components/admin/countries/CountryForm"
import type { CreateCountryPayload } from "@/types/country"

export default function NewCountryPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(data: CreateCountryPayload) {
    const token = session?.access_token ?? ""
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await createCountry(data, token)
      router.push("/admin/countries")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message ?? "Failed to create country.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-2xl font-semibold text-brand-gray-900">Add New Country</p>
        <p className="body-3 mt-1 text-brand-gray-500">
          Fill in the details below to add a new country.
        </p>
      </div>

      <CountryForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/countries")}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  )
}
