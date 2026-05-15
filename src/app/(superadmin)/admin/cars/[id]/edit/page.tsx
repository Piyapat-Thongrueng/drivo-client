"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"
import { useBranches } from "@/hooks/useBranches"
import { fetchCar, updateCar } from "@/lib/api/cars"
import { fetchCarAddons } from "@/lib/api/car-addons"
import { EditCarForm } from "@/components/admin/cars/EditCarForm"
import { CarAddonsPanel } from "@/components/admin/cars/CarAddonsPanel"
import { MaintenanceWarningModal } from "@/components/admin/cars/MaintenanceWarningModal"
import { Skeleton } from "@/components/ui/skeleton"
import type { CarAddon } from "@/types/car-addon"
import type { CarDetail, UpdateCarPayload } from "@/types/car"

export default function EditCarPage(): React.JSX.Element {
  const router = useRouter()
  const params = useParams()
  const carId = Number(params.id)
  const { session } = useAuth()
  const token = session?.access_token ?? ""
  const { branches } = useBranches(undefined)

  const [car, setCar] = useState<CarDetail | null>(null)
  const [addons, setAddons] = useState<CarAddon[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [maintenanceModal, setMaintenanceModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  )
  const [createdBanner, setCreatedBanner] = useState(false)

  const reloadCar = useCallback(async () => {
    const data = await fetchCar(carId)
    setCar(data)
    return data
  }, [carId])

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("drivo_car_created_toast") === "1") {
      sessionStorage.removeItem("drivo_car_created_toast")
      setCreatedBanner(true)
    }
  }, [])

  useEffect(() => {
    if (!carId || Number.isNaN(carId)) {
      setFetchError("Car not found.")
      setIsFetching(false)
      return
    }
    if (!token) {
      return
    }

    let cancelled = false

    async function load() {
      setIsFetching(true)
      setFetchError(null)
      try {
        const [c, a] = await Promise.all([fetchCar(carId), fetchCarAddons(carId, token)])
        if (!cancelled) {
          setCar(c)
          setAddons(a)
        }
      } catch {
        if (!cancelled) {
          setFetchError("Car not found or failed to load data.")
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [carId, token])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(t)
  }, [toast])

  async function handleSaveCar(payload: UpdateCarPayload) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await updateCar(carId, payload, token)
      await reloadCar()
      setToast({ message: "Saved successfully", variant: "success" })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data?.message as string) ?? "Failed to save changes."
        setSubmitError(msg)
        if (
          err.response?.status === 409 &&
          typeof msg === "string" &&
          msg.toLowerCase().includes("maintenance")
        ) {
          setMaintenanceModal(true)
        }
      } else {
        setSubmitError("Failed to save changes.")
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
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {createdBanner && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 body-3 text-emerald-800"
        >
          Car created successfully — you can edit details and add-ons on this page.
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => setCreatedBanner(false)}
          >
            Dismiss
          </button>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 body-3 ${
            toast.variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div>
        <p className="text-2xl font-semibold text-brand-gray-900">Edit Car</p>
        <p className="body-3 mt-1 text-brand-gray-500">
          Update vehicle details and manage add-ons for this car.
        </p>
      </div>

      {isFetching && (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      )}

      {!isFetching && fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{fetchError}</p>
        </div>
      )}

      {!isFetching && car && token && (
        <>
          <EditCarForm
            car={car}
            branches={branches}
            fetchCarDetail={reloadCar}
            onMaintenanceBlocked={() => setMaintenanceModal(true)}
            onSubmit={handleSaveCar}
            onCancel={() => router.push("/admin/cars")}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />

          <CarAddonsPanel
            carId={carId}
            token={token}
            addons={addons}
            onAddonsChange={setAddons}
            onToast={(message, variant = "success") => setToast({ message, variant })}
          />
        </>
      )}

      <MaintenanceWarningModal
        isOpen={maintenanceModal}
        onClose={() => setMaintenanceModal(false)}
      />
    </div>
  )
}
