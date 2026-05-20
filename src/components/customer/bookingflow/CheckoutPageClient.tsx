"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import StepProgressBar, {
  DEFAULT_BOOKING_STEPS,
} from "@/components/customer/bookingflow/StepProgressBar"
import AddonSelector from "@/components/customer/bookingflow/AddonSelector"
import PricingSidebar from "@/components/customer/bookingflow/PricingSidebar"
import AuthRequiredBookingModal from "@/components/customer/bookingflow/AuthRequiredBookingModal"
import BookingSubmittedModal from "@/components/customer/bookingflow/BookingSubmittedModal"
import { Button } from "@/components/ui/Button"

import { useAuth } from "@/contexts/auth-context"
import { useBookingStore } from "@/stores/bookingStore"
import type { Car } from "@/types/car"
import type { CarAddon } from "@/types/car-addon"
import { previewPricing } from "@/lib/api/pricing"
import { createBooking } from "@/lib/api/bookings"
import { getMyProfile, updateMyProfile } from "@/lib/api/auth"

// ─── Country codes for phone field ───────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+66", label: "🇹🇭 +66" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+1",  label: "🇺🇸 +1" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+60", label: "🇲🇾 +60" },
  { code: "+62", label: "🇮🇩 +62" },
  { code: "+84", label: "🇻🇳 +84" },
  { code: "+81", label: "🇯🇵 +81" },
  { code: "+86", label: "🇨🇳 +86" },
  { code: "+82", label: "🇰🇷 +82" },
]

// ─── Field component ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label className="body-3 font-medium text-brand-gray-700">{label}</label>
      {children}
      {error && <p className="body-3 text-red-500">{error}</p>}
    </div>
  )
}

const inputClass =
  "rounded-lg border border-brand-gray-200 bg-white px-3 py-2.5 body-3 text-brand-gray-900 outline-none transition-colors focus:border-brand-red-200 focus:ring-2 focus:ring-brand-red-200/20 disabled:bg-brand-gray-50 disabled:text-brand-gray-500"

// ─── Props ────────────────────────────────────────────────────────────────────────

