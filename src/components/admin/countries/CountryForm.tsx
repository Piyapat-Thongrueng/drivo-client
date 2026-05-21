"use client"

import { useState } from "react"
import { Clock, Globe, Hash, CircleDollarSign, Shield } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { TIMEZONE_OPTIONS } from "@/lib/constants/timezones"
import type { Country, CreateCountryPayload } from "@/types/country"

interface CountryFormProps {
  initialData?: Country
  onSubmit: (data: CreateCountryPayload) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError: string | null
}

interface FormErrors {
  name?: string
  code?: string
  currencyCode?: string
  timezone?: string
  defaultDepositAmount?: string
}

export function CountryForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: CountryFormProps) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [code, setCode] = useState(initialData?.code ?? "")
  const [currencyCode, setCurrencyCode] = useState(initialData?.currencyCode ?? "")
  const [timezone, setTimezone] = useState(initialData?.timezone ?? "")
  const [defaultDepositAmount, setDefaultDepositAmount] = useState(
    initialData?.defaultDepositAmount != null
      ? String(initialData.defaultDepositAmount)
      : "5000",
  )
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = "Country name is required"
    if (code.trim().length !== 2) newErrors.code = "Must be exactly 2 characters (e.g. TH)"
    if (currencyCode.trim().length !== 3)
      newErrors.currencyCode = "Must be exactly 3 characters (e.g. THB)"
    if (!timezone) newErrors.timezone = "Please select a timezone"
    const deposit = Number(defaultDepositAmount)
    if (!Number.isFinite(deposit) || deposit <= 0) {
      newErrors.defaultDepositAmount = "Deposit must be greater than 0"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      currencyCode: currencyCode.trim().toUpperCase(),
      timezone,
      isActive: initialData?.isActive ?? true,
      defaultDepositAmount: Number(defaultDepositAmount),
    })
  }

  // Auto-transform: capitalize first letter of Country Name
  function handleNameChange(value: string) {
    setName(value.charAt(0).toUpperCase() + value.slice(1))
  }

  const isEditMode = !!initialData

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-brand-gray-100">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline-3 text-brand-gray-900">Country Details</h1>
          <p className="body-3 mt-1 text-brand-gray-500">
            Provide the essential geographical and financial information to enable operations in a
            new territory.
          </p>
        </div>

        {/* Form grid — 2 columns */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Country Name */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Country Name</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Thailand"
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors ${
                  errors.name ? "border-red-400" : "border-brand-gray-200"
                }`}
              />
            </div>
            {errors.name ? (
              <p className="body-3 text-red-500">{errors.name}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">Full official name of the country.</p>
            )}
          </div>

          {/* ISO Country Code */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">ISO Country Code</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="E.G. TH"
                maxLength={2}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors tracking-widest ${
                  errors.code ? "border-red-400" : "border-brand-gray-200"
                }`}
              />
            </div>
            {errors.code ? (
              <p className="body-3 text-red-500">{errors.code}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">
                Standard 2-letter ISO 3166-1 alpha-2 code.
              </p>
            )}
          </div>

          {/* Currency Code */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Currency Code</label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                placeholder="E.G. THB"
                maxLength={3}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors tracking-widest ${
                  errors.currencyCode ? "border-red-400" : "border-brand-gray-200"
                }`}
              />
            </div>
            {errors.currencyCode ? (
              <p className="body-3 text-red-500">{errors.currencyCode}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">Standard 3-letter currency abbreviation.</p>
            )}
          </div>

          {/* Primary Timezone */}
          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Primary Timezone</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-10 pr-10 body-3 text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors ${
                  errors.timezone ? "border-red-400" : "border-brand-gray-200"
                } ${!timezone ? "text-brand-gray-300" : ""}`}
              >
                <option value="" disabled>
                  Select timezone
                </option>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              {/* Custom chevron icon */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {errors.timezone ? (
              <p className="body-3 text-red-500">{errors.timezone}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">Main operating timezone for this country.</p>
            )}
          </div>

          {/* Default deposit amount */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">
              Default deposit amount
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="number"
                min={1}
                step={1}
                value={defaultDepositAmount}
                onChange={(e) => setDefaultDepositAmount(e.target.value)}
                placeholder="e.g. 5000"
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent transition-colors ${
                  errors.defaultDepositAmount ? "border-red-400" : "border-brand-gray-200"
                }`}
              />
            </div>
            {errors.defaultDepositAmount ? (
              <p className="body-3 text-red-500">{errors.defaultDepositAmount}</p>
            ) : (
              <p className="body-3 text-brand-gray-400">
                Hold amount for new bookings in{" "}
                {currencyCode.trim() ? currencyCode.toUpperCase() : "local currency"} (authorized at
                checkout, released after return).
              </p>
            )}
          </div>
        </div>

        {/* API error banner */}
        {submitError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="body-3 text-red-600">{submitError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Save Country"}
          </Button>
        </div>
      </div>
    </form>
  )
}
