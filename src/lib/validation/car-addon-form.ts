import { z } from "zod"

/** Matches drivo-server createCarAddonSchema */
export const carAddonFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be at most 300 characters"),
  pricePerDay: z.number().positive("Price per day must be greater than 0"),
})

export type CarAddonFormValues = z.infer<typeof carAddonFormSchema>
