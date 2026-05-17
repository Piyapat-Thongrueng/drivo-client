"use client"

import { useEffect, useRef, useState } from "react"
import { Car, ChevronDown, Search, X } from "lucide-react"

import type { Country } from "@/types/country"
import type { Branch } from "@/types/branch"
import { fetchCountries } from "@/lib/api/countries"
import { fetchBranches } from "@/lib/api/branches"

// ─── Props ──────────────────────────────────────────────────────────────────────

interface BranchLocationComboboxProps {
  id: string
  label: string
  placeholder: string

  /** ID ของสาขาที่เลือกอยู่ */
  selectedBranchId: number | null

  /** ชื่อสาขาที่แสดงใน input */
  displayValue: string

  /** callback เมื่อเลือกสาขา */
  onChange: (branchId: number, branchName: string, countryId: number) => void

  /** callback เมื่อกดล้างค่า (ถ้าไม่ส่งมา ปุ่มล้างจะไม่แสดง) */
  onClear?: () => void

  /** กรองเฉพาะสาขาในประเทศนี้ (drop-off ห้ามข้ามประเทศ) */
  filterCountryId?: number | null

  /** ซ่อนสาขานี้ (ป้องกัน pick-up = drop-off) */
  excludeBranchId?: number | null

  /** ปิด input ทั้งหมด */
  disabled?: boolean

  /** error message แสดงใต้ field */
  errorMessage?: string
}

// ─── Helper: จัดกลุ่มสาขาตามประเทศ ──────────────────────────────────────────────

interface BranchGroup {
  country: Country
  branches: Branch[]
}

function groupBranchesByCountry(
  countries: Country[],
  branches: Branch[],
  filterCountryId: number | null | undefined,
  excludeBranchId: number | null | undefined,
): BranchGroup[] {
  const relevantCountries = filterCountryId
    ? countries.filter((c) => c.id === filterCountryId && c.isActive)
    : countries.filter((c) => c.isActive)

  return relevantCountries
    .map((country) => ({
      country,
      branches: branches.filter(
        (b) =>
          b.countryId === country.id &&
          b.isActive &&
          b.id !== excludeBranchId,
      ),
    }))
    .filter((g) => g.branches.length > 0)
}

// ─── Helper: filter ด้วยข้อความค้นหา ────────────────────────────────────────────

