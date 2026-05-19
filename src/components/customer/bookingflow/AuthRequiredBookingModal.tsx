"use client"

import { LogIn, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface AuthRequiredBookingModalProps {
  onLogin: () => void
  onRegister: () => void
  onClose: () => void
}

export default function AuthRequiredBookingModal({
  onLogin,
  onRegister,
  onClose,
}: AuthRequiredBookingModalProps): React.JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gray-100">
            <LogIn className="h-8 w-8 text-brand-gray-700" aria-hidden />
          </span>
        </div>

        <h2
          id="auth-required-title"
          className="headline-3 mb-2 text-center text-brand-gray-900"
        >
          Sign in to continue
        </h2>

        <p className="body-3 mb-7 text-center text-brand-gray-500">
          You need to be signed in to complete your booking. Your selections have been saved
          and will be restored after you sign in.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={onLogin}
          >
            <LogIn className="mr-2 h-4 w-4" aria-hidden />
            Sign in
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            onClick={onRegister}
          >
            <UserPlus className="mr-2 h-4 w-4" aria-hidden />
            Create an account
          </Button>
        </div>
      </div>
    </div>
  )
}
