"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchCars } from "@/lib/api/cars"
import type { Car } from "@/types/car"

export function useCars(token: string) {
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      setCars([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCars(token)
      setCars(data)
    } catch {
      setError("Failed to load cars. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(t)
  }, [load])

  return { cars, isLoading, error, refetch: load }
}
