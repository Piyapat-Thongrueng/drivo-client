"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { FuelLevel, PhotoAngle } from "@/types/handover"
import { PHOTO_ANGLES, FUEL_LEVEL_LABELS } from "@/types/handover"
import { previewDepositSettlement } from "@/types/handover"
import type { DepositStatus } from "@/types/handover"
import type { HandoverBookingDetail } from "@/lib/api/branch-handover"
import { submitReturn } from "@/lib/api/branch-handover"
import {
  initPhotoRecord,
  createSlotFromFile,
  markSlotUploaded,
  markSlotError,
  missingAngles,
} from "@/lib/pickup-wizard"
import type { PhotoRecord } from "@/lib/pickup-wizard"
import {
  validateExtraCharge,
  validateReturnForm,
  buildReturnPayload,
  parseExtraCharge,
} from "@/lib/return-wizard"
import { uploadHandoverPhoto } from "@/lib/supabase/upload-handover-photo"
import { PhotoUploadGrid } from "./PhotoUploadGrid"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/currency"

// ─── Step type ────────────────────────────────────────────────────────────────

type Step = "photos" | "fuel" | "charge" | "confirm"

const STEP_ORDER: Step[] = ["photos", "fuel", "charge", "confirm"]
const STEP_LABELS: Record<Step, string> = {
  photos: "Vehicle Photos",
  fuel: "Fuel Level",
  charge: "Extra Charge",
  confirm: "Confirm",
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  detail: HandoverBookingDetail
  token: string
}

