"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchBranches } from "@/lib/api/branches"
import type { Branch } from "@/types/branch"

export function useBranches(countryId?: number) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchBranches(countryId)
      setBranches(data)
    } catch {
      setError("Failed to load branches. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [countryId])

  useEffect(() => {
    load()
  }, [load])

  return { branches, isLoading, error, refetch: load }
}
