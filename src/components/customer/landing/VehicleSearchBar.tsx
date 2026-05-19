"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/Button"
import BranchLocationCombobox from "@/components/customer/search/BranchLocationCombobox"
import TimeSlotSelect from "@/components/customer/search/TimeSlotSelect"
import { useSearchStore } from "@/stores/searchStore"
import { serializeSearchParams } from "@/lib/search-params"
import { fetchBranches } from "@/lib/api/branches"
import {
  combineDatetimeInTz,
  splitDatetimeInTz,
  todayInTz,
  isDropoffAfterPickup,
  formatTimezoneLabel,
} from "@/lib/datetime"
import type { Branch } from "@/types/branch"

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

  // ใช้ timezone ของสาขารับรถ — ทุก helper วัน-เวลาต้องผ่าน timezone นี้
  const tz = store.pickupTimezone

  // แยก ISO → date + time ใน timezone สาขา (ไม่ใช่ timezone เครื่อง user)
  const pickupParts = useMemo(() => splitDatetimeInTz(store.pickupDatetime, tz), [store.pickupDatetime, tz])
  const dropoffParts = useMemo(() => splitDatetimeInTz(store.dropoffDatetime, tz), [store.dropoffDatetime, tz])

  // วันที่ "วันนี้" ใน timezone สาขา เพื่อป้องกันเลือกวันในอดีต
  const todayStr = useMemo(() => todayInTz(tz), [tz])

  // ─── โหลดสาขาทั้งหมดเพื่อตรวจ single-branch country ─────────────────────────

  const [allBranches, setAllBranches] = useState<Branch[]>([])

  useEffect(() => {
    fetchBranches().then(setAllBranches).catch(() => {/* ไม่ error หน้า */})
  }, [])

  // นับ active branch ในประเทศ pickup (ยกเว้น pickup เอง)
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

  function handlePickupChange(
    branchId: number,
    branchName: string,
    countryId: number,
    timezone: string,
  ): void {
    // setPickup รับ timezone ด้วย — store จะอัปเดต pickupTimezone
    store.setPickup(branchId, branchName, countryId, timezone)
    setErrors((prev) => ({ ...prev, pickup: "" }))
  }

  function handleDropoffChange(branchId: number, branchName: string): void {
    store.setDropoff(branchId, branchName)
    setErrors((prev) => ({ ...prev, dropoff: "" }))
  }

  function handleDropoffClear(): void {
    store.setDropoff(0, "")
  }

  function handleToggleChange(next: boolean): void {
    if (next && isSingleBranchCountry) return
    store.setDifferentDropoff(next)
    if (!next) setErrors((prev) => ({ ...prev, dropoff: "" }))
  }

  function handlePickupDateChange(date: string): void {
    // รวม date + time เป็น ISO โดยอ้าง timezone สาขา (ไม่ใช่ browser)
    store.setPickupDatetime(combineDatetimeInTz(date, pickupParts.time, tz))
    // ถ้า dropoff date < pickup date ให้ขยับ dropoff ตาม
    if (date > dropoffParts.date) {
      store.setDropoffDatetime(combineDatetimeInTz(date, dropoffParts.time, tz))
    }
    setErrors((prev) => ({ ...prev, datetime: "" }))
  }

  function handlePickupTimeChange(time: string): void {
    const newPickup = combineDatetimeInTz(pickupParts.date, time, tz)
    store.setPickupDatetime(newPickup)
    // ถ้า pickup ≥ dropoff ขยับ dropoff +2 ชั่วโมง
    if (!isDropoffAfterPickup(newPickup, store.dropoffDatetime)) {
      const newDropoffMs = new Date(newPickup).getTime() + 2 * 60 * 60 * 1000
      // แปลง timestamp → ISO ใน timezone สาขา แล้ว snap ไป slot 30 นาที
      const snapped = splitDatetimeInTz(new Date(newDropoffMs).toISOString(), tz)
      store.setDropoffDatetime(combineDatetimeInTz(snapped.date, snapped.time, tz))
    }
    setErrors((prev) => ({ ...prev, datetime: "" }))
  }

  function handleDropoffDateChange(date: string): void {
    store.setDropoffDatetime(combineDatetimeInTz(date, dropoffParts.time, tz))
    setErrors((prev) => ({ ...prev, datetime: "" }))
  }

  function handleDropoffTimeChange(time: string): void {
    store.setDropoffDatetime(combineDatetimeInTz(dropoffParts.date, time, tz))
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
        newErrors.dropoff = isSingleBranchCountry
          ? 'No other branches available in this country. Please disable "Return to different location".'
          : "Please select a drop-off location."
      }
    }

    // ตรวจ dropoff > pickup ด้วย dayjs (timezone-aware)
    if (!isDropoffAfterPickup(store.pickupDatetime, store.dropoffDatetime)) {
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
      dropoffBranchId: store.differentDropoff ? store.dropoffBranchId : store.pickupBranchId,
      dropoffBranchName: store.differentDropoff ? store.dropoffBranchName : store.pickupBranchName,
    })
    router.push(`/cars?${qs}`)
  }

  // ─── ปิด toggle อัตโนมัติเมื่อประเทศมีสาขาเดียว ──────────────────────────────

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
            placeholder={store.pickupBranchId ? "Select drop-off location" : "Select pick-up first"}
            selectedBranchId={store.dropoffBranchId}
            displayValue={store.dropoffBranchName}
            onChange={(branchId, branchName) => handleDropoffChange(branchId, branchName)}
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

      <div className="mt-6 flex flex-col gap-4 border-t border-brand-gray-100 pt-6 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex shrink-0 flex-col gap-1">
          <Toggle
            checked={store.differentDropoff}
            disabled={isSingleBranchCountry}
            onCheckedChange={handleToggleChange}
            label="Return to different location"
          />
          {isSingleBranchCountry && (
            <p className="body-3 ml-14 text-brand-gray-500">
              Only one service point in this country — return at the same branch.
            </p>
          )}
        </div>

        {/* อธิบาย timezone — ใช้พื้นที่ว่างระหว่าง toggle กับปุ่ม */}
        <p className="body-3 flex-1 text-brand-gray-700 lg:text-center">
          All pick-up and drop-off times use the{" "}
          <span className="font-bold text-brand-red-200">local time at your pick-up branch</span>
          , not your device&apos;s time zone.
          {store.pickupBranchId && (
            <>
              {" "}
              <span className="text-brand-gray-400">·</span> Currently:{" "}
              <span className="font-bold text-brand-red-200">
                {formatTimezoneLabel(store.pickupTimezone)}
              </span>
            </>
          )}
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full shrink-0 font-bold lg:w-auto lg:min-w-44"
        >
          Show Vehicles
        </Button>
      </div>
    </form>
  )
}
