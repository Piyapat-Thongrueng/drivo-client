"use client"

import { Calendar, Clock } from "lucide-react"

import CalendarDateInput from "@/components/customer/search/CalendarDateInput"

// ─── Helper: แปลงตัวเลข 0-23 → AM/PM 12-hour ───────────────────────────────────

function to12Hour(hour24: number): { hour12: number; ampm: "AM" | "PM" } {
  const ampm: "AM" | "PM" = hour24 < 12 ? "AM" : "PM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return { hour12, ampm }
}

// ─── สร้าง options สำหรับ time slots ทุก 30 นาที ────────────────────────────────

interface TimeSlot {
  value: string  // "HH:MM" 24-hour format เก็บใน state
  label: string  // "12:00 AM" แสดงใน dropdown
}

function buildTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const { hour12, ampm } = to12Hour(h)
      const minuteStr = m === 0 ? "00" : "30"
      slots.push({
        value: `${String(h).padStart(2, "0")}:${minuteStr}`,
        label: `${hour12}:${minuteStr} ${ampm}`,
      })
    }
  }
  return slots
}

const TIME_SLOTS: TimeSlot[] = buildTimeSlots()

// ─── Props ──────────────────────────────────────────────────────────────────────

interface TimeSlotSelectProps {
  labelId: string
  caption: string
  dateInputId: string
  timeInputId: string

  /** yyyy-mm-dd */
  dateValue: string

  /** HH:MM (24-hour, เฉพาะ :00 หรือ :30) */
  timeValue: string

  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void

  /** วันที่น้อยที่สุดที่เลือกได้ (yyyy-mm-dd) */
  minDate?: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function TimeSlotSelect({
  labelId,
  caption,
  dateInputId,
  timeInputId,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  minDate,
}: TimeSlotSelectProps): React.JSX.Element {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span id={labelId}>
        <span className="block body-3 font-bold uppercase tracking-wide text-brand-gray-900">
          {caption}
        </span>
      </span>

      <div
        role="group"
        aria-labelledby={labelId}
        className="flex min-h-11 divide-x divide-brand-gray-300 overflow-visible rounded-lg border border-brand-gray-300 bg-brand-white transition-colors focus-within:border-brand-gray-700 focus-within:ring-1 focus-within:ring-brand-gray-700"
      >
        {/* วันที่ */}
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
          <Calendar
            className="pointer-events-none h-5 w-5 shrink-0 text-brand-gray-500"
            aria-hidden
          />
          <CalendarDateInput
            id={dateInputId}
            caption={caption}
            dateValue={dateValue}
            minDate={minDate}
            onDateChange={onDateChange}
          />
        </div>

        {/* เวลา — ทุก 30 นาที แสดงแบบ AM/PM */}
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
          <Clock
            className="pointer-events-none h-5 w-5 shrink-0 text-brand-gray-500"
            aria-hidden
          />
          <select
            id={timeInputId}
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            aria-label={`${caption} — time`}
            className="body-2 min-w-0 flex-1 bg-transparent text-brand-gray-900 focus:outline-none cursor-pointer"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
