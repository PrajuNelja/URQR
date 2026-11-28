// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
  afterEach,
} from "vitest";

import {
  renderHook,
  act,
  cleanup,
} from "@testing-library/react";

import { useCheckoutIdempotency } from "./useCheckoutIdempotency";

describe("useCheckoutIdempotency", () => {
  // Clean up React components after every test
  afterEach(() => {
    cleanup();
  });

  // TEST 1: UUID v4 generation
  it("generates a valid UUID v4", () => {
    const { result } = renderHook(() =>
      useCheckoutIdempotency()
    );

    const key = result.current.getIdempotencyKey();

    expect(key).toBeDefined();

    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  // TEST 2: Prevent duplicate transaction keys
  it("reuses the same key for repeated requests", () => {
    const { result } = renderHook(() =>
      useCheckoutIdempotency()
    );

    const firstKey =
      result.current.getIdempotencyKey();

    const secondKey =
      result.current.getIdempotencyKey();

    expect(firstKey).toBe(secondKey);
  });

  // TEST 3: Verify checkout request header
  it("generates the correct request header", () => {
    const { result } = renderHook(() =>
      useCheckoutIdempotency()
    );

    const key =
      result.current.getIdempotencyKey();

    const headers =
      result.current.getCheckoutHeaders();

    expect(headers).toEqual({
      "Idempotency-Key": key,
    });
  });

  // TEST 4: Preserve UUID after React rerender
  it("preserves the key after rerender", () => {
    const { result, rerender } = renderHook(() =>
      useCheckoutIdempotency()
    );

    const firstKey =
      result.current.getIdempotencyKey();

    rerender();

    const secondKey =
      result.current.getIdempotencyKey();

    expect(secondKey).toBe(firstKey);
  });

  // TEST 5: Generate a new UUID for the next order
  it("generates a new key after successful checkout reset", () => {
    const { result } = renderHook(() =>
      useCheckoutIdempotency()
    );

    const firstKey =
      result.current.getIdempotencyKey();

    act(() => {
      result.current.resetIdempotencyKey();
    });

    const secondKey =
      result.current.getIdempotencyKey();

    expect(secondKey).not.toBe(firstKey);
  });
});