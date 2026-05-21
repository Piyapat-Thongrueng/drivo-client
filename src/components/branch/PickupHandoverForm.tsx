"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { FuelLevel, PhotoAngle } from "@/types/handover"
import { PHOTO_ANGLES, FUEL_LEVEL_LABELS } from "@/types/handover"
import type { HandoverBookingDetail } from "@/lib/api/branch-handover"
import { submitPickup } from "@/lib/api/branch-handover"
import {
  initPhotoRecord,
  createSlotFromFile,
  markSlotUploaded,
  markSlotError,
  validatePickupForm,
  buildPickupPayload,
  missingAngles,
} from "@/lib/pickup-wizard"
import type { PhotoRecord } from "@/lib/pickup-wizard"
import { uploadHandoverPhoto } from "@/lib/supabase/upload-handover-photo"
import { PhotoUploadGrid } from "./PhotoUploadGrid"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/currency"

// ─── Step type ────────────────────────────────────────────────────────────────

type Step = "review" | "condition" | "confirm"

const STEP_ORDER: Step[] = ["review", "condition", "confirm"]
const STEP_LABELS: Record<Step, string> = {
  review: "Review Info",
  condition: "Vehicle Condition",
  confirm: "Confirm",
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  detail: HandoverBookingDetail
  token: string
}

