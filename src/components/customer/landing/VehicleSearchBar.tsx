"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/Button"
import BranchLocationCombobox from "@/components/customer/search/BranchLocationCombobox"
import TimeSlotSelect from "@/components/customer/search/TimeSlotSelect"
import { useSearchStore } from "@/stores/searchStore"
import { serializeSearchParams } from "@/lib/search-params"
import { fetchBranches } from "@/lib/api/branches"
import type { Branch } from "@/types/branch"

// ─── Helper: yyyy-mm-dd จาก Date ────────────────────────────────────────────────

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ─── Helper: แยก datetime ISO → { date: "yyyy-mm-dd", time: "HH:MM" } ───────────

function splitDatetime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = toDateString(d)
  const hh = String(d.getHours()).padStart(2, "0")
  // ปัดนาทีเป็น 00 หรือ 30
  const mm = d.getMinutes() < 30 ? "00" : "30"
  return { date, time: `${hh}:${mm}` }
}

// ─── Helper: รวม date + time → ISO string ───────────────────────────────────────

function combineDatetime(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

// ─── Toggle ──────────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean
  disabled?: boolean
  onCheckedChange: (next: boolean) => void
  label: string
}

function Toggle({ checked, disabled = false, onCheckedChange, label }: ToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`group flex items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand-red-200
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200
          ${checked ? "bg-brand-red-200" : "bg-brand-gray-300"}
          ${disabled ? "opacity-60" : ""}
        `}
      >
        <span
          aria-hidden
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="body-3 text-brand-gray-700">{label}</span>
    </button>
  )
}

// ─── VehicleSearchBar ────────────────────────────────────────────────────────────

