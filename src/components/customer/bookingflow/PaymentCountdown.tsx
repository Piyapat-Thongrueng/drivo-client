"use client"

import { useEffect, useState } from "react"
import dayjs from "dayjs"

interface PaymentCountdownProps {
  /** ISO datetime string ของ payment_deadline จาก backend */
  deadline: string
}

/**
 * แสดง countdown แบบ live จาก deadline ปัจจุบัน
 * อัปเดตทุก 1 วินาที  เมื่อหมดเวลา → แสดงข้อความ expired
 */
export default function PaymentCountdown({ deadline }: PaymentCountdownProps): React.JSX.Element {
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    Math.max(0, dayjs(deadline).diff(dayjs(), "second")),
  )

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setInterval(() => {
      const remaining = Math.max(0, dayjs(deadline).diff(dayjs(), "second"))
      setSecondsLeft(remaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline, secondsLeft])

  if (secondsLeft <= 0) {
    return (
      <span className="font-semibold text-red-600">
        Payment window has expired
      </span>
    )
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <span className="font-mono text-3xl font-bold tabular-nums text-brand-red-200">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  )
}
