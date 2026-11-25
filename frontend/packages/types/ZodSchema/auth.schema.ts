import { z } from "zod";

export const LoginRequestSchema = z
  .object({
    // 1. Tenant Slug (optional, for backward-compatible test fixtures; not required for POS login)
    tenantSlug: z
      .string()
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
      .optional(),

    // 2. Sanitized Username - trims whitespace to prevent accidental spaces
    username: z
      .string()
      .min(1, "Username is required")
      .trim(),

    // 3. Password: Minimum 4 characters
    password: z
      .string()
      .min(4, "Password must be at least 4 characters"),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    hotelId: z.string().uuid("Invalid hotel ID"),
    role: z.string().min(1, "Role is required"),
  })
  .strict();

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const AuthResponseSchema = z
  .object({
    accessToken: z.string().min(1, "Access token is required"),
    user: z
      .object({
        id: z.string().min(1, "User ID is required"),
        email: z.string().email("Invalid email address"),
      })
      .strict(),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
