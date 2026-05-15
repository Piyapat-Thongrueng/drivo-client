"use client"

import type { Branch } from "@/types/branch"
import type { Country } from "@/types/country"
import {
  CAR_TYPE_OPTIONS,
  CAR_STATUS_OPTIONS,
} from "@/lib/constants/car-options"

export interface CarFilterValues {
  search: string
  countryId: string
  branchId: string
  carType: string
  status: string
}

interface CarFilterBarProps {
  countries: Country[]
  branches: Branch[]
  values: CarFilterValues
  onChange: (next: CarFilterValues) => void
}

const selectClass =
  "w-full rounded-lg border border-brand-gray-200 bg-white py-2 pl-3 pr-8 body-3 text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent"

export function CarFilterBar({ countries, branches, values, onChange }: CarFilterBarProps) {
  const countryIdNum = values.countryId ? Number(values.countryId) : null
  const branchesInCountry =
    countryIdNum != null
      ? branches.filter((b) => b.countryId === countryIdNum && b.isActive)
      : []

  function patch(partial: Partial<CarFilterValues>) {
    onChange({ ...values, ...partial })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-gray-100 bg-white p-4 shadow-sm">
      <p className="body-3 font-semibold text-brand-gray-800">Filters</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="flex flex-col gap-1.5 xl:col-span-2">
          <label className="body-3 font-medium text-brand-gray-700">Search</label>
          <input
            type="search"
            value={values.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Make, model, or license plate"
            className="w-full rounded-lg border border-brand-gray-200 bg-white px-3 py-2 body-3 text-brand-gray-900 placeholder:text-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="body-3 font-medium text-brand-gray-700">Country</label>
          <div className="relative">
            <select
              value={values.countryId}
              onChange={(e) => {
                const v = e.target.value
                patch({ countryId: v, branchId: "" })
              }}
              className={selectClass}
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="body-3 font-medium text-brand-gray-700">Branch</label>
          <div className="relative">
            <select
              value={values.branchId}
              onChange={(e) => patch({ branchId: e.target.value })}
              disabled={!values.countryId}
              className={`${selectClass} disabled:cursor-not-allowed disabled:bg-brand-gray-50 disabled:text-brand-gray-400`}
            >
              <option value="">
                {!values.countryId ? "Select country first" : "All branches in country"}
              </option>
              {branchesInCountry.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="body-3 font-medium text-brand-gray-700">Car type</label>
          <div className="relative">
            <select
              value={values.carType}
              onChange={(e) => patch({ carType: e.target.value })}
              className={selectClass}
            >
              <option value="">All types</option>
              {CAR_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="body-3 font-medium text-brand-gray-700">Status</label>
          <div className="relative">
            <select
              value={values.status}
              onChange={(e) => patch({ status: e.target.value })}
              className={selectClass}
            >
              <option value="">All statuses</option>
              {CAR_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>
      </div>
    </div>
  )
}

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
