"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCountries } from "@/hooks/useCountries"
import { useBranches } from "@/hooks/useBranches"
import { useCars } from "@/hooks/useCars"
import { deleteCar } from "@/lib/api/cars"
import { CarTable } from "@/components/admin/cars/CarTable"
import { CarFilterBar, type CarFilterValues } from "@/components/admin/cars/CarFilterBar"
import { ConfirmModal } from "@/components/admin/countries/ConfirmModal"
import { Button } from "@/components/ui/Button"
import { Pagination } from "@/components/ui/Pagination"
import type { Car } from "@/types/car"
import type { Branch } from "@/types/branch"

const PAGE_SIZE = 10

const defaultFilters: CarFilterValues = {
  search: "",
  countryId: "",
  branchId: "",
  carType: "",
  status: "",
}

function filterCars(cars: Car[], branches: Branch[], f: CarFilterValues): Car[] {
  let list = [...cars]
  const q = f.search.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (c) =>
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.licensePlate.toLowerCase().includes(q),
    )
  }
  if (f.countryId) {
    const cid = Number(f.countryId)
    const branchIds = new Set(
      branches.filter((b) => b.countryId === cid).map((b) => b.id),
    )
    list = list.filter((c) => branchIds.has(c.currentBranchId))
  }
  if (f.branchId) {
    const bid = Number(f.branchId)
    list = list.filter((c) => c.currentBranchId === bid)
  }
  if (f.carType) {
    list = list.filter((c) => c.carType === f.carType)
  }
  if (f.status) {
    list = list.filter((c) => c.status === f.status)
  }
  return list
}

function mapCarDeleteError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.status === 409) {
    const m = err.response?.data?.message
    if (typeof m === "string" && m.toLowerCase().includes("booking")) {
      return "Cannot delete: this car has active bookings."
    }
    if (typeof m === "string") return m
  }
  return "Failed to delete car."
}

export default function CarManagementPage(): React.JSX.Element {
  const router = useRouter()
  const { session } = useAuth()
  const token = session?.access_token ?? ""

  const { countries, isLoading: countriesLoading, error: countriesError } = useCountries()
  const { branches, isLoading: branchesLoading, error: branchesError } = useBranches(undefined)
  const { cars, isLoading: carsLoading, error: carsError, refetch } = useCars(token)

  const [filters, setFilters] = useState<CarFilterValues>(defaultFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  )

  const filteredCars = useMemo(
    () => filterCars(cars, branches, filters),
    [cars, branches, filters],
  )

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE))
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCars.slice(start, start + PAGE_SIZE)
  }, [filteredCars, currentPage])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(t)
  }, [toast])

  function handleFiltersChange(next: CarFilterValues) {
    setFilters(next)
    setCurrentPage(1)
  }

  const listError = carsError ?? countriesError ?? branchesError
  const isTableLoading = carsLoading

  async function handleConfirmDeleteCar() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCar(deleteTarget.id, token)
      setDeleteTarget(null)
      setToast({ message: "Car deleted successfully", variant: "success" })
      await refetch()
    } catch (err) {
      setToast({ message: mapCarDeleteError(err), variant: "error" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-semibold text-brand-gray-900">Car Management</p>
          <p className="body-3 mt-1 text-brand-gray-500">
            View and filter the fleet. Add a new vehicle or open filters to narrow by country and
            branch.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/cars/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Car
        </Button>
      </div>

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

      {listError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="body-3 text-red-600">{listError}</p>
        </div>
      )}

      <CarFilterBar
        countries={countries}
        branches={branches}
        values={filters}
        onChange={handleFiltersChange}
      />

      <CarTable
        cars={paginatedCars}
        branches={branches}
        countries={countries}
        isLoading={isTableLoading || branchesLoading || countriesLoading}
        onEdit={(car) => router.push(`/admin/cars/${car.id}/edit`)}
        onDelete={(car) => setDeleteTarget(car)}
      />

      <div className="flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Car"
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.make} ${deleteTarget.model} (${deleteTarget.licensePlate})?`
            : ""
        }
        confirmLabel="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDeleteCar()}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  )
}
