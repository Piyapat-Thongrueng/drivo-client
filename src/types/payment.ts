export type PaymentKind = "rental" | "deposit" | "refund"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface Payment {
  id: number
  bookingId: number
  paymentType: PaymentKind
  stripePaymentIntentId: string | null
  stripeCheckoutSessionId: string | null
  amount: string
  currencyCode: string
  status: PaymentStatus
  paidAt: string | null
  idempotencyKey: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
