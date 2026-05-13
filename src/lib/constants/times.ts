// ตัวเลือกเวลาสำหรับ Opening / Closing time dropdown ในรูปแบบ HH:MM (24hr)
// ช่วง 00:00 – 23:30 ทุกๆ 30 นาที
export const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? "00" : "30"
  return `${String(h).padStart(2, "0")}:${m}`
})

// แปลง 24hr เป็น 12hr AM/PM สำหรับแสดงผลใน UI
export function formatTimeTo12hr(time: string): string {
  const [hStr, mStr] = time.split(":")
  const h = parseInt(hStr, 10)
  const suffix = h < 12 ? "AM" : "PM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${String(h12).padStart(2, "0")}:${mStr} ${suffix}`
}
