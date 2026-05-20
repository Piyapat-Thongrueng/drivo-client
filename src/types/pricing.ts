export interface PricingBreakdown {
  days: number
  hours: number
  baseAmount: number
  addonAmount: number
  oneWayFee: number
  totalAmount: number
  depositAmount: number
}

export interface PricingPreviewResult extends PricingBreakdown {
  currencyCode: string
  timezone: string
  addons: Array<{ id: number; pricePerDay: number }>
}
