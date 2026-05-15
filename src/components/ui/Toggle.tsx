"use client"

import { cn } from "@/lib/utils"

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: "sm" | "md"
}

export function Toggle({ checked, onChange, disabled = false, size = "md" }: ToggleProps) {
  const trackSize = size === "sm" ? "h-5 w-9" : "h-6 w-11"
  const thumbSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5"
  const thumbTranslate = size === "sm" ? "translate-x-4" : "translate-x-5"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        trackSize,
        checked ? "bg-emerald-500" : "bg-brand-gray-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
          thumbSize,
          checked ? thumbTranslate : "translate-x-0.5",
        )}
      />
    </button>
  )
}
