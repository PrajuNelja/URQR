import { describe, expect, it } from "vitest";
import { AuthResponseSchema, LoginRequestSchema } from "@urqr/types";

describe("authentication schemas", () => {
  it("accepts direct login credentials without a tenant slug", () => {
    const result = LoginRequestSchema.safeParse({
      username: " Vishh ",
      password: "2305",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ username: "Vishh", password: "2305" });
    }

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
});
