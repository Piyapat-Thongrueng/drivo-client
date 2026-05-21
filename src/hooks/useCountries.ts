"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchCountries } from "@/lib/api/countries"
import type { Country } from "@/types/country"

interface UseCountriesResult {
  countries: Country[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCountries()
      setCountries(data)
    } catch {
      setError("Failed to load countries. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { countries, isLoading, error, refetch }
}
