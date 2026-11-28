// src/lib/apiClient.test.ts
// @vitest-environment jsdom
import { AxiosHeaders, type AxiosAdapter, AxiosError } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./apiClient";
import axios from "axios";

describe("apiClient request tracing", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds a unique UUID request ID to every outgoing request", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
    });

    const requestIds: string[] = [];
    const correlationIds: string[] = [];
    const adapter: AxiosAdapter = async (config) => {
      requestIds.push(String(config.headers.get("X-Request-ID")));
      correlationIds.push(String(config.headers.get("X-Correlation-ID")));
      return {
        config,
        data: {},
        headers: new AxiosHeaders(),
        status: 200,
        statusText: "OK",
      };
    };

    await Promise.all([
      apiClient.get("/trace-test/one", { adapter }),
      apiClient.get("/trace-test/two", { adapter }),
    ]);

    expect(requestIds).toHaveLength(2);
    expect(new Set(requestIds).size).toBe(2);
    expect(correlationIds).toEqual(requestIds);
    expect(requestIds).toEqual([
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    ]);
  });
});

describe("apiClient JWT Refresh Loop", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("intercepts 401, refreshes token, and retries the original request", async () => {
    // 1. Mock LocalStorage to simulate an existing expired session
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key) => {
        if (key === "access_token") return "old-expired-token";
        if (key === "tenant_id") return "tenant-1";
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    let requestCount = 0;
    const originalAdapter = apiClient.defaults.adapter;

    // 2. Setup custom adapter on apiClient
    apiClient.defaults.adapter = async (config) => {
      requestCount++;
      
      // First request fails with 401
      if (requestCount === 1) {
        throw new AxiosError(
          "Unauthorized",
          "401",
          config,
          {},
          { status: 401, data: {}, statusText: "Unauthorized", headers: {}, config }
        );
      }
      
      // Retried request succeeds
      return {
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders(),
        config,
      };
    };

    // 3. Mock the raw axios.post (refresh call)
    const refreshSpy = vi.spyOn(axios, "post").mockResolvedValueOnce({
      data: { accessToken: "new-valid-token" },
    });

    // 4. Trigger the API call
    const response = await apiClient.get("/protected-route");

    // 5. Assertions
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
    
    expect(refreshSpy).toHaveBeenCalledWith(
      expect.stringContaining("/auth/refresh"),
      {},
      expect.objectContaining({ withCredentials: true })
    );

    expect(localStorage.setItem).toHaveBeenCalledWith("access_token", "new-valid-token");
    expect(requestCount).toBe(2);
    
    apiClient.defaults.adapter = originalAdapter;
  });
});