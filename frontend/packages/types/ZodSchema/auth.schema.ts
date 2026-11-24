import { z } from "zod";

export const LoginRequestSchema = z
  .object({
    username: z.string().min(1, "Username is required").trim(),
    password: z.string().min(4, "Password / PIN must be at least 4 characters"),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z
  .object({
    accessToken: z.string().min(1),
    tokenType: z.string().default("Bearer"),
    expiresAt: z.string().optional(),
    refreshToken: z.string().nullable().optional(),
    refreshExpiresAt: z.string().nullable().optional(),
    userId: z.string().uuid(),
    hotelId: z.string().uuid(),
    username: z.string(),
    role: z.string(),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
