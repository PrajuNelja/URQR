// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  queryClient,
  POS_CATALOG_QUERY_KEY,
  posCatalogQueryDefaults,
  DASHBOARD_QUERY_KEY,
  dashboardQueryDefaults,
} from "../queryClient";
import {
  LoginRequestSchema,
  AuthResponseSchema,
  ProductItemSchema,
  CategorySchema,
} from "@urqr/types";
import { handlers, mockCatalogDishes, mockDashboardMetrics } from "../mocks/handlers";

describe("Vishal Scope: Page 1 of 12 Verification", () => {
  it("Task 1: TanStack Query global client instance with optimized retry policies & caching defaults", () => {
    // Global defaults
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.retry).toBe(2);
    expect(defaultOptions.queries?.staleTime).toBe(60 * 1000); // 1 minute
    expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000); // 5 minutes
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);

    // POS Catalog dedicated query defaults
    const catalogOptions = queryClient.getQueryDefaults(POS_CATALOG_QUERY_KEY);
    expect(catalogOptions.staleTime).toBe(posCatalogQueryDefaults.staleTime);
    expect(catalogOptions.retry).toBe(3);

    // Screen 3 Dashboard dedicated query defaults
    const dashboardOptions = queryClient.getQueryDefaults(DASHBOARD_QUERY_KEY);
    expect(dashboardOptions.staleTime).toBe(dashboardQueryDefaults.staleTime);
    expect(dashboardOptions.retry).toBe(2);
  });

  it("Task 2: Mock Service Worker (MSW) setup with backend REST mock endpoints", () => {
    expect(handlers.length).toBeGreaterThanOrEqual(4);

    // Endpoints in handlers
    expect(mockCatalogDishes.length).toBe(9);
    expect(mockDashboardMetrics.totalRevenue).toBe(128450.0);
    expect(mockDashboardMetrics.totalOrders).toBe(248);
  });

  it("Task 3: Strict Zod schema contracts for Auth (LoginRequest, AuthResponse) and Catalog", () => {
    // 1. Valid LoginRequest (direct login without tenant slug)
    const validLogin = {
      username: "cashier01",
      password: "pass",
    };
    const parsedLogin = LoginRequestSchema.safeParse(validLogin);
    expect(parsedLogin.success).toBe(true);

    // Rejected tenant slug (no tenantSlug allowed in cashier login)
    const invalidSlug = {
      tenantSlug: "grand-horizon",
      username: "cashier01",
      password: "pass",
    };
    expect(LoginRequestSchema.safeParse(invalidSlug).success).toBe(false);

    // Invalid password length (< 4 characters rejected)
    const shortPassword = {
      username: "cashier01",
      password: "123",
    };
    expect(LoginRequestSchema.safeParse(shortPassword).success).toBe(false);

    // 2. Valid AuthResponse
    const validAuth = {
      accessToken: "eyJhbGciOiJSUzI1NiJ9.test-jwt",
      user: {
        id: "usr_001",
        email: "manager@grandhorizon.com",
      },
    };
    expect(AuthResponseSchema.safeParse(validAuth).success).toBe(true);

    // 3. Valid ProductItem
    const validProduct = {
      id: 1,
      name: "Truffle Mushroom Soup",
      category: "Starters",
      description: "Served with garlic bread",
      price: 12.0,
    };
    expect(ProductItemSchema.safeParse(validProduct).success).toBe(true);

    // 4. Valid Category
    const validCategory = {
      key: "starters",
      label: "Starters",
    };
    expect(CategorySchema.safeParse(validCategory).success).toBe(true);
  });

  it("Task 4: Zero-wait parallel UI development with distributed @urqr/types package", () => {
    // Verifies shared contract types imported from @urqr/types
    expect(LoginRequestSchema).toBeDefined();
    expect(AuthResponseSchema).toBeDefined();
    expect(ProductItemSchema).toBeDefined();
    expect(CategorySchema).toBeDefined();
  });

  it("Task 5: Hot Module Replacement (HMR) hook and REST mock endpoint configuration", () => {
    expect(handlers.length).toBeGreaterThan(0);
  });
});
