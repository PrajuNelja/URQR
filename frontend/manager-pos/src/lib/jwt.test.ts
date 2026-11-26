// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { decodeJWT } from "./jwt";

describe("Vennela Day 3/4: JWT RS256 Parser (decodeJWT)", () => {
  it("successfully decodes a valid JWT payload", () => {
    // sub: "mgr-101", tenant_id: "tenant-horizon", role: "ROLE_MANAGER", exp: 1735689600, iat: 1735603200, username: "manager01"
    const sampleToken =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZ3ItMTAxIiwidGVuYW50X2lkIjoidGVuYW50LWhvcml6b24iLCJyb2xlIjoiUk9MRV9NQU5BR0VSIiwiZXhwIjoxNzM1Njg5NjAwLCJpYXQiOjE3MzU2MDMyMDAsInVzZXJuYW1lIjoibWFuYWdlcjAxIn0.signature";

    const payload = decodeJWT(sampleToken);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("mgr-101");
    expect(payload?.tenant_id).toBe("tenant-horizon");
    expect(payload?.role).toBe("ROLE_MANAGER");
    expect(payload?.username).toBe("manager01");
    expect(payload?.exp).toBe(1735689600);
    expect(payload?.iat).toBe(1735603200);
  });

  it("handles base64url characters (- and _) correctly", () => {
    // Payload with base64url characters: {"sub":"user-test_01","tenant_id":"tenant-test_99","role":"ROLE_MANAGER","exp":9999999}
    const tokenWithUrlSafeChars =
      "header.eyJzdWIiOiJ1c2VyLXRlc3RfMDEiLCJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtdGVzdF85OSIsInJvbGUiOiJST0xFX01BTkFHRVIiLCJleHAiOjk5OTk5OTl9.sig";

    const payload = decodeJWT(tokenWithUrlSafeChars);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user-test_01");
    expect(payload?.tenant_id).toBe("tenant-test_99");
  });

  it("returns null safely on invalid or malformed token", () => {
    expect(decodeJWT("invalid-token")).toBeNull();
    expect(decodeJWT("")).toBeNull();
    expect(decodeJWT("header.invalid-base64.signature")).toBeNull();
  });
});
