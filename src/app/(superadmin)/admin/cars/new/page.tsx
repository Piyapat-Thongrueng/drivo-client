"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"
import { useBranches } from "@/hooks/useBranches"
import { createCar } from "@/lib/api/cars"
import { NewCarForm } from "@/components/admin/cars/NewCarForm"
import type { CreateCarPayload } from "@/types/car"

export default function NewCarPage(): React.JSX.Element {
  const router = useRouter()
  const { session } = useAuth()
  const { branches } = useBranches(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(data: CreateCarPayload) {
    const token = session?.access_token ?? ""
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const car = await createCar(data, token)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("drivo_car_created_toast", "1")
      }
      router.push(`/admin/cars/${String(car.id)}/edit`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message ?? "Failed to create car.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-2xl font-semibold text-brand-gray-900">Add New Car</p>
        <p className="body-3 mt-1 text-brand-gray-500">
          Upload an image to Supabase, then save. You will be taken to the car edit screen when
          done.
        </p>
      </div>

      <NewCarForm
        branches={branches}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/cars")}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  )
}
