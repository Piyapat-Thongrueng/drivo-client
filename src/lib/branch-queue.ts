import { formatDatetimeInTz, DEFAULT_TIMEZONE } from "@/lib/datetime"
import type { QueueBookingItem } from "@/types/handover"

// ─── Date formatting ──────────────────────────────────────────────────────────

/**
 * แปลง ISO datetime → รูปแบบ "21 May 2026, 10:00 AM" ใน timezone ของสาขา
 */
export function formatQueueDatetime(iso: string, tz: string = DEFAULT_TIMEZONE): string {
  return formatDatetimeInTz(iso, tz)
}

// ─── One-way detection ────────────────────────────────────────────────────────

/**
 * ตรวจว่าเป็น one-way rental หรือไม่
 * (pickup branch ≠ dropoff branch)
 */
export function isOneWay(item: QueueBookingItem): boolean {
  return item.pickupBranchName !== item.dropoffBranchName
}

// ─── Client-side search filter ────────────────────────────────────────────────

/**
 * กรอง queue items ด้วย keyword (ค้นใน reference, ชื่อลูกค้า, ทะเบียน, รุ่นรถ)
 * ใช้เป็น fallback เมื่อ API ไม่รองรับ search หรือ debounce ยังไม่ complete
 */
export function filterQueue(items: QueueBookingItem[], keyword: string): QueueBookingItem[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return items

  return items.filter((item) => {
    return (
      item.reference.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.licensePlate.toLowerCase().includes(q) ||
      item.carLabel.toLowerCase().includes(q)
    )
  })
}

// ─── Duration label ───────────────────────────────────────────────────────────

/**
 * คำนวณจำนวนวันเช่าจาก pickup → dropoff datetime
 * คืน string เช่น "3 days" หรือ "1 day"
 */
export function rentalDurationLabel(pickupIso: string, dropoffIso: string): string {
  const diff = new Date(dropoffIso).getTime() - new Date(pickupIso).getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days === 1 ? "1 day" : `${days} days`
}
