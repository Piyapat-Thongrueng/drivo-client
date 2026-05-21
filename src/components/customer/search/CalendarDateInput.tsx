"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { DayPicker } from "react-day-picker"
import { enUS } from "date-fns/locale"
import dayjs from "dayjs"

import "react-day-picker/style.css"
import "./calendar-picker.css"

interface CalendarDateInputProps {
  id: string
  caption: string
  dateValue: string
  minDate?: string
  onDateChange: (value: string) => void
}

interface PopoverPosition {
  top: number
  left: number
}

/** ปฏิทินแบบ popup — locale อังกฤษ, render ผ่าน portal ไม่โดน overflow-hidden ตัด */
export default function CalendarDateInput({
  id,
  caption,
  dateValue,
  minDate,
  onDateChange,
}: CalendarDateInputProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const selected = dateValue
    ? dayjs(dateValue, "YYYY-MM-DD", true).toDate()
    : undefined

  const min = minDate
    ? dayjs(minDate, "YYYY-MM-DD", true).startOf("day").toDate()
    : undefined

  const displayLabel = dateValue
    ? dayjs(dateValue, "YYYY-MM-DD", true).format("MMM D, YYYY")
    : "Select date"

  const updatePosition = useCallback((): void => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
    })
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    updatePosition()

    function handleResize(): void {
      updatePosition()
    }

    function handlePointerDown(event: MouseEvent): void {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleResize, true)
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleResize, true)
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, updatePosition])

  function handleToggle(): void {
    if (!open) updatePosition()
    setOpen((prev) => !prev)
  }

  const popover =
    open && mounted ? (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={`${caption} calendar`}
        className="drivo-day-picker fixed z-[200] rounded-xl border border-brand-gray-200 bg-brand-white p-3 shadow-xl"
        style={{ top: position.top, left: position.left }}
      >
        <DayPicker
          mode="single"
          locale={enUS}
          weekStartsOn={0}
          selected={selected}
          defaultMonth={selected ?? min ?? new Date()}
          onSelect={(date) => {
            if (!date) return
            onDateChange(dayjs(date).format("YYYY-MM-DD"))
            setOpen(false)
          }}
          disabled={min ? { before: min } : undefined}
        />
      </div>
    ) : null

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={handleToggle}
        aria-label={`${caption} — date`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="drivo-day-picker body-2 w-full min-w-0 cursor-pointer truncate bg-transparent text-left text-brand-gray-900 focus:outline-none"
      >
        {displayLabel}
      </button>

      {mounted && popover ? createPortal(popover, document.body) : null}
    </>
  )
}
