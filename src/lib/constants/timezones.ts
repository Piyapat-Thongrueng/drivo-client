export const TIMEZONE_OPTIONS = [
  // Southeast Asia
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Kuala_Lumpur",
  "Asia/Manila",
  "Asia/Phnom_Penh",
  "Asia/Rangoon",
  "Asia/Singapore",
  "Asia/Vientiane",
  // East Asia
  "Asia/Hong_Kong",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Taipei",
  "Asia/Tokyo",
  // South Asia
  "Asia/Colombo",
  "Asia/Dhaka",
  "Asia/Karachi",
  "Asia/Kathmandu",
  "Asia/Kolkata",
  // Middle East / Central Asia
  "Asia/Dubai",
  "Asia/Tashkent",
  // Oceania
  "Australia/Sydney",
  "Pacific/Auckland",
  // Europe
  "Europe/Berlin",
  "Europe/London",
  "Europe/Moscow",
  "Europe/Paris",
  // Americas
  "America/Chicago",
  "America/Los_Angeles",
  "America/New_York",
  "America/Sao_Paulo",
  // Africa
  "Africa/Cairo",
  "Africa/Nairobi",
  // UTC
  "UTC",
] as const

export type TimezoneOption = (typeof TIMEZONE_OPTIONS)[number]
