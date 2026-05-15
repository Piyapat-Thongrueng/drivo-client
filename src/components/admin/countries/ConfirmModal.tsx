"use client"

import { Button } from "@/components/ui/Button"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    // Overlay backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="headline-4 text-brand-gray-900">{title}</h2>
        <p className="body-3 mt-2 text-brand-gray-500">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2.5 body-3 font-medium transition-all disabled:pointer-events-none disabled:opacity-60 ${
              isDangerous
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-brand-red-200 text-white hover:opacity-90"
            }`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
