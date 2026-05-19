"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface RedirectIfAuthenticatedProps {
  /** หน้าที่จะ redirect ไปถ้า user ล็อกอินแล้ว (default: /) */
  to?: string
}

/**
 * ป้องกัน user ที่ login อยู่แล้วไม่ให้เข้า /login หรือ /register
 *
 * สำคัญ: redirect เฉพาะตอนเปิดหน้าครั้งแรกและมี session อยู่แล้วเท่านั้น
 * ไม่ redirect เมื่อ session เปลี่ยนจาก null → มีค่า (หลังกด Sign in)
 * เพื่อให้ LoginSuccessModal แสดงได้ก่อน navigate ออก
 */
export default function RedirectIfAuthenticated({ to = "/" }: RedirectIfAuthenticatedProps): null {
  const { session, isInitialized } = useAuth()
  const router = useRouter()
  // บันทึกว่าเช็คครั้งแรกหลัง isInitialized แล้วหรือยัง
  const initialCheckDoneRef = useRef(false)

  useEffect(() => {
    if (!isInitialized || initialCheckDoneRef.current) {
      return
    }

    initialCheckDoneRef.current = true

    // มี session ตั้งแต่เปิดหน้า = เคย login อยู่แล้ว → ส่งออกจากหน้า login/register
    if (session) {
      router.replace(to)
    }
  }, [session, isInitialized, router, to])

  return null
}