interface CheckoutPageClientProps {
  car: Car
  addons: CarAddon[]
  carId: number
  pickupBranchId: number
  dropoffBranchId: number
  pickupBranchName: string
  dropoffBranchName: string
  pickupDatetime: string
  dropoffDatetime: string
  pickupTimezone: string
  searchQuery: string
  currencyCode: string
  isDifferentBranch: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────────

export default function CheckoutPageClient({
  car,
  addons,
  carId,
  pickupBranchId,
  dropoffBranchId,
  pickupBranchName,
  dropoffBranchName,
  pickupDatetime,
  dropoffDatetime,
  pickupTimezone,
  searchQuery,
  currencyCode,
  isDifferentBranch,
}: CheckoutPageClientProps): React.JSX.Element {
  const router = useRouter()
  const { session, isInitialized } = useAuth()
  const isLoggedIn = !!session

  const {
    selectedAddonIds,
    form,
    pricingPreview,
    toggleAddon,
    setForm,
    setPricingPreview,
    persistToSession,
    hydrateFromSession,
  } = useBookingStore()

  // ── State ───────────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pricingLoading, setPricingLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [submittedBooking, setSubmittedBooking] = useState<{
    reference: string
    id: number
  } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Initial hydration ────────────────────────────────────────────────────────
  const hydrated = useRef(false)
  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    hydrateFromSession()
  }, [hydrateFromSession])

  // ── Pre-fill form from profile (logged-in) ───────────────────────────────────
  useEffect(() => {
    if (!isInitialized || !isLoggedIn || !session) return
    void (async () => {
      try {
        const profile = await getMyProfile(session.access_token)
        setForm({
          firstName: form.firstName || profile.firstName,
          lastName: form.lastName || profile.lastName,
          email: form.email || (session.user.email ?? ""),
          phone: form.phone || profile.phone?.replace(/^\+\d+/, "") || "",
        })
      } catch {
        // ถ้า fetch ไม่ได้ก็ใช้ค่าที่กรอกอยู่แล้ว
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isLoggedIn])

  // ── Pricing preview (debounced) ───────────────────────────────────────────────
  const pricingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshPricing = useCallback(() => {
    if (pricingTimerRef.current) clearTimeout(pricingTimerRef.current)
    pricingTimerRef.current = setTimeout(async () => {
      setPricingLoading(true)
      try {
        const result = await previewPricing({
          carId,
          pickupBranchId,
          dropoffBranchId,
          pickupDatetime,
          dropoffDatetime,
          addonIds: selectedAddonIds,
        })
        setPricingPreview(result)
      } catch {
        // pricing preview ล้มเหลว — ไม่ block การจอง
      } finally {
        setPricingLoading(false)
      }
    }, 400)
  }, [
    carId,
    pickupBranchId,
    dropoffBranchId,
    pickupDatetime,
    dropoffDatetime,
    selectedAddonIds,
    setPricingPreview,
  ])

  useEffect(() => {
    refreshPricing()
    return () => {
      if (pricingTimerRef.current) clearTimeout(pricingTimerRef.current)
    }
  }, [refreshPricing])

  // ── Validation ────────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = "First name is required."
    if (!form.lastName.trim()) errs.lastName = "Last name is required."
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "A valid email address is required."
    if (!form.phone.trim()) errs.phone = "Phone number is required."
    else if (!/^\d{1,10}$/.test(form.phone.trim()))
      errs.phone = "Phone must be digits only, up to 10 digits."
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function handleBookNow() {
    if (!validate()) return

    if (!isLoggedIn) {
      // guest → save & redirect to login
      persistToSession()
      sessionStorage.setItem("drivo_return_url", window.location.href)
      setShowAuthModal(true)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const token = session!.access_token

      // 1) update phone if changed / new
      const phoneE164 = `${form.countryCode}${form.phone.trim()}`
      await updateMyProfile({ phone: phoneE164 }, token).catch(() => {
        // non-fatal — proceed even if patch fails
      })

      // 2) create booking
      const booking = await createBooking(
        {
          carId,
          pickupBranchId,
          dropoffBranchId,
          pickupDatetime,
          dropoffDatetime,
          addonIds: selectedAddonIds,
        },
        token,
      )

      setSubmittedBooking({ reference: booking.reference, id: booking.id })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoLogin() {
    setShowAuthModal(false)
    router.push(`/login?returnUrl=${encodeURIComponent(window.location.href)}`)
  }

  function handleGoRegister() {
    setShowAuthModal(false)
    router.push(`/register?returnUrl=${encodeURIComponent(window.location.href)}`)
  }

  const backHref = `/cars/${carId}?${searchQuery}`

  return (
    <>
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <StepProgressBar steps={DEFAULT_BOOKING_STEPS} currentStepIndex={2} />

        <a
          href={backHref}
          className="body-3 flex w-fit items-center gap-1.5 text-brand-gray-500 hover:text-brand-gray-700"
        >
          ← Back to vehicle details
        </a>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* ─── Left column: Form ───────────────────────────────── */}
          <div className="flex flex-col gap-8">
            {/* Your Information */}
            <section aria-labelledby="info-heading">
              <h2
                id="info-heading"
                className="headline-3 mb-5 font-bold text-brand-gray-900"
              >
                Your Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name" error={errors.firstName}>
                  <input
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => useBookingStore.getState().setFormField("firstName", e.target.value)}
                    placeholder="John"
                    className={inputClass}
                  />
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  <input
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => useBookingStore.getState().setFormField("lastName", e.target.value)}
                    placeholder="Smith"
                    className={inputClass}
                  />
                </Field>
                <Field label="Email address" error={errors.email}>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => useBookingStore.getState().setFormField("email", e.target.value)}
                    disabled={isLoggedIn}
                    readOnly={isLoggedIn}
                    placeholder="john@example.com"
                    className={`sm:col-span-2 ${inputClass}`}
                  />
                </Field>
                <Field label="Mobile number" error={errors.phone}>
                  <div className="flex gap-2">
                    <select
                      value={form.countryCode}
                      onChange={(e) => useBookingStore.getState().setFormField("countryCode", e.target.value)}
                      className={`w-28 shrink-0 ${inputClass}`}
                      aria-label="Country code"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      autoComplete="tel-local"
                      value={form.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10)
                        useBookingStore.getState().setFormField("phone", val)
                      }}
                      placeholder="812345678"
                      className={`flex-1 ${inputClass}`}
                      maxLength={10}
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Enhance Your Journey */}
            <section aria-labelledby="addons-heading">
              <h2
                id="addons-heading"
                className="headline-3 mb-5 font-bold text-brand-gray-900"
              >
                Enhance Your Journey
              </h2>
              <AddonSelector
                addons={addons}
                selectedIds={selectedAddonIds}
                currencyCode={currencyCode}
                onToggle={toggleAddon}
              />
            </section>

            {/* Submit error */}
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="body-3 text-red-700">{submitError}</p>
              </div>
            )}

            {/* Book Now (mobile only — on lg it lives inside sticky sidebar) */}
            <div className="lg:hidden">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={handleBookNow}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : (
                  "Book Now"
                )}
              </Button>
            </div>
          </div>

          {/* ─── Right column: Pricing sidebar (sticky, Book Now included) ─── */}
          <div className="hidden lg:block">
            <PricingSidebar
              car={car}
              pickupBranchName={pickupBranchName}
              dropoffBranchName={dropoffBranchName}
              pickupDatetime={pickupDatetime}
              dropoffDatetime={dropoffDatetime}
              timezone={pickupTimezone}
              pricing={pricingPreview}
              isLoading={pricingLoading}
              isDifferentBranch={isDifferentBranch}
              onBookNow={handleBookNow}
              isSubmitting={submitting}
            />
          </div>
          {/* Mobile: sidebar ไม่ sticky — แสดงด้านล่างฟอร์ม (ไม่มีปุ่ม Book Now ซ้ำ) */}
          <div className="lg:hidden">
            <PricingSidebar
              car={car}
              pickupBranchName={pickupBranchName}
              dropoffBranchName={dropoffBranchName}
              pickupDatetime={pickupDatetime}
              dropoffDatetime={dropoffDatetime}
              timezone={pickupTimezone}
              pricing={pricingPreview}
              isLoading={pricingLoading}
              isDifferentBranch={isDifferentBranch}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Auth required modal (guest) */}
      {showAuthModal && (
        <AuthRequiredBookingModal
          onLogin={handleGoLogin}
          onRegister={handleGoRegister}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Booking submitted modal */}
      {submittedBooking && (
        <BookingSubmittedModal
          reference={submittedBooking.reference}
          bookingId={submittedBooking.id}
        />
      )}
    </>
  )
}
