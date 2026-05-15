export interface Country {
  id: number
  name: string
  code: string
  currencyCode: string
  timezone: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCountryPayload {
  name: string
  code: string
  currencyCode: string
  timezone: string
  isActive: boolean
}

export type UpdateCountryPayload = Partial<CreateCountryPayload>
