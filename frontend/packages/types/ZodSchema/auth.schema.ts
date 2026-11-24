import { z } from "zod";

export const LoginRequestSchema = z
  .object({
    // 1. Sanitized Username - trims whitespace to prevent accidental spaces
    username: z
      .string()
      .min(1, "Username is required")
      .trim(),

    // 2. Minimum Password Length (set to 4 as requested)
    password: z
      .string()
      .min(4, "Password must be at least 4 characters"),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z
  .object({
    token: z.string().min(1),
    refreshToken: z.string().optional(),
    user: z
      .object({
        id: z.string().min(1),
        username: z.string().min(1),
        role: z.string().min(1),
        hotelId: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
