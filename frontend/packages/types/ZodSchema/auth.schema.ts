import { z } from "zod";

export const LoginRequestSchema = z
  .object({
    // 1. Tenant Slug (e.g., "grand-horizon") - lowercase, numbers, hyphens only
    tenantSlug: z
      .string()
      .min(1, "Tenant slug is required")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),

    // 2. Sanitized Username - trims whitespace to prevent accidental spaces
    username: z
      .string()
      .min(1, "Username is required")
      .trim(),

    // 3. Minimum Password Length (set to 4 as requested)
    password: z
      .string()
      .min(4, "Password must be at least 4 characters"),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z
  .object({
    accessToken: z.string().min(1),
    user: z
      .object({
        id: z.string().min(1),
        email: z.string().email(),
      })
      .strict(),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;