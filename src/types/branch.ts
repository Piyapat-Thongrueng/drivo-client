export interface Branch {
  id: number
  countryId: number
  name: string
  address: string
  latitude: string | null
  longitude: string | null
  openingTime: string | null
  closingTime: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBranchPayload {
  countryId: number
  name: string
  address: string
  latitude?: number | null
  longitude?: number | null
  openingTime?: string | null
  closingTime?: string | null
  isActive: boolean
}

export type UpdateBranchPayload = Partial<Omit<CreateBranchPayload, "countryId">>

export interface OneWayFee {
  id: number
  fromBranchId: number
  toBranchId: number
  fee: string
  createdAt: string
  updatedAt: string
}

export interface CreateOneWayFeePayload {
  fromBranchId: number
  toBranchId: number
  fee: number
}

export interface UpdateOneWayFeePayload {
  fee: number
}