export function ReturnHandoverForm({ detail, token }: Props): React.JSX.Element {
  const router = useRouter()

  const depositAmount = parseFloat(detail.depositAmount)

  const [step, setStep] = useState<Step>("photos")
  const [photoRecord, setPhotoRecord] = useState<PhotoRecord>(initPhotoRecord)
  const [fuelLevel, setFuelLevel] = useState<FuelLevel | null>(null)
  const [extraChargeRaw, setExtraChargeRaw] = useState("0")
  const [chargeError, setChargeError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const stepIndex = STEP_ORDER.indexOf(step)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileSelected = useCallback(
    (angle: PhotoAngle, file: File, previewUrl: string) => {
      setPhotoRecord((prev) => ({
        ...prev,
        [angle]: createSlotFromFile(prev[angle], file, previewUrl),
      }))
    },
    [],
  )

  const handleSlotError = useCallback((angle: PhotoAngle, error: string) => {
    setPhotoRecord((prev) => ({
      ...prev,
      [angle]: { ...prev[angle], error },
    }))
  }, [])

  function handleChargeChange(raw: string) {
    setExtraChargeRaw(raw)
    setChargeError(validateExtraCharge(raw, depositAmount))
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const validationError = validateReturnForm(
      photoRecord,
      fuelLevel,
      extraChargeRaw,
      depositAmount,
    )
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      // Upload any photos that haven't been uploaded yet
      const updatedRecord = { ...photoRecord }
      for (const angle of PHOTO_ANGLES) {
        const slot = updatedRecord[angle]
        if (slot.file && !slot.uploaded) {
          try {
            const result = await uploadHandoverPhoto(
              slot.file,
              detail.bookingId,
              "return",
              angle,
            )
            updatedRecord[angle] = markSlotUploaded(slot, result)
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Upload failed"
            updatedRecord[angle] = markSlotError(slot, msg)
            setPhotoRecord(updatedRecord)
            setSubmitError(`Photo (${angle}): ${msg}`)
            setSubmitting(false)
            return
          }
        }
      }
      setPhotoRecord(updatedRecord)

      const payload = buildReturnPayload(updatedRecord, fuelLevel!, extraChargeRaw)
      await submitReturn(detail.bookingId, payload, token)

      router.push("/branch/return")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Navigation guards ────────────────────────────────────────────────────────

  function canAdvance(): boolean {
    if (step === "photos") return missingAngles(photoRecord).length === 0
    if (step === "fuel") return fuelLevel !== null
    if (step === "charge") return validateExtraCharge(extraChargeRaw, depositAmount) === null
    return false
  }

  function goNext() {
    const next = STEP_ORDER[stepIndex + 1]
    if (next) setStep(next)
  }

  function goBack() {
    const prev = STEP_ORDER[stepIndex - 1]
    if (prev) setStep(prev)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-12">
      <StepIndicator current={stepIndex} />

      {step === "photos" && (
        <PhotosStep
          photoRecord={photoRecord}
          onFileSelected={handleFileSelected}
          onSlotError={handleSlotError}
          disabled={submitting}
        />
      )}
      {step === "fuel" && (
        <FuelStep
          fuelLevel={fuelLevel}
          onFuelChange={setFuelLevel}
          disabled={submitting}
        />
      )}
      {step === "charge" && (
        <ChargeStep
          extraChargeRaw={extraChargeRaw}
          chargeError={chargeError}
          depositAmount={depositAmount}
          currencyCode={detail.currencyCode}
          onChargeChange={handleChargeChange}
          disabled={submitting}
        />
      )}
      {step === "confirm" && (
        <ConfirmStep
          detail={detail}
          photoRecord={photoRecord}
          fuelLevel={fuelLevel!}
          extraCharge={parseExtraCharge(extraChargeRaw)}
          depositAmount={depositAmount}
          submitError={submitError}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {stepIndex > 0 && (
          <Button variant="secondary" onClick={goBack} disabled={submitting} className="flex-1">
            ← Back
          </Button>
        )}
        {step !== "confirm" && (
          <Button
            variant="primary"
            onClick={goNext}
            disabled={!canAdvance()}
            className="flex-1"
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }): React.JSX.Element {
  return (
    <ol className="flex items-center gap-1">
      {STEP_ORDER.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-1">
          <div
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
              i < current
                ? "bg-brand-red-200 text-white"
                : i === current
                  ? "bg-brand-red-200 text-white ring-2 ring-brand-red-200 ring-offset-2"
                  : "bg-brand-gray-200 text-brand-gray-500",
            ].join(" ")}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={[
              "body-3 hidden text-xs sm:block",
              i === current ? "font-semibold text-brand-gray-900" : "text-brand-gray-400",
            ].join(" ")}
          >
            {STEP_LABELS[s]}
          </span>
          {i < STEP_ORDER.length - 1 && (
            <div
              className={[
                "h-px flex-1",
                i < current ? "bg-brand-red-200" : "bg-brand-gray-200",
              ].join(" ")}
            />
          )}
        </li>
      ))}
    </ol>
  )
}

// ─── Step 1: Photos ───────────────────────────────────────────────────────────

interface PhotosStepProps {
  photoRecord: PhotoRecord
  onFileSelected: (angle: PhotoAngle, file: File, previewUrl: string) => void
  onSlotError: (angle: PhotoAngle, error: string) => void
  disabled?: boolean
}

function PhotosStep({
  photoRecord,
  onFileSelected,
  onSlotError,
  disabled,
}: PhotosStepProps): React.JSX.Element {
  const missing = missingAngles(photoRecord)
  return (
    <div className="space-y-4">
      <h2 className="heading-5 text-brand-gray-900">Vehicle Photos</h2>
      <p className="text-sm text-brand-gray-500">
        Take photos of all 4 sides of the returned vehicle.
      </p>
      <PhotoUploadGrid
        record={photoRecord}
        onFileSelected={onFileSelected}
        onSlotError={onSlotError}
        disabled={disabled}
      />
      {missing.length > 0 && (
        <p className="text-center text-sm text-brand-gray-400">
          Missing: {missing.join(", ")}
        </p>
      )}
    </div>
  )
}

// ─── Step 2: Fuel level ───────────────────────────────────────────────────────

function FuelStep({
  fuelLevel,
  onFuelChange,
  disabled,
}: {
  fuelLevel: FuelLevel | null
  onFuelChange: (l: FuelLevel) => void
  disabled?: boolean
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <h2 className="heading-5 text-brand-gray-900">Fuel Level</h2>
      <p className="text-sm text-brand-gray-500">
        Select the fuel level when the vehicle was returned.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {(Object.entries(FUEL_LEVEL_LABELS) as [FuelLevel, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onFuelChange(value)}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-medium transition",
              fuelLevel === value
                ? "border-brand-red-200 bg-brand-red-200 text-white"
                : "border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-red-200",
              disabled ? "cursor-not-allowed opacity-60" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3: Extra charge ─────────────────────────────────────────────────────

interface ChargeStepProps {
  extraChargeRaw: string
  chargeError: string | null
  depositAmount: number
  currencyCode: string
  onChargeChange: (raw: string) => void
  disabled?: boolean
}

function ChargeStep({
  extraChargeRaw,
  chargeError,
  depositAmount,
  currencyCode,
  onChargeChange,
  disabled,
}: ChargeStepProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <h2 className="heading-5 text-brand-gray-900">Extra Charge</h2>
      <p className="text-sm text-brand-gray-500">
        Enter any extra charge (damage, fuel top-up, etc.). Enter{" "}
        <span className="font-semibold">0</span> if there is none.
      </p>

      {/* Deposit cap callout */}
      <div className="flex items-center gap-2 rounded-lg bg-brand-gray-50 px-4 py-3 text-sm">
        <span className="text-brand-gray-500">Max deposit available:</span>
        <span className="font-semibold text-brand-gray-900">
          {formatCurrency(depositAmount, currencyCode)}
        </span>
      </div>

      {/* Input */}
      <div className="space-y-1">
        <label className="body-3 text-sm font-semibold text-brand-gray-700">
          Extra charge ({currencyCode}) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          max={depositAmount}
          step="0.01"
          value={extraChargeRaw}
          disabled={disabled}
          onChange={(e) => onChargeChange(e.target.value)}
          className={[
            "w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition",
            chargeError
              ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300"
              : "border-brand-gray-200 bg-white focus:border-brand-red-200 focus:ring-2 focus:ring-brand-red-200/30",
            disabled ? "cursor-not-allowed opacity-60" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {chargeError && (
          <p className="text-xs text-red-500">{chargeError}</p>
        )}
      </div>
    </div>
  )
}

// ─── Step 4: Confirm + deposit preview ───────────────────────────────────────

interface ConfirmStepProps {
  detail: HandoverBookingDetail
  photoRecord: PhotoRecord
  fuelLevel: FuelLevel
  extraCharge: number
  depositAmount: number
  submitError: string | null
  submitting: boolean
  onSubmit: () => void
}

function ConfirmStep({
  detail,
  photoRecord,
  fuelLevel,
  extraCharge,
  depositAmount,
  submitError,
  submitting,
  onSubmit,
}: ConfirmStepProps): React.JSX.Element {
  const settlement = previewDepositSettlement(depositAmount, extraCharge)

  const statusLabel: Partial<Record<DepositStatus, string>> = {
    released: "Full refund",
    partial: "Partial refund",
    forfeited: "Fully forfeited",
  }
  const statusColor: Partial<Record<DepositStatus, string>> = {
    released: "text-green-600",
    partial: "text-amber-600",
    forfeited: "text-red-600",
  }

  return (
    <div className="space-y-4">
      <h2 className="heading-5 text-brand-gray-900">Confirm Return</h2>

      {/* Booking summary */}
      <InfoCard>
        <InfoRow label="Ref." value={detail.reference} />
        <InfoRow
          label="Customer"
          value={`${detail.customer.firstName} ${detail.customer.lastName}`}
        />
        <InfoRow
          label="Car"
          value={`${detail.car.make} ${detail.car.model} — ${detail.car.licensePlate}`}
        />
      </InfoCard>

      {/* Condition summary */}
      <InfoCard>
        <InfoRow label="Fuel Level" value={FUEL_LEVEL_LABELS[fuelLevel]} />
        <InfoRow
          label="Extra Charge"
          value={formatCurrency(extraCharge, detail.currencyCode)}
          highlight={extraCharge > 0}
        />
        <div className="mt-2">
          <p className="body-3 mb-2 text-xs text-brand-gray-500">
            Return photos (4 angles)
          </p>
          <div className="grid grid-cols-4 gap-1">
            {PHOTO_ANGLES.map((angle) => {
              const slot = photoRecord[angle]
              const src = slot.previewUrl ?? slot.uploaded?.url
              return (
                <div
                  key={angle}
                  className="relative h-16 overflow-hidden rounded-lg bg-brand-gray-100"
                >
                  {src && (
                    <img src={src} alt={angle} className="h-full w-full object-cover" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </InfoCard>

      {/* Deposit settlement preview */}
      <div className="rounded-xl border border-brand-gray-100 bg-white p-4 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-brand-gray-700">Deposit Settlement (Preview)</p>
        <div className="space-y-1">
          <DepositRow
            label="Original deposit"
            value={formatCurrency(depositAmount, detail.currencyCode)}
          />
          <DepositRow
            label="Extra charge deducted"
            value={`− ${formatCurrency(extraCharge, detail.currencyCode)}`}
            muted={extraCharge === 0}
          />
          <div className="my-1 border-t border-brand-gray-100" />
          <DepositRow
            label="Refund to customer"
            value={formatCurrency(settlement.refundAmount, detail.currencyCode)}
            bold
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-brand-gray-500">Status</span>
            <span className={`text-sm font-semibold ${statusColor[settlement.depositStatus]}`}>
              {statusLabel[settlement.depositStatus]}
            </span>
          </div>
        </div>
        <p className="text-xs text-brand-gray-400">
          * Preview only — final settlement is processed by the server.
        </p>
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "Processing…" : "Confirm Return"}
      </Button>
    </div>
  )
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function InfoCard({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-brand-gray-100 bg-white p-4 shadow-sm">
      {children}
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}): React.JSX.Element {
  return (
    <div className="flex justify-between py-0.5 text-sm">
      <span className="text-brand-gray-500">{label}</span>
      <span className={["font-medium", highlight ? "text-brand-red-200" : "text-brand-gray-900"].join(" ")}>
        {value}
      </span>
    </div>
  )
}

function DepositRow({
  label,
  value,
  bold,
  muted,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
}): React.JSX.Element {
  return (
    <div className="flex justify-between text-sm">
      <span className={muted ? "text-brand-gray-300" : "text-brand-gray-500"}>{label}</span>
      <span
        className={[
          muted ? "text-brand-gray-300" : "text-brand-gray-900",
          bold ? "font-semibold" : "font-medium",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  )
}
