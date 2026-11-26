import { describe, expect, it } from "vitest";
import { AuthResponseSchema, LoginRequestSchema } from "@urqr/types";
import { z } from "zod";

// Vennela Screen 1 Client-Side Validation Schema
const LoginFormSchema = z.object({
  username: z.string().trim().min(1, "Enter your username."),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

describe("Vennela Day 1/4: Authentication Schemas & Validation Contracts", () => {
  it("accepts direct login credentials without a tenant slug", () => {
    const result = LoginRequestSchema.safeParse({
      username: " Vishh ",
      password: "2305",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ username: "Vishh", password: "2305" });
    }

    // Explicit check: tenantSlug is excluded
    expect(
      LoginRequestSchema.safeParse({
        tenantSlug: "grand-horizon",
        username: "Vishh",
        password: "2305",
      }).success,
    ).toBe(false);
  });

  it("parses the backend login response shape", () => {
    const response = {
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresAt: "2026-11-24T10:00:00Z",
      refreshToken: null,
      refreshExpiresAt: null,
      userId: "123e4567-e89b-12d3-a456-426614174000",
      hotelId: "123e4567-e89b-12d3-a456-426614174001",
      username: "Vishh",
      role: "MANAGER",
    };

    expect(AuthResponseSchema.parse(response)).toEqual(response);
  });

  it("validates client-side login form constraints", () => {
    // Valid inputs
    const valid = LoginFormSchema.safeParse({
      username: "manager_01",
      password: "pass1234",
    });
    expect(valid.success).toBe(true);

    // Empty username
    const emptyUsername = LoginFormSchema.safeParse({
      username: "   ",
      password: "pass1234",
    });
    expect(emptyUsername.success).toBe(false);
    if (!emptyUsername.success) {
      expect(emptyUsername.error.issues[0].message).toBe("Enter your username.");
    }

    // Password too short (<4 chars)
    const shortPassword = LoginFormSchema.safeParse({
      username: "manager_01",
      password: "123",
    });
    expect(shortPassword.success).toBe(false);
    if (!shortPassword.success) {
      expect(shortPassword.error.issues[0].message).toBe(
        "Password must be at least 4 characters."
      );
    }
  });
});
