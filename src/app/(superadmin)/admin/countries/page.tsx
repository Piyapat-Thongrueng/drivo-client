"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCountries } from "@/hooks/useCountries"
import { updateCountry, deleteCountry } from "@/lib/api/countries"
import { CountryTable } from "@/components/admin/countries/CountryTable"
import { ConfirmModal } from "@/components/admin/countries/ConfirmModal"
import { Button } from "@/components/ui/Button"
import type { Country } from "@/types/country"

export default function CountriesPage() {
  const router = useRouter()
  const { session } = useAuth()
  const { countries, isLoading, error, refetch } = useCountries()

  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Country | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const token = session?.access_token ?? ""

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteCountry(deleteTarget.id, token)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.message ?? "Failed to delete country.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleConfirmToggle() {
    if (!toggleTarget) return
    setIsToggling(true)
    setActionError(null)
    try {
      await updateCountry(toggleTarget.id, { isActive: !toggleTarget.isActive }, token)
      setToggleTarget(null)
      refetch()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.message ?? "Failed to update status.")
      }
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-semibold text-brand-gray-900">Country Management</p>
          <p className="body-3 mt-1 text-brand-gray-500">
            Manage countries where Drivo operates.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/countries/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Country
        </Button>
      </div>

      {/* Fetch error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{error}</p>
        </div>
      )}

      {/* Action error banner (delete / toggle failures) */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{actionError}</p>
        </div>
      )}

      {/* Country table */}
      <CountryTable
        countries={countries}
        isLoading={isLoading}
        onEdit={(country) => router.push(`/admin/countries/${country.id}/edit`)}
        onDelete={(country) => {
          setActionError(null)
          setDeleteTarget(country)
        }}
        onToggleStatus={(country) => {
          setActionError(null)
          setToggleTarget(country)
        }}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Country"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Status toggle confirmation modal */}
      <ConfirmModal
        isOpen={!!toggleTarget}
        title={toggleTarget?.isActive ? "Deactivate Country" : "Activate Country"}
        description={
          toggleTarget?.isActive
            ? `Are you sure you want to deactivate "${toggleTarget?.name}"? Users will no longer see it in search.`
            : `Are you sure you want to activate "${toggleTarget?.name}"?`
        }
        confirmLabel={toggleTarget?.isActive ? "Deactivate" : "Activate"}
        isDangerous={toggleTarget?.isActive}
        isLoading={isToggling}
        onConfirm={handleConfirmToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  )
}
