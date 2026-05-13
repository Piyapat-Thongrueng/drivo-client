"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCountries } from "@/hooks/useCountries"
import { useBranches } from "@/hooks/useBranches"
import { updateBranch, deleteBranch } from "@/lib/api/branches"
import { BranchTable } from "@/components/admin/branches/BranchTable"
import { ConfirmModal } from "@/components/admin/countries/ConfirmModal"
import { Button } from "@/components/ui/Button"
import { Pagination } from "@/components/ui/Pagination"
import type { Branch } from "@/types/branch"

const PAGE_SIZE = 10

export default function BranchesPage() {
  const router = useRouter()
  const { session } = useAuth()
  const token = session?.access_token ?? ""

  const { countries } = useCountries()
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined)
  const { branches, isLoading, error, refetch } = useBranches(selectedCountryId)

  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Branch | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Pagination
  const totalPages = Math.max(1, Math.ceil(branches.length / PAGE_SIZE))
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return branches.slice(start, start + PAGE_SIZE)
  }, [branches, currentPage])

  function handleCountryFilter(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setSelectedCountryId(val === "" ? undefined : parseInt(val, 10))
    setCurrentPage(1)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteBranch(deleteTarget.id, token)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setActionError(err.response?.data?.message ?? "Failed to delete branch.")
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
      await updateBranch(toggleTarget.id, { isActive: !toggleTarget.isActive }, token)
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-semibold text-brand-gray-900">Branch Management</p>
          <p className="body-3 mt-1 text-brand-gray-500">
            Manage all Drivo branches and their one-way fees.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/branches/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Branch
        </Button>
      </div>

      {/* Country filter */}
      <div className="flex items-center gap-3">
        <label className="body-3 font-medium text-brand-gray-700 whitespace-nowrap">
          Filter by Country
        </label>
        <div className="relative w-56">
          <select
            value={selectedCountryId ?? ""}
            onChange={handleCountryFilter}
            className="w-full appearance-none rounded-lg border border-brand-gray-200 bg-white py-2 pl-3 pr-8 body-3 text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors"
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Fetch error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{error}</p>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{actionError}</p>
        </div>
      )}

      {/* Branch table */}
      <BranchTable
        branches={paginatedBranches}
        countries={countries}
        isLoading={isLoading}
        onEdit={(branch) => router.push(`/admin/branches/${branch.id}/edit`)}
        onDelete={(branch) => {
          setActionError(null)
          setDeleteTarget(branch)
        }}
        onToggleStatus={(branch) => {
          setActionError(null)
          setToggleTarget(branch)
        }}
        onOneWayFee={(branch) => router.push(`/admin/branches/${branch.id}/edit`)}
      />

      {/* Pagination */}
      <div className="flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Branch"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Status toggle confirmation */}
      <ConfirmModal
        isOpen={!!toggleTarget}
        title={toggleTarget?.isActive ? "Deactivate Branch" : "Activate Branch"}
        description={
          toggleTarget?.isActive
            ? `Deactivate "${toggleTarget?.name}"? It will no longer be available for new bookings.`
            : `Activate "${toggleTarget?.name}"?`
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
