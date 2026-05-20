import { loadStripe, type Stripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null> | null = null

function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — add it to your .env.local",
    )
  }
  return key
}

/** Lazy-loaded Stripe.js instance for checkout (Phase 3+). */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(getStripePublishableKey())
  }
  return stripePromise
}
