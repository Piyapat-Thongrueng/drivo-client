"use client"

import Image from "next/image"
import { MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react"
import type { Car } from "@/types/car"
import type { PricingPreviewResult } from "@/types/pricing"
import { formatCurrency } from "@/lib/currency"
import { formatDatetimeInTz } from "@/lib/datetime"

interface PricingSidebarProps {
  car: Car
  pickupBranchName: string
  dropoffBranchName: string
  pickupDatetime: string
  dropoffDatetime: string
  timezone: string
  pricing: PricingPreviewResult | null
  isLoading?: boolean
}

export default function PricingSidebar({
  car,
  pickupBranchName,
  dropoffBranchName,
  pickupDatetime,
  dropoffDatetime,
  timezone,
  pricing,
  isLoading,
}: PricingSidebarProps): React.JSX.Element {
  const currencyCode = pricing?.currencyCode ?? "THB"

  return (
    <aside className="sticky top-24 flex flex-col gap-5 rounded-2xl border border-brand-gray-100 bg-white p-5 shadow-sm">
      {/* รูปรถ + ชื่อ */}
      <div className="flex gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-gray-100">
          {car.imageUrl ? (
            <Image
              src={car.imageUrl}
              alt={`${car.make} ${car.model}`}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <p className="body-3 text-brand-gray-500">{car.year}</p>
          <p className="body-1 font-bold text-brand-gray-900">{car.make} {car.model}</p>
        </div>
      </div>

      {/* Trip summary */}
      <div className="flex flex-col gap-1.5 border-t border-brand-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red-200" aria-hidden />
          <span className="body-3 font-semibold text-brand-gray-800">{pickupBranchName || "—"}</span>
        </div>
        <div className="ml-1 flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-gray-400" aria-hidden />
          <span className="body-3 text-brand-gray-600">{formatDatetimeInTz(pickupDatetime, timezone)}</span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-gray-300" aria-hidden />
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red-200" aria-hidden />
          <span className="body-3 font-semibold text-brand-gray-800">{dropoffBranchName || pickupBranchName || "—"}</span>
        </div>
        <div className="ml-1 flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-gray-400" aria-hidden />
          <span className="body-3 text-brand-gray-600">{formatDatetimeInTz(dropoffDatetime, timezone)}</span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="flex flex-col gap-2 border-t border-brand-gray-100 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-brand-gray-400" />
          </div>
        ) : pricing ? (
          <>
            {/* Vehicle rate */}
            <PriceRow
              label={
                pricing.days > 0
                  ? `Vehicle rate (${pricing.days} day${pricing.days !== 1 ? "s" : ""}${pricing.hours > 0 ? ` + ${pricing.hours}h` : ""})`
                  : `Vehicle rate (${pricing.hours} hour${pricing.hours !== 1 ? "s" : ""})`
              }
              amount={pricing.baseAmount}
              currencyCode={currencyCode}
            />

            {pricing.addonAmount > 0 && (
              <PriceRow label="Add-ons" amount={pricing.addonAmount} currencyCode={currencyCode} />
            )}

            {pricing.oneWayFee > 0 && (
              <PriceRow label="One-way fee" amount={pricing.oneWayFee} currencyCode={currencyCode} />
            )}

            {/* Rental total */}
            <div className="mt-1 flex items-center justify-between border-t border-brand-gray-100 pt-2">
              <span className="body-2 font-semibold text-brand-gray-900">Rental total</span>
              <span className="body-2 font-bold text-brand-gray-900">
                {formatCurrency(pricing.totalAmount, currencyCode)}
              </span>
            </div>

            {/* Deposit (hold) */}
            <div className="flex items-start justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2">
              <div>
                <p className="body-3 font-semibold text-amber-800">Security deposit (hold)</p>
                <p className="body-3 text-amber-600">Not charged — released after return</p>
              </div>
              <span className="body-3 shrink-0 font-bold text-amber-800">
                {formatCurrency(pricing.depositAmount, currencyCode)}
              </span>
            </div>
          </>
        ) : (
          <p className="body-3 text-brand-gray-400 italic">Pricing will appear here.</p>
        )}
      </div>
    </aside>
  )
}

function PriceRow({
  label,
  amount,
  currencyCode,
}: {
  label: string
  amount: number
  currencyCode: string
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="body-3 text-brand-gray-600">{label}</span>
      <span className="body-3 font-medium text-brand-gray-900">
        {formatCurrency(amount, currencyCode)}
      </span>
    </div>
  )
}
