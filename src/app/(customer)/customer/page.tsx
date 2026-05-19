import { redirect } from "next/navigation"

// หน้านี้ไม่ได้ใช้แล้ว — redirect กลับหน้าหลัก
export default function CustomerPage(): never {
  redirect("/")
}
