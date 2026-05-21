export interface Country {
  id: number
  name: string
  code: string
  currencyCode: string
  timezone: string
  isActive: boolean
  defaultDepositAmount: string
  createdAt: string
  updatedAt: string
}

export interface CreateCountryPayload {
  name: string
  code: string
  currencyCode: string
  timezone: string
  isActive: boolean
  defaultDepositAmount: number
}

export type UpdateCountryPayload = Partial<CreateCountryPayload>
