"use client"

import { Button } from "@/components/ui/Button"

interface MaintenanceWarningModalProps {
  isOpen: boolean
  onClose: () => void
}

/** Shown when the car has active bookings and cannot be set to maintenance */
export function MaintenanceWarningModal({ isOpen, onClose }: MaintenanceWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="headline-4 text-brand-gray-900">Cannot set to maintenance</h2>
        <p className="body-3 mt-2 text-brand-gray-500">
          This car has confirmed or active bookings. Wait until those bookings finish before setting
          the status to maintenance.
        </p>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