export function PickupHandoverForm({ detail, token }: Props): React.JSX.Element {
  const router = useRouter()

  const [step, setStep] = useState<Step>("review")
  const [photoRecord, setPhotoRecord] = useState<PhotoRecord>(initPhotoRecord)
  const [fuelLevel, setFuelLevel] = useState<FuelLevel | null>(null)
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

  // ── Submit (called from Confirm step) ────────────────────────────────────────

  async function handleSubmit() {
    const validationError = validatePickupForm(photoRecord, fuelLevel)
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
              "pickup",
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

      // Build payload and call API
      const payload = buildPickupPayload(updatedRecord, fuelLevel!)
      await submitPickup(detail.bookingId, payload, token)

      router.push("/branch/pickup")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Navigation guards ────────────────────────────────────────────────────────

  function canAdvance(): boolean {
    if (step === "review") return true
    if (step === "condition") {
      return missingAngles(photoRecord).length === 0 && fuelLevel !== null
    }
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
      {/* Progress stepper */}
      <StepIndicator current={stepIndex} />

      {/* Step content */}
      {step === "review" && <ReviewStep detail={detail} />}
      {step === "condition" && (
        <ConditionStep
          photoRecord={photoRecord}
          fuelLevel={fuelLevel}
          onFileSelected={handleFileSelected}
          onSlotError={handleSlotError}
          onFuelChange={setFuelLevel}
          disabled={submitting}
        />
      )}
      {step === "confirm" && (
        <ConfirmStep
          detail={detail}
          photoRecord={photoRecord}
          fuelLevel={fuelLevel!}
          submitError={submitError}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      )}

      {/* Navigation buttons */}
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
    <ol className="flex items-center gap-2">
      {STEP_ORDER.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2">
          <div
            className={[
              "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors",
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
              "body-3 text-xs",
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

// ─── Step 1: Review booking info ──────────────────────────────────────────────

function ReviewStep({ detail }: { detail: HandoverBookingDetail }): React.JSX.Element {
  const customerName = `${detail.customer.firstName} ${detail.customer.lastName}`
  const carLabel = `${detail.car.make} ${detail.car.model} (${detail.car.year})`
  const depositNum = parseFloat(detail.depositAmount)
  const isOneWay = detail.pickupBranchId !== detail.dropoffBranchId

  return (
    <div className="space-y-4">
      <h2 className="heading-5 text-brand-gray-900">Review Booking Info</h2>

      <InfoCard>
        <InfoRow label="Ref." value={detail.reference} />
        <InfoRow label="Customer" value={customerName} />
        {detail.customer.phone && (
          <InfoRow label="Phone" value={detail.customer.phone} />
        )}
      </InfoCard>

      <InfoCard>
        <InfoRow label="Car" value={carLabel} />
        <InfoRow label="Plate" value={detail.car.licensePlate} />
      </InfoCard>

      <InfoCard>
        <InfoRow label="Pick-up" value={`${detail.pickupBranchName} — ${formatDatetime(detail.pickupDatetime)}`} />
        <InfoRow label="Drop-off" value={`${detail.dropoffBranchName} — ${formatDatetime(detail.dropoffDatetime)}`} />
        {isOneWay && (
          <div className="mt-1 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
            One-way rental — different drop-off branch
          </div>
        )}
      </InfoCard>

      {detail.addons.length > 0 && (
        <InfoCard>
          <p className="body-3 mb-2 text-xs font-semibold text-brand-gray-600">Add-ons</p>
          {detail.addons.map((a, i) => (
            <InfoRow
              key={i}
              label={a.name}
              value={formatCurrency(a.totalPrice, detail.currencyCode)}
            />
          ))}
        </InfoCard>
      )}

      <InfoCard>
        <InfoRow
          label="Deposit"
          value={formatCurrency(depositNum, detail.currencyCode)}
          highlight
        />
      </InfoCard>
    </div>
  )
}

// ─── Step 2: Vehicle condition (photos + fuel) ────────────────────────────────

interface ConditionStepProps {
  photoRecord: PhotoRecord
  fuelLevel: FuelLevel | null
  onFileSelected: (angle: PhotoAngle, file: File, previewUrl: string) => void
  onSlotError: (angle: PhotoAngle, error: string) => void
  onFuelChange: (level: FuelLevel) => void
  disabled?: boolean
}

function ConditionStep({
  photoRecord,
  fuelLevel,
  onFileSelected,
  onSlotError,
  onFuelChange,
  disabled,
}: ConditionStepProps): React.JSX.Element {
  const missing = missingAngles(photoRecord)

  return (
    <div className="space-y-5">
      <h2 className="heading-5 text-brand-gray-900">Vehicle Condition</h2>

      <PhotoUploadGrid
        record={photoRecord}
        onFileSelected={onFileSelected}
        onSlotError={onSlotError}
        disabled={disabled}
      />

      {missing.length > 0 && (
        <p className="text-center text-sm text-brand-gray-400">
          Missing photos: {missing.join(", ")}
        </p>
      )}

      {/* Fuel level */}
      <div className="space-y-2">
        <label className="body-3 text-sm font-semibold text-brand-gray-700">
          Fuel Level <span className="text-red-500">*</span>
        </label>
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
    </div>
  )
}

// ─── Step 3: Confirm + submit ─────────────────────────────────────────────────

interface ConfirmStepProps {
  detail: HandoverBookingDetail
  photoRecord: PhotoRecord
  fuelLevel: FuelLevel
  submitError: string | null
  submitting: boolean
  onSubmit: () => void
}

function ConfirmStep({
  detail,
  photoRecord,
  fuelLevel,
  submitError,
  submitting,
  onSubmit,
}: ConfirmStepProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <h2 className="heading-5 text-brand-gray-900">Confirm Vehicle Hand-off</h2>

      <InfoCard>
        <InfoRow label="Ref." value={detail.reference} />
        <InfoRow label="Customer" value={`${detail.customer.firstName} ${detail.customer.lastName}`} />
        <InfoRow label="Car" value={`${detail.car.make} ${detail.car.model} — ${detail.car.licensePlate}`} />
      </InfoCard>

      <InfoCard>
        <InfoRow label="Fuel Level" value={FUEL_LEVEL_LABELS[fuelLevel]} highlight />
        <div className="mt-2">
          <p className="body-3 mb-2 text-xs text-brand-gray-500">Vehicle photos (4 angles)</p>
          <div className="grid grid-cols-4 gap-1">
            {PHOTO_ANGLES.map((angle) => {
              const slot = photoRecord[angle]
              const src = slot.previewUrl ?? slot.uploaded?.url
              return (
                <div key={angle} className="relative h-16 rounded-lg overflow-hidden bg-brand-gray-100">
                  {src && (
                    <img src={src} alt={angle} className="h-full w-full object-cover" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </InfoCard>

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
        {submitting ? "Saving…" : "Confirm Hand-off"}
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
      <span
        className={[
          "font-medium",
          highlight ? "text-brand-red-200" : "text-brand-gray-900",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  )
}

function formatDatetime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}
