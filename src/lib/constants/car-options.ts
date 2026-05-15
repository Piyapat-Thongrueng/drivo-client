import type { CarStatus, CarType, FuelType, TransmissionType } from "@/types/car"

export const CAR_TYPE_OPTIONS: { value: CarType; label: string }[] = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Van" },
  { value: "hatchback", label: "Hatchback" },
  { value: "pickup", label: "Pickup" },
]

export const TRANSMISSION_OPTIONS: { value: TransmissionType; label: string }[] = [
  { value: "auto", label: "Automatic" },
  { value: "manual", label: "Manual" },
]

export const FUEL_TYPE_OPTIONS: { value: FuelType; label: string }[] = [
  { value: "gasoline", label: "Gasoline" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
]

export const CAR_STATUS_OPTIONS: { value: CarStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "maintenance", label: "Maintenance" },
]
