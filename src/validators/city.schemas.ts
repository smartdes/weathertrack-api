import { z } from "zod";

export const createCitySchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    country: z.string().trim().max(100).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

export const cityIdParamsSchema = z.object({
    id: z.string().uuid("Invalid city id"),
});

export type CreateCityInput = z.infer<typeof createCitySchema>;