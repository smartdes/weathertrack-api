import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Invalid email address");

export const registerSchema = z.object({
    email,
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must be at most 72 characters"),
});

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;