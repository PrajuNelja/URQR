import { AxiosHeaders, type AxiosAdapter } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./apiClient";

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
