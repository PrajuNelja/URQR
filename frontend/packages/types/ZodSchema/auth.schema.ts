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
    accessToken: z.string().min(1, "Access token is required"),
    tokenType: z.string().default("Bearer").optional(),
    expiresAt: z.string().optional(),
    refreshToken: z.string().nullable().optional(),
    refreshExpiresAt: z.string().nullable().optional(),
    userId: z.string().uuid().optional(),
    hotelId: z.string().uuid().optional(),
    username: z.string().optional(),
    role: z.string().optional(),
    user: z
      .object({
        id: z.string().min(1),
        email: z.string().email(),
      })
      .optional(),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const LoginResponseSchema = AuthResponseSchema;
export type LoginResponse = AuthResponse;
