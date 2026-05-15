import { z } from "zod"

const CURRENT_YEAR = new Date().getFullYear()

/** Matches drivo-server/src/types/dto/car.dto.ts — createCarSchema */
export const createCarFormSchema = z.object({
  branchId: z.number().int().positive("Please select a branch"),
  make: z.string().min(1, "Make is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  year: z
    .number()
    .int()
    .min(1990, "Year must be 1990 or later")
    .max(CURRENT_YEAR, `Year cannot exceed ${CURRENT_YEAR}`),
  color: z.string().min(1, "Color is required").max(50),
  licensePlate: z.string().min(1, "License plate is required").max(20),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  carType: z.enum(["sedan", "suv", "van", "hatchback", "pickup"]),
  seats: z.number().int().min(1).max(20),
  luggageCapacity: z.number().int().min(0).max(20),
  doors: z.number().int().min(2).max(6),
  transmission: z.enum(["auto", "manual"]),
  fuelType: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
  hourlyRate: z.number().positive("Hourly rate must be greater than 0"),
  dailyRate: z.number().positive("Daily rate must be greater than 0"),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(["available", "maintenance"]).default("available"),
})

export type CreateCarFormValues = z.infer<typeof createCarFormSchema>

/** Edit car — no branchId (PATCH matches updateCarSchema) */
export const editCarFormSchema = createCarFormSchema.omit({ branchId: true })

export type EditCarFormValues = z.infer<typeof editCarFormSchema>