function filterGroups(groups: BranchGroup[], query: string): BranchGroup[] {
  if (!query.trim()) return groups
  const q = query.toLowerCase()
  return groups
    .map((g) => ({
      country: g.country,
      branches: g.branches.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          g.country.name.toLowerCase().includes(q) ||
          g.country.code.toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.branches.length > 0)
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BranchLocationCombobox({
  id,
  label,
  placeholder,
  selectedBranchId,
  displayValue,
  onChange,
  onClear,
  filterCountryId,
  excludeBranchId,
  disabled = false,
  errorMessage,
}: BranchLocationComboboxProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [countries, setCountries] = useState<Country[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // โหลดประเทศ + สาขา 1 ครั้ง
  useEffect(() => {
    setLoading(true)
    Promise.all([fetchCountries(), fetchBranches()])
      .then(([c, b]) => {
        setCountries(c)
        setBranches(b)
      })
      .catch(() => {/* ไม่ต้องแสดง error — dropdown จะเป็นว่าง */})
      .finally(() => setLoading(false))
  }, [])

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    function onClickOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const allGroups = groupBranchesByCountry(countries, branches, filterCountryId, excludeBranchId)
  const filteredGroups = filterGroups(allGroups, query)

  // ตรวจว่าประเทศที่ filter มีสาขาให้เลือกหรือไม่ (single-branch country case)
  const noDropoffOptions = filterCountryId != null && allGroups.length === 0

  function handleTriggerClick(): void {
    if (disabled) return
    setOpen((prev) => !prev)
    if (!open) {
      setQuery("")
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }

  function handleSelect(branch: Branch, country: Country): void {
    onChange(branch.id, branch.name, country.id)
    setOpen(false)
    setQuery("")
  }

  function handleClearClick(e: React.MouseEvent): void {
    e.stopPropagation()
    onClear?.()
  }

  const triggerBorderClass = errorMessage
    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
    : "border-brand-gray-300 hover:border-brand-gray-500 focus-within:border-brand-gray-700 focus-within:ring-brand-gray-700"

  return (
    <div className="relative flex min-w-0 flex-col gap-2" ref={containerRef}>
      {/* Label */}
      <span className="block body-3 font-bold uppercase tracking-wide text-brand-gray-900">
        {label}
      </span>

      {/* Trigger button */}
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        onClick={handleTriggerClick}
        className={`relative flex min-h-11 w-full items-center rounded-lg border bg-brand-white text-left transition-colors
          ${disabled ? "cursor-not-allowed border-brand-gray-200 bg-brand-gray-50" : `cursor-pointer ${triggerBorderClass} focus-visible:ring-1 focus-visible:outline-none`}
        `}
      >
        <Car className="pointer-events-none absolute left-3 h-5 w-5 shrink-0 text-brand-gray-500" aria-hidden />
        <span
          className={`body-2 block flex-1 truncate py-2.5 pr-10 pl-10 ${
            displayValue
              ? disabled ? "text-brand-gray-400" : "text-brand-gray-900"
              : "text-brand-gray-500"
          }`}
        >
          {displayValue || placeholder}
        </span>

        {/* ปุ่มล้างค่า หรือ ลูกศรชี้ลง */}
        {onClear && selectedBranchId && !disabled ? (
          <span
            role="button"
            aria-label="Clear location"
            tabIndex={0}
            className="absolute right-2 rounded-md p-1 text-brand-gray-500 transition-colors hover:bg-brand-gray-50 hover:text-brand-gray-900"
            onClick={handleClearClick}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClearClick(e as unknown as React.MouseEvent) }}
          >
            <X className="h-4 w-4" aria-hidden />
          </span>
        ) : (
          <ChevronDown
            className={`absolute right-3 h-4 w-4 text-brand-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {/* Error */}
      {errorMessage && (
        <p className="body-3 text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Dropdown panel */}
      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute top-full left-0 z-50 mt-1 w-full min-w-64 overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-white shadow-xl"
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-brand-gray-100 px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-brand-gray-500" aria-hidden />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or branch..."
              className="body-2 w-full bg-transparent text-brand-gray-900 placeholder:text-brand-gray-400 focus:outline-none"
              autoComplete="off"
            />
          </div>

          {/* รายการ */}
          <div className="max-h-64 overflow-y-auto py-1">
            {loading && (
              <p className="body-3 px-4 py-3 text-brand-gray-500">Loading locations...</p>
            )}

            {/* กรณีไม่มีสาขาให้เลือก (single-branch country) */}
            {!loading && noDropoffOptions && (
              <p className="body-3 px-4 py-3 text-brand-gray-500">
                No other branches available in this country.
              </p>
            )}

            {!loading && !noDropoffOptions && filteredGroups.length === 0 && (
              <p className="body-3 px-4 py-3 text-brand-gray-500">No locations found.</p>
            )}

            {filteredGroups.map((group) => (
              <div key={group.country.id}>
                {/* หัวประเทศ */}
                <div className="body-3 sticky top-0 bg-brand-gray-50 px-4 py-1.5 font-semibold uppercase tracking-wide text-brand-gray-500">
                  {group.country.name}
                </div>

                {/* สาขาในประเทศ */}
                {group.branches.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    role="option"
                    aria-selected={branch.id === selectedBranchId}
                    onClick={() => handleSelect(branch, group.country)}
                    className={`w-full px-4 py-2.5 text-left transition-colors hover:bg-brand-gray-50 focus:bg-brand-gray-50 focus:outline-none
                      ${branch.id === selectedBranchId ? "bg-brand-red-50 text-brand-red-200" : "text-brand-gray-900"}
                    `}
                  >
                    <span className="body-2 block font-medium">{branch.name}</span>
                    <span className="body-3 block text-brand-gray-500">{branch.address}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
