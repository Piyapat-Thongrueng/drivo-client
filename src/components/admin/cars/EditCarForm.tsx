"use client"

import { useEffect, useRef, useState } from "react"
import {
  CircleDollarSign,
  Gauge,
  Hash,
  ImageIcon,
  MapPin,
  Palette,
  Settings2,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/spinner"
import { editCarFormSchema, type EditCarFormValues } from "@/lib/validation/car-form"
import { uploadCarImage, validateCarImageFile } from "@/lib/supabase/upload-car-image"
import {
  CAR_TYPE_OPTIONS,
  FUEL_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
} from "@/lib/constants/car-options"
import type { Branch } from "@/types/branch"
import type { CarDetail, CarStatus, UpdateCarPayload } from "@/types/car"

function ChevronDownIcon() {
  return (
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
}

interface EditCarFormProps {
  car: CarDetail
  branches: Branch[]
  fetchCarDetail: () => Promise<CarDetail>
  onMaintenanceBlocked: () => void
  onSubmit: (data: UpdateCarPayload) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError: string | null
}

type FormErrors = Partial<Record<keyof EditCarFormValues | "image" | "root", string>>

function branchLabel(branches: Branch[], branchId: number): string {
  return branches.find((b) => b.id === branchId)?.name ?? `Branch #${branchId}`
}

export function EditCarForm({
  car,
  branches,
  fetchCarDetail,
  onMaintenanceBlocked,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: EditCarFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [make, setMake] = useState(car.make)
  const [model, setModel] = useState(car.model)
  const [carType, setCarType] = useState<EditCarFormValues["carType"]>(car.carType)
  const [transmission, setTransmission] =
    useState<EditCarFormValues["transmission"]>(car.transmission)
  const [fuelType, setFuelType] = useState<EditCarFormValues["fuelType"]>(car.fuelType)
  const [color, setColor] = useState(car.color)
  const [year, setYear] = useState(String(car.year))
  const [licensePlate, setLicensePlate] = useState(car.licensePlate)
  const [seats, setSeats] = useState(String(car.seats))
  const [luggageCapacity, setLuggageCapacity] = useState(String(car.luggageCapacity))
  const [doors, setDoors] = useState(String(car.doors))
  const [hourlyRate, setHourlyRate] = useState(String(car.hourlyRate))
  const [dailyRate, setDailyRate] = useState(String(car.dailyRate))
  const [description, setDescription] = useState(car.description ?? "")
  const [status, setStatus] = useState<CarStatus>(car.status)
  const [imageUrl, setImageUrl] = useState<string | null>(car.imageUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(car.imageUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [statusCheckLoading, setStatusCheckLoading] = useState(false)

  useEffect(() => {
    setMake(car.make)
    setModel(car.model)
    setCarType(car.carType)
    setTransmission(car.transmission)
    setFuelType(car.fuelType)
    setColor(car.color)
    setYear(String(car.year))
    setLicensePlate(car.licensePlate)
    setSeats(String(car.seats))
    setLuggageCapacity(String(car.luggageCapacity))
    setDoors(String(car.doors))
    setHourlyRate(String(car.hourlyRate))
    setDailyRate(String(car.dailyRate))
    setDescription(car.description ?? "")
    setStatus(car.status)
    setImageUrl(car.imageUrl)
    setPreviewUrl(car.imageUrl)
  }, [
    car.id,
    car.updatedAt,
    car.make,
    car.model,
    car.carType,
    car.transmission,
    car.fuelType,
    car.color,
    car.year,
    car.licensePlate,
    car.seats,
    car.luggageCapacity,
    car.doors,
    car.hourlyRate,
    car.dailyRate,
    car.description,
    car.status,
    car.imageUrl,
  ])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const v = validateCarImageFile(file)
    if (v) {
      setUploadError(v)
      return
    }
    setUploadError(null)
    setIsUploading(true)
    try {
      const url = await uploadCarImage(file)
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
      setImageUrl(url)
      setPreviewUrl(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  function handleColorChange(value: string) {
    if (!value) {
      setColor("")
      return
    }
    setColor(value.charAt(0).toUpperCase() + value.slice(1))
  }

  async function handleStatusChange(next: CarStatus) {
    if (next === "maintenance") {
      setStatusCheckLoading(true)
      try {
        const detail = await fetchCarDetail()
        if (detail.hasActiveBooking) {
          onMaintenanceBlocked()
          return
        }
        setStatus("maintenance")
      } finally {
        setStatusCheckLoading(false)
      }
      return
    }
    setStatus("available")
  }

  function buildPayload(): EditCarFormValues | null {
    const y = parseInt(year, 10)
    const s = parseInt(seats, 10)
    const l = parseInt(luggageCapacity, 10)
    const d = parseInt(doors, 10)
    const h = parseFloat(hourlyRate)
    const day = parseFloat(dailyRate)

    return {
      make: make.trim(),
      model: model.trim(),
      year: y,
      color: color.trim(),
      licensePlate: licensePlate.trim(),
      imageUrl: imageUrl ?? null,
      carType,
      seats: s,
      luggageCapacity: l,
      doors: d,
      transmission,
      fuelType,
      hourlyRate: h,
      dailyRate: day,
      description: description.trim() || null,
      status,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const payload = buildPayload()
    if (!payload) {
      setErrors({ root: "Invalid form data" })
      return
    }

    const parsed = editCarFormSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof EditCarFormValues | undefined
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    await onSubmit(parsed.data as UpdateCarPayload)
  }

  const inputCls = (hasError: boolean) =>
    `w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent ${
      hasError ? "border-red-400" : "border-brand-gray-200"
    }`

  const selectCls = (hasError: boolean) =>
    `w-full appearance-none rounded-lg border bg-white py-2.5 pl-10 pr-10 body-3 text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent ${
      hasError ? "border-red-400" : "border-brand-gray-200"
    }`

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="rounded-2xl border border-brand-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="headline-3 text-brand-gray-900">Vehicle details</h2>
          <p className="body-3 mt-1 text-brand-gray-500">
            Update vehicle information. Home branch cannot be changed from this page.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex h-36 w-full max-w-xs flex-col items-center justify-center rounded-xl border border-dashed border-brand-gray-200 bg-brand-gray-50">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Car preview"
                className="h-full max-h-36 w-full rounded-xl object-cover"
              />
            ) : (
              <ImageIcon className="h-10 w-10 text-brand-gray-300" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={isUploading || isSubmitting}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Uploading…
                </span>
              ) : (
                "Change image"
              )}
            </Button>
            {uploadError && <p className="body-3 text-red-500">{uploadError}</p>}
            {errors.image && <p className="body-3 text-red-500">{errors.image}</p>}
            <p className="body-3 text-brand-gray-400">JPG, PNG, or WEBP, max 5MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">Home branch</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <div className="rounded-lg border border-brand-gray-200 bg-brand-gray-50 py-2.5 pl-10 pr-4 body-3 text-brand-gray-800">
                {branchLabel(branches, car.branchId)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">Status</label>
            <div className="relative max-w-xs">
              <Gauge className="absolute left-3 top-1/2 z-1 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={status}
                disabled={statusCheckLoading}
                onChange={(e) => void handleStatusChange(e.target.value as CarStatus)}
                className={selectCls(false)}
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <ChevronDownIcon />
            </div>
            {statusCheckLoading && (
              <p className="body-3 text-brand-gray-400">Checking bookings…</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Make</label>
            <div className="relative">
              <Settings2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className={inputCls(!!errors.make)}
                placeholder="Toyota"
              />
            </div>
            {errors.make && <p className="body-3 text-red-500">{errors.make}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Model</label>
            <div className="relative">
              <Settings2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={inputCls(!!errors.model)}
                placeholder="Camry"
              />
            </div>
            {errors.model && <p className="body-3 text-red-500">{errors.model}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Car type</label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value as EditCarFormValues["carType"])}
                className={selectCls(false)}
              >
                {CAR_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Transmission</label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={transmission}
                onChange={(e) =>
                  setTransmission(e.target.value as EditCarFormValues["transmission"])
                }
                className={selectCls(false)}
              >
                {TRANSMISSION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Fuel type</label>
            <div className="relative">
              <Gauge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as EditCarFormValues["fuelType"])}
                className={selectCls(false)}
              >
                {FUEL_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Color</label>
            <div className="relative">
              <Palette className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className={inputCls(!!errors.color)}
                placeholder="Silver"
              />
            </div>
            {errors.color && <p className="body-3 text-red-500">{errors.color}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Year</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputCls(!!errors.year)}
                min={1990}
                max={new Date().getFullYear()}
              />
            </div>
            {errors.year && <p className="body-3 text-red-500">{errors.year}</p>}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">License plate</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                maxLength={20}
                className={inputCls(!!errors.licensePlate)}
                placeholder="Any language, max 20 characters"
              />
            </div>
            {errors.licensePlate && (
              <p className="body-3 text-red-500">{errors.licensePlate}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Seats</label>
            <input
              type="number"
              inputMode="numeric"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              min={1}
              max={20}
              className={`rounded-lg border bg-white px-3 py-2.5 body-3 ${errors.seats ? "border-red-400" : "border-brand-gray-200"}`}
            />
            {errors.seats && <p className="body-3 text-red-500">{errors.seats}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Luggage capacity</label>
            <input
              type="number"
              inputMode="numeric"
              value={luggageCapacity}
              onChange={(e) => setLuggageCapacity(e.target.value)}
              min={0}
              max={20}
              className={`rounded-lg border bg-white px-3 py-2.5 body-3 ${errors.luggageCapacity ? "border-red-400" : "border-brand-gray-200"}`}
            />
            {errors.luggageCapacity && (
              <p className="body-3 text-red-500">{errors.luggageCapacity}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Doors</label>
            <input
              type="number"
              inputMode="numeric"
              value={doors}
              onChange={(e) => setDoors(e.target.value)}
              min={2}
              max={6}
              className={`rounded-lg border bg-white px-3 py-2.5 body-3 ${errors.doors ? "border-red-400" : "border-brand-gray-200"}`}
            />
            {errors.doors && <p className="body-3 text-red-500">{errors.doors}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Hourly rate</label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                inputMode="decimal"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={inputCls(!!errors.hourlyRate)}
                placeholder="0.00"
              />
            </div>
            {errors.hourlyRate && <p className="body-3 text-red-500">{errors.hourlyRate}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="body-3 font-semibold text-brand-gray-700">Daily rate</label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-300" />
              <input
                type="text"
                inputMode="decimal"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                className={inputCls(!!errors.dailyRate)}
                placeholder="0.00"
              />
            </div>
            {errors.dailyRate && <p className="body-3 text-red-500">{errors.dailyRate}</p>}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="body-3 font-semibold text-brand-gray-700">
              Description <span className="font-normal text-brand-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className={`w-full resize-none rounded-lg border bg-white px-3 py-2.5 body-3 text-brand-gray-900 placeholder:text-brand-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red-200 focus:border-transparent ${
                errors.description ? "border-red-400" : "border-brand-gray-200"
              }`}
              placeholder="Optional notes for this vehicle"
            />
            {errors.description && (
              <p className="body-3 text-red-500">{errors.description}</p>
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
          <Button type="submit" variant="primary" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Saving…
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
