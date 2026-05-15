export type CarStatus = "available" | "maintenance"

export type CarType = "sedan" | "suv" | "van" | "hatchback" | "pickup"

export type TransmissionType = "auto" | "manual"

export type FuelType = "gasoline" | "diesel" | "electric" | "hybrid"

export interface Car {
  id: number
  branchId: number
  currentBranchId: number
  make: string
  model: string
  year: number
  color: string
  licensePlate: string
  imageUrl: string | null
  carType: CarType
  seats: number
  luggageCapacity: number
  doors: number
  transmission: TransmissionType
  fuelType: FuelType
  hourlyRate: string
  dailyRate: string
  description: string | null
  status: CarStatus
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateCarPayload {
  branchId: number
  make: string
  model: string
  year: number
  color: string
  licensePlate: string
  imageUrl?: string | null
  carType: CarType
  seats: number
  luggageCapacity: number
  doors: number
  transmission: TransmissionType
  fuelType: FuelType
  hourlyRate: number
  dailyRate: number
  description?: string | null
  status: CarStatus
}

/** GET /api/cars/:id — includes flag for admin before switching to maintenance */
export interface CarDetail extends Car {
  hasActiveBooking: boolean
}

/** PATCH /api/cars/:id — branchId omitted (home branch) */
export type UpdateCarPayload = Omit<CreateCarPayload, "branchId">