export default function VehicleSearchBar(): React.JSX.Element {
  const router = useRouter()
  const store = useSearchStore()

  // แยก datetime → date + time สำหรับ input
  const pickupParts = useMemo(() => splitDatetime(store.pickupDatetime), [store.pickupDatetime])
  const dropoffParts = useMemo(() => splitDatetime(store.dropoffDatetime), [store.dropoffDatetime])

  // วันที่น้อยที่สุดที่เลือกได้ = วันนี้
  const todayStr = useMemo(() => toDateString(new Date()), [])

  // ─── สาขาทั้งหมด: โหลดมาเพื่อตรวจ single-branch country ─────────────────────

  const [allBranches, setAllBranches] = useState<Branch[]>([])

  useEffect(() => {
    fetchBranches().then(setAllBranches).catch(() => {/* ไม่ error หน้า */})
  }, [])

  // นับจำนวน active branch ในประเทศของ pickup (ยกเว้นตัวเอง)
  const availableDropoffBranches = useMemo(
    () =>
      store.pickupCountryId != null
        ? allBranches.filter(
            (b) =>
              b.countryId === store.pickupCountryId &&
              b.isActive &&
              b.id !== store.pickupBranchId,
          )
        : [],
    [allBranches, store.pickupCountryId, store.pickupBranchId],
  )

  const isSingleBranchCountry =
    store.pickupBranchId != null && availableDropoffBranches.length === 0

  // ─── Errors ──────────────────────────────────────────────────────────────────

  const [errors, setErrors] = useState<Record<string, string>>({})

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function handlePickupChange(branchId: number, branchName: string, countryId: number): void {
    store.setPickup(branchId, branchName, countryId)
    // ล้าง error ของ pickup
    setErrors((prev) => ({ ...prev, pickup: "" }))
  }

  function handleDropoffChange(branchId: number, branchName: string, countryId: number): void {
    store.setDropoff(branchId, branchName)
    setErrors((prev) => ({ ...prev, dropoff: "" }))
    // ป้องกันการเลือก branchId = 0 ซึ่งเกิดจากการ clear
    if (branchId && countryId) {
      setErrors((prev) => ({ ...prev, dropoff: "" }))
    }
  }

  function handleDropoffClear(): void {
    store.setDropoff(0, "")
  }

  function handleToggleChange(next: boolean): void {
    // ถ้าประเทศมีสาขาเดียว ไม่อนุญาตให้เปิด toggle
    if (next && isSingleBranchCountry) return
    store.setDifferentDropoff(next)
    // ล้าง error drop-off เมื่อปิด toggle
    if (!next) setErrors((prev) => ({ ...prev, dropoff: "" }))
  }

  function handlePickupDateChange(date: string): void {
    store.setPickupDatetime(combineDatetime(date, pickupParts.time))
    // ถ้า dropoff date < pickup date ให้ขยับ dropoff ไปด้วย
    if (date > dropoffParts.date) {
      store.setDropoffDatetime(combineDatetime(date, dropoffParts.time))
    }
    setErrors((prev) => ({ ...prev, datetime: "" }))
  }

  function handlePickupTimeChange(time: string): void {
    const newPickup = combineDatetime(pickupParts.date, time)
    store.setPickupDatetime(newPickup)
    // ถ้า pickup ≥ dropoff ให้ขยับ dropoff ไปด้วย
    const newDropoff = combineDatetime(dropoffParts.date, dropoffParts.time)
    if (newPickup >= newDropoff) {
      const adjusted = new Date(new Date(newPickup).getTime() + 2 * 60 * 60 * 1000)
      store.setDropoffDatetime(adjusted.toISOString())
    }
    setErrors((prev) => ({ ...prev, datetime: "" }))
  }

  function handleDropoffDateChange(date: string): void {
    store.setDropoffDatetime(combineDatetime(date, dropoffParts.time))
    setErrors((prev) => ({ ...prev, datetime: "" }))
  }

  function handleDropoffTimeChange(time: string): void {
    store.setDropoffDatetime(combineDatetime(dropoffParts.date, time))
    setErrors((prev) => ({ ...prev, datetime: "" }))
  }

  // ─── Validation + Submit ─────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!store.pickupBranchId) {
      newErrors.pickup = "Please select a pick-up location."
    }

    // Approach C: safety net — ถ้า toggle เปิดแต่ไม่มี drop-off ที่ถูกต้อง
    if (store.differentDropoff) {
      if (!store.dropoffBranchId) {
        if (isSingleBranchCountry) {
          newErrors.dropoff =
            'No other branches available in this country. Please disable "Return to different location".'
        } else {
          newErrors.dropoff = "Please select a drop-off location."
        }
      }
    }

    // ตรวจ drop-off ≥ pickup
    const pickup = new Date(store.pickupDatetime)
    const dropoff = new Date(store.dropoffDatetime)
    if (dropoff <= pickup) {
      newErrors.datetime = "Drop-off date & time must be after pick-up."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!validate()) return

    // ถ้า toggle ปิด → dropoffBranchId = pickupBranchId
    if (!store.differentDropoff && store.pickupBranchId) {
      store.setDropoff(store.pickupBranchId, store.pickupBranchName)
    }

    const qs = serializeSearchParams({
      ...store,
      dropoffBranchId: store.differentDropoff
        ? store.dropoffBranchId
        : store.pickupBranchId,
      dropoffBranchName: store.differentDropoff
        ? store.dropoffBranchName
        : store.pickupBranchName,
    })
    router.push(`/cars?${qs}`)
  }

  // ─── แจ้ง user เมื่อเปลี่ยน pickup มาประเทศที่มีสาขาเดียว ──────────────────────

  useEffect(() => {
    if (isSingleBranchCountry && store.differentDropoff) {
      store.setDifferentDropoff(false)
    }
  }, [isSingleBranchCountry, store.differentDropoff])

  // ─── Render ──────────────────────────────────────────────────────────────────

  const gridCols = store.differentDropoff ? "lg:grid-cols-4" : "lg:grid-cols-3"

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-brand-gray-100 bg-brand-white p-4 shadow-sm sm:p-6 lg:p-8 lg:px-20"
    >
      <div className={`grid grid-cols-1 gap-4 sm:gap-5 ${gridCols}`}>
        {/* Pick-up location */}
        <BranchLocationCombobox
          id="pickup-location"
          label="Pick-up location"
          placeholder="Select pick-up location"
          selectedBranchId={store.pickupBranchId}
          displayValue={store.pickupBranchName}
          onChange={handlePickupChange}
          errorMessage={errors.pickup}
        />

        {/* Drop-off location (แสดงเมื่อ toggle เปิด) */}
        {store.differentDropoff && (
          <BranchLocationCombobox
            id="dropoff-location"
            label="Drop-off location"
            placeholder={
              store.pickupBranchId
                ? "Select drop-off location"
                : "Select pick-up first"
            }
            selectedBranchId={store.dropoffBranchId}
            displayValue={store.dropoffBranchName}
            onChange={handleDropoffChange}
            onClear={handleDropoffClear}
            filterCountryId={store.pickupCountryId}
            excludeBranchId={store.pickupBranchId}
            disabled={!store.pickupBranchId}
            errorMessage={errors.dropoff}
          />
        )}

        {/* Pick-up วันเวลา */}
        <TimeSlotSelect
          labelId="pickup-datetime-label"
          caption="Pick-up date & time"
          dateInputId="pickup-date"
          timeInputId="pickup-time"
          dateValue={pickupParts.date}
          timeValue={pickupParts.time}
          onDateChange={handlePickupDateChange}
          onTimeChange={handlePickupTimeChange}
          minDate={todayStr}
        />

        {/* Drop-off วันเวลา */}
        <TimeSlotSelect
          labelId="dropoff-datetime-label"
          caption="Drop-off date & time"
          dateInputId="dropoff-date"
          timeInputId="dropoff-time"
          dateValue={dropoffParts.date}
          timeValue={dropoffParts.time}
          onDateChange={handleDropoffDateChange}
          onTimeChange={handleDropoffTimeChange}
          minDate={pickupParts.date}
        />
      </div>

      {/* Error วันเวลา */}
      {errors.datetime && (
        <p className="body-3 mt-3 text-red-600" role="alert">
          {errors.datetime}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-brand-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Toggle
            checked={store.differentDropoff}
            disabled={isSingleBranchCountry}
            onCheckedChange={handleToggleChange}
            label="Return to different location"
          />
          {/* แจ้ง user ถ้าประเทศมีสาขาเดียว */}
          {isSingleBranchCountry && (
            <p className="body-3 ml-14 text-brand-gray-500">
              Only one service point in this country — return at the same branch.
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full font-bold sm:w-auto sm:min-w-44"
        >
          Show Vehicles
        </Button>
      </div>
    </form>
  )
}
