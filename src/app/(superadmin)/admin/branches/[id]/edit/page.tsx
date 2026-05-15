"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"
import { fetchBranch, updateBranch } from "@/lib/api/branches"
import { fetchCountry } from "@/lib/api/countries"
import { BranchForm } from "@/components/admin/branches/BranchForm"
import { OneWayFeeSection } from "@/components/admin/branches/OneWayFeeSection"
import { Skeleton } from "@/components/ui/skeleton"
import type { Branch, CreateBranchPayload } from "@/types/branch"
import type { Country } from "@/types/country"

export default function EditBranchPage() {
  const router = useRouter()
  const params = useParams()
  const { session } = useAuth()
  const branchId = Number(params.id)
  const token = session?.access_token ?? ""

  const [branch, setBranch] = useState<Branch | null>(null)
  const [country, setCountry] = useState<Country | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const branchData = await fetchBranch(branchId)
        const countryData = await fetchCountry(branchData.countryId)
        setBranch(branchData)
        setCountry(countryData)
      } catch {
        setFetchError("Branch not found.")
      } finally {
        setIsFetching(false)
      }
    }
    if (branchId) load()
  }, [branchId])

  async function handleSubmit(data: CreateBranchPayload) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await updateBranch(branchId, data, token)
      router.push("/admin/branches")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message ?? "Failed to update branch.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const LoadingSkeleton = () => (
    <div className="rounded-2xl border border-brand-gray-100 bg-white p-8">
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-8 h-4 w-80" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-2xl font-semibold text-brand-gray-900">Edit Branch</p>
        <p className="body-3 mt-1 text-brand-gray-500">
          Update branch details and configure one-way fees.
        </p>
      </div>

      {/* Loading skeleton */}
      {isFetching && (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      )}

      {/* Fetch error */}
      {!isFetching && fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{fetchError}</p>
        </div>
      )}

      {/* Branch form + one-way fees */}
      {!isFetching && branch && country && (
        <>
          <BranchForm
            initialData={branch}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/branches")}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />

          <OneWayFeeSection
            currentBranch={branch}
            country={country}
            token={token}
          />
        </>
      )}
    </div>
  )
}
