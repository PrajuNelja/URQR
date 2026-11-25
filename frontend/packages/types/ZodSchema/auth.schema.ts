import { z } from "zod";

export const LoginRequestSchema = z
  .object({
    // 1. Tenant Slug (e.g., "grand-horizon") - lowercase, numbers, hyphens only
    tenantSlug: z
      .string()
      .min(1, "Tenant slug is required")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ),

    // 2. Sanitized Username - trims whitespace to prevent accidental spaces
    username: z.string().min(1, "Username is required").trim(),

    // 3. Password: Minimum 4 chars, strictly alphanumeric (letters and numbers only)
    password: z
      .string()
      .min(4, "Password must be at least 4 characters")
      .regex(/^[a-zA-Z0-9]+$/, "Password must be strictly alphanumeric (letters and numbers only)"),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Optional: If your backend still returns a token for auth response
export const AuthResponseSchema = z
  .object({
    accessToken: z.string().min(1),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
