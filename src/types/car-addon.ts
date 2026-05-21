export interface CarAddon {
  id: number
  carId: number
  name: string
  description: string | null
  pricePerDay: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCarAddonPayload {
  name: string
  description: string
  pricePerDay: number
  isAvailable?: boolean
}

export type UpdateCarAddonPayload = Partial<CreateCarAddonPayload>
