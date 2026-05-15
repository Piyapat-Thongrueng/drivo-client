"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/spinner"
import { TIME_OPTIONS, formatTimeTo12hr } from "@/lib/constants/times"
import { fetchCountries } from "@/lib/api/countries"
import type { Country } from "@/types/country"
import type { Branch, CreateBranchPayload } from "@/types/branch"

interface BranchFormProps {
  initialData?: Branch
  onSubmit: (data: CreateBranchPayload) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError: string | null
}

interface FormErrors {
  countryId?: string
  name?: string
  address?: string
  latitude?: string
  longitude?: string
  openingTime?: string
  closingTime?: string
}

// PostgreSQL time column คืนค่ามาเป็น "HH:MM:SS" ต้องตัด seconds ออกให้เหลือ "HH:MM"
function toHHMM(t: string | null | undefined): string {
  if (!t) return ""
  return t.slice(0, 5)
}

// Regex: อนุญาตเฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และสัญลักษณ์ทั่วไป ไม่อนุญาตภาษาอื่น
const ENGLISH_ONLY_RE = /^[\x00-\x7F]*$/

// Regex: ตัวเลข อาจมีจุดทศนิยมหรือเครื่องหมายลบ
const NUMERIC_RE = /^-?\d+(\.\d+)?$/

export function BranchForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: BranchFormProps) {
  const isEditMode = !!initialData

  const [countries, setCountries] = useState<Country[]>([])
  const [countryId, setCountryId] = useState<string>(
    initialData?.countryId ? String(initialData.countryId) : "",
  )
  const [name, setName] = useState(initialData?.name ?? "")
  const [address, setAddress] = useState(initialData?.address ?? "")
  const [latitude, setLatitude] = useState(initialData?.latitude ?? "")
  const [longitude, setLongitude] = useState(initialData?.longitude ?? "")
  const [openingTime, setOpeningTime] = useState(toHHMM(initialData?.openingTime))
  const [closingTime, setClosingTime] = useState(toHHMM(initialData?.closingTime))
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => {})
  }, [])

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!countryId) newErrors.countryId = "Please select a country"
    if (!name.trim()) {
      newErrors.name = "Branch name is required"
    } else if (!ENGLISH_ONLY_RE.test(name)) {
      newErrors.name = "Branch name must be in English only"
    } else if (name.trim().length > 100) {
      newErrors.name = "Max 100 characters"
    }
    if (!address.trim()) {
      newErrors.address = "Address is required"
    } else if (!ENGLISH_ONLY_RE.test(address)) {
      newErrors.address = "Address must be in English only"
    } else if (address.trim().length > 300) {
      newErrors.address = "Max 300 characters"
    }

    const latStr = String(latitude).trim()
    const lngStr = String(longitude).trim()

    if (latStr !== "" && !NUMERIC_RE.test(latStr)) {
      newErrors.latitude = "Latitude must be a valid number"
    } else if (latStr !== "" && (parseFloat(latStr) < -90 || parseFloat(latStr) > 90)) {
      newErrors.latitude = "Latitude must be between -90 and 90"
    }
    if (lngStr !== "" && !NUMERIC_RE.test(lngStr)) {
      newErrors.longitude = "Longitude must be a valid number"
    } else if (lngStr !== "" && (parseFloat(lngStr) < -180 || parseFloat(lngStr) > 180)) {
      newErrors.longitude = "Longitude must be between -180 and 180"
    }
    if (!openingTime) newErrors.openingTime = "Please select opening time"
    if (!closingTime) newErrors.closingTime = "Please select closing time"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const latStr = String(latitude).trim()
    const lngStr = String(longitude).trim()

    await onSubmit({
      countryId: parseInt(countryId, 10),
      name: name.trim(),
      address: address.trim(),
      latitude: latStr !== "" ? parseFloat(latStr) : null,
      longitude: lngStr !== "" ? parseFloat(lngStr) : null,
      openingTime: openingTime || null,
      closingTime: closingTime || null,
      isActive: initialData?.isActive ?? true,
    })
  }

  const inputCls = (hasError: boolean) =>
    `w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors ${
      hasError ? "border-red-400" : "border-brand-gray-200"
    }`

  const selectCls = (hasError: boolean) =>
    `w-full appearance-none rounded-lg border bg-white py-2.5 pl-10 pr-10 body-3 text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors ${
      hasError ? "border-red-400" : "border-brand-gray-200"
    }`

  const ChevronDown = () => (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-brand-gray-100">
        <div className="mb-8">
          <h1 className="headline-3 text-brand-gray-900">Branch Details</h1>
          <p className="body-3 mt-1 text-brand-gray-500">
            Fill in the branch information. All text fields must be in English.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Country */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">Country</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                disabled={isEditMode}
                className={`${selectCls(!!errors.countryId)} ${isEditMode ? "cursor-not-allowed opacity-60" : ""} ${!countryId ? "text-brand-gray-300" : ""}`}
              >
                <option value="" disabled>
                  Select country
                </option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
            {errors.countryId ? (
              <p className="body-3 text-red-500">{errors.countryId}</p>
            ) : isEditMode ? (
              <p className="body-3 text-brand-gray-400">Country cannot be changed after creation.</p>
            ) : (
              <p className="body-3 text-brand-gray-400">Select the country this branch belongs to.</p>
            )}
          </div>

          {/* Branch Name */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">Branch Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bangkok International Airport"
                maxLength={100}
                className={inputCls(!!errors.name)}
              />
            </div>
            {errors.name ? (
              <p className="body-3 text-red-500">{errors.name}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">English only, max 100 characters.</p>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-brand-gray-300" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Airport Road, Lat Krabang, Bangkok 10520"
                maxLength={300}
                rows={3}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors resize-none ${
                  errors.address ? "border-red-400" : "border-brand-gray-200"
                }`}
              />
            </div>
            {errors.address ? (
              <p className="body-3 text-red-500">{errors.address}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">English only, max 300 characters.</p>
            )}
          </div>

          {/* Latitude */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">
              Latitude <span className="font-normal text-brand-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                inputMode="decimal"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 13.9272"
                className={inputCls(!!errors.latitude)}
              />
            </div>
            {errors.latitude ? (
              <p className="body-3 text-red-500">{errors.latitude}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">Decimal value between -90 and 90.</p>
            )}
          </div>

          {/* Longitude */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">
              Longitude <span className="font-normal text-brand-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-brand-gray-300" />
              <input
                type="text"
                inputMode="decimal"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 100.7539"
                className={inputCls(!!errors.longitude)}
              />
            </div>
            {errors.longitude ? (
              <p className="body-3 text-red-500">{errors.longitude}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">Decimal value between -180 and 180.</p>
            )}
          </div>

          {/* Opening Time */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Opening Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className={`${selectCls(!!errors.openingTime)} ${!openingTime ? "text-brand-gray-300" : ""}`}
              >
                <option value="" disabled>
                  Select time
                </option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatTimeTo12hr(t)}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
            {errors.openingTime && (
              <p className="body-3 text-red-500">{errors.openingTime}</p>
            )}
          </div>

          {/* Closing Time */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Closing Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className={`${selectCls(!!errors.closingTime)} ${!closingTime ? "text-brand-gray-300" : ""}`}
              >
                <option value="" disabled>
                  Select time
                </option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatTimeTo12hr(t)}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
            {errors.closingTime && (
              <p className="body-3 text-red-500">{errors.closingTime}</p>
            )}
          </div>
        </div>

        {submitError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="body-3 text-red-600">{submitError}</p>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Saving...
              </span>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Save Branch"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
