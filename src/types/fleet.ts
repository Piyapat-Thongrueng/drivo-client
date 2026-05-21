import type { Car } from "@/types/car"

/** รถในหน้า Our fleet — รวมข้อมูลประเทศ/สาขาที่รถอยู่ */
export interface FleetCar extends Car {
  countryId: number
  countryName: string
  currencyCode: string
  branchName: string
}
