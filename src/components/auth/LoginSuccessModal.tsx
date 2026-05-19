"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface LoginSuccessModalProps {
  /** callback เมื่อ countdown หมด หรือ user กดปุ่ม */
  onConfirm: () => void
}

export default function LoginSuccessModal({ onConfirm }: LoginSuccessModalProps): React.JSX.Element {
  const [countdown, setCountdown] = useState(3)
  const confirmedRef = useRef(false)

  const confirmOnce = useCallback((): void => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    onConfirm()
  }, [onConfirm])

  // นับถอยหลัง 3 → 2 → 1 → 0 แล้ว redirect อัตโนมัติ
  useEffect(() => {
    if (countdown <= 0) {
      confirmOnce()
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, confirmOnce])

  // กด Escape ก็ไปเลย
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") confirmOnce()
    },
    [confirmOnce],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    // overlay พื้นหลังดำโปร่งแสง
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-success-title"
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        {/* ไอคอนเช็คสีเขียว */}
        <div className="mb-5 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" aria-hidden />
          </span>
        </div>

        <h2
          id="login-success-title"
          className="headline-3 mb-2 text-brand-gray-900"
        >
          You&apos;re signed in!
        </h2>

        <p className="body-2 mb-1 text-brand-gray-600">
          Welcome back. Redirecting you in{" "}
          <span className="font-bold text-brand-red-200">{countdown}</span>{" "}
          second{countdown !== 1 ? "s" : ""}…
        </p>

        <p className="body-3 mb-7 text-brand-gray-400">
          Or click the button below to continue immediately.
        </p>

        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center font-bold"
          onClick={confirmOnce}
        >
          Go to Website Now
        </Button>
      </div>
    </div>
  )
}
