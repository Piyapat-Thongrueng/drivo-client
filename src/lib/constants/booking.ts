/**
 * Mirrors server PAYMENT_DEADLINE_MS — time to pay after admin approval.
 * Must be > 30 min to satisfy Stripe's minimum expires_at constraint.
 */
export const PAYMENT_DEADLINE_MS = 35 * 60 * 1000
