"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/contexts/auth-context"
import { createBranch } from "@/lib/api/branches"
import { BranchForm } from "@/components/admin/branches/BranchForm"
import type { CreateBranchPayload } from "@/types/branch"

export default function NewBranchPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(data: CreateBranchPayload) {
    const token = session?.access_token ?? ""
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await createBranch(data, token)
      router.push("/admin/branches")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.message ?? "Failed to create branch.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-2xl font-semibold text-brand-gray-900">Add New Branch</p>
        <p className="body-3 mt-1 text-brand-gray-500">
          Fill in the details below to add a new branch.
        </p>
      </div>

      <BranchForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/branches")}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  )
}
