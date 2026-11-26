// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

describe("Vennela Day 3/4: Auth Store & In-Memory Token Management (useAuthStore)", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
  });

  it("starts in an unauthenticated state when storage is empty", () => {
    const store = useAuthStore.getState();
    expect(store.accessToken).toBeNull();
    expect(store.tenantId).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it("sets authentication, updates state, and persists to localStorage", () => {
    const sampleToken =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwidGVuYW50X2lkIjoidGVuYW50LTEiLCJyb2xlIjoiUk9MRV9NQU5BR0VSIiwiZXhwIjoxOTAwMDAwMDAwLCJ1c2VybmFtZSI6IlByYWp2YWwifQ.sig";

    useAuthStore.getState().setAuth(sampleToken);

    const store = useAuthStore.getState();
    expect(store.accessToken).toBe(sampleToken);
    expect(store.tenantId).toBe("tenant-1");
    expect(store.user?.id).toBe("user-42");
    expect(store.user?.name).toBe("Prajval");
    expect(store.user?.role).toBe("ROLE_MANAGER");
    expect(store.isAuthenticated()).toBe(true);

    expect(localStorage.getItem("access_token")).toBe(sampleToken);
    expect(localStorage.getItem("tenant_id")).toBe("tenant-1");
  });

  it("clears authentication state and removes items from localStorage", () => {
    const sampleToken =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwidGVuYW50X2lkIjoidGVuYW50LTEiLCJyb2xlIjoiUk9MRV9NQU5BR0VSIiwiZXhwIjoxOTAwMDAwMDAwLCJ1c2VybmFtZSI6IlByYWp2YWwifQ.sig";

    useAuthStore.getState().setAuth(sampleToken);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);

    useAuthStore.getState().clearAuth();
    const store = useAuthStore.getState();
    expect(store.accessToken).toBeNull();
    expect(store.tenantId).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated()).toBe(false);

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("tenant_id")).toBeNull();
  });
});
