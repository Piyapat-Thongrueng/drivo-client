import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

// ─── Timezone default ────────────────────────────────────────────────────────────
// ใช้เป็น fallback เมื่อยังไม่ได้เลือกสาขา (project นี้ส่วนใหญ่อยู่ในไทย)
export const DEFAULT_TIMEZONE = "Asia/Bangkok"

// ─── Core helpers ────────────────────────────────────────────────────────────────

/**
 * รวม date string + time string เป็น ISO string พร้อม timezone offset
 *
 * วิธีนี้ถูกต้องสำหรับระบบที่ backend ต้องการ { offset: true }
 * เช่น "2026-05-17T12:00:00+07:00" (ไม่ใช่ UTC Z)
 *
 * @param dateStr "YYYY-MM-DD"
 * @param timeStr "HH:MM" (เช่น "12:00", "14:30")
 * @param tz IANA timezone ของสาขารับรถ เช่น "Asia/Bangkok"
 */
export function combineDatetimeInTz(
  dateStr: string,
  timeStr: string,
  tz: string = DEFAULT_TIMEZONE,
): string {
  // dayjs.tz ตีความ string นี้ว่าเป็น "เวลาในประเทศนั้น" แล้วแปลงให้มี offset
  return dayjs.tz(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm", tz).format()
}

/**
 * แยก ISO string → { date, time } ใน timezone ของสาขา
 *
 * แก้ bug เดิม: ไม่ใช้ Date.getHours() (browser local) หรือ toISOString().slice(0,10) (UTC)
 * แต่ใช้ dayjs.tz ซึ่งตีความตาม timezone สาขาเสมอ
 *
 * @param iso ISO string (เช่น "2026-05-17T17:00:00.000Z" หรือ "2026-05-17T12:00:00+07:00")
 * @param tz IANA timezone ของสาขา
 */
export function splitDatetimeInTz(
  iso: string,
  tz: string = DEFAULT_TIMEZONE,
): { date: string; time: string } {
  const d = dayjs(iso).tz(tz)
  // ปัดนาทีไปหา slot ที่ใกล้ที่สุด (00 หรือ 30)
  const snappedMinute = d.minute() < 30 ? "00" : "30"
  return {
    date: d.format("YYYY-MM-DD"),
    time: `${String(d.hour()).padStart(2, "0")}:${snappedMinute}`,
  }
}

/**
 * วันที่ "วันนี้" ใน timezone ของสาขา (YYYY-MM-DD)
 * ใช้เป็น minDate ของ date input เพื่อป้องกันเลือกวันในอดีต
 */
export function todayInTz(tz: string = DEFAULT_TIMEZONE): string {
  return dayjs().tz(tz).format("YYYY-MM-DD")
}

/**
 * แสดงผล datetime ในรูปแบบ "May 17, 2026, 12:00 PM"
 * ตาม timezone สาขา (ไม่ใช่ timezone เครื่อง user)
 */
export function formatDatetimeInTz(iso: string, tz: string = DEFAULT_TIMEZONE): string {
  return dayjs(iso).tz(tz).format("MMM D, YYYY, h:mm A")
}

/**
 * สร้าง default pickup datetime — วันนี้ 12:00 PM ตาม timezone สาขา
 * ISO string มี offset (เช่น "2026-05-17T12:00:00+07:00")
 */
export function defaultPickupInTz(tz: string = DEFAULT_TIMEZONE): string {
  return dayjs().tz(tz).startOf("day").add(12, "hour").format()
}

/**
 * สร้าง default dropoff datetime — อีก 2 วัน 12:00 PM ตาม timezone สาขา
 */
export function defaultDropoffInTz(tz: string = DEFAULT_TIMEZONE): string {
  return dayjs().tz(tz).add(2, "day").startOf("day").add(12, "hour").format()
}

/**
 * ตรวจว่า dropoff อยู่หลัง pickup (ใช้ใน validate)
 */
export function isDropoffAfterPickup(pickupIso: string, dropoffIso: string): boolean {
  return dayjs(dropoffIso).isAfter(dayjs(pickupIso))
}
