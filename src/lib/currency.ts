/**
 * Format a numeric amount with a 3-letter ISO 4217 currency code.
 *
 * Uses Intl.NumberFormat where the browser/runtime supports it;
 * falls back to a simple "{code} {number}" string otherwise.
 *
 * Examples:
 *   formatCurrency(1500, "THB")  → "฿1,500"  (or "THB 1,500" in some locales)
 *   formatCurrency(99.5,  "GBP") → "£99.50"
 */
export function formatCurrency(
  amount: number | string,
  currencyCode: string,
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return String(amount)

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return `${currencyCode} ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }
}

/**
 * Format a rate with a unit label.
 * e.g. formatRate(1500, "THB", "day") → "฿1,500 /day"
 */
export function formatRate(
  amount: number | string,
  currencyCode: string,
  unit: "day" | "hr",
): string {
  return `${formatCurrency(amount, currencyCode)} /${unit}`
}
