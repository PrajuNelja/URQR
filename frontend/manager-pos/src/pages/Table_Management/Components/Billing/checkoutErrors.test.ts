// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
} from "vitest";

import {
  CheckoutError,
  getCheckoutError,
} from "./checkoutErrors";

// ==========================================
// SIMULATE AXIOS ERROR RESPONSE
// ==========================================

function createApiError(
  status: number,
  code?: string
) {
  return {
    isAxiosError: true,

    name: "AxiosError",

    message: "Checkout request failed",

    response: {
      status,

      data: {
        code,
        message: "Simulated server error",
      },
    },
  };
}

// ==========================================
// CHECKOUT ERROR TEST SUITE
// ==========================================

describe("Checkout Error Handling", () => {
  // ========================================
  // TEST 1 - OUT OF STOCK
  // ========================================

  it("handles out of stock errors", () => {
    const error = createApiError(
      409,
      "OUT_OF_STOCK"
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Insufficient Stock"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 2 - INSUFFICIENT STOCK
  // ========================================

  it("handles insufficient stock errors", () => {
    const error = createApiError(
      409,
      "INSUFFICIENT_STOCK"
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Insufficient Stock"
    );
  });

  // ========================================
  // TEST 3 - PAYMENT DECLINED
  // ========================================

  it("handles declined payments", () => {
    const error = createApiError(
      422,
      "PAYMENT_DECLINED"
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Payment Declined"
    );
  });

  // ========================================
  // TEST 4 - DUPLICATE ORDER
  // ========================================

  it("handles duplicate orders", () => {
    const error = createApiError(
      409,
      "DUPLICATE_ORDER"
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Duplicate Order Detected"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TESTS 5-15 - HTTP STATUS ERRORS
  // ========================================

  it.each([
    [400, "Invalid Order Details"],
    [401, "Authentication Required"],
    [403, "Access Denied"],
    [404, "Checkout Service Unavailable"],
    [409, "Order Conflict"],
    [422, "Invalid Order Details"],
    [429, "Too Many Requests"],
    [500, "Server Error"],
    [502, "Server Communication Error"],
    [503, "Service Temporarily Unavailable"],
    [504, "Confirmation Timeout"],
  ] as const)(
    "handles HTTP %i as %s",
    (status, expectedTitle) => {
      const error = createApiError(status);

      const result = getCheckoutError(error);

      expect(result.title).toBe(
        expectedTitle
      );

      expect(
        result.requiresVerification
      ).toBe(true);
    }
  );

  // ========================================
  // TEST 16 - NETWORK FAILURE
  // ========================================

  it("handles network connection errors", () => {
    const error = {
      isAxiosError: true,

      code: "ERR_NETWORK",

      message: "Network Error",
    };

    const result = getCheckoutError(error);

    expect([
      "Connection Interrupted",
      "Internet Connection Lost",
    ]).toContain(result.title);

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 17 - REQUEST TIMEOUT
  // ========================================

  it("handles request timeout", () => {
    const error = {
      isAxiosError: true,

      code: "ECONNABORTED",

      message: "Request timed out",
    };

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Confirmation Timeout"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 18 - REQUEST CANCELLED
  // ========================================

  it("handles cancelled requests", () => {
    const error = {
      isAxiosError: true,

      code: "ERR_CANCELED",

      message: "Request cancelled",
    };

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Checkout Interrupted"
    );
  });

  // ========================================
  // TEST 19 - UNRESOLVED TRANSACTION
  // ========================================

  it("protects unresolved transactions", () => {
    const error = new Error(
      "Retry the unchanged checkout; the previous result is unresolved."
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Previous Order Pending"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 20 - INVALID CASH AMOUNT
  // ========================================

  it("handles invalid cash amounts", () => {
    const error = new Error(
      "Invalid cash amount or cart total."
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Invalid Checkout Details"
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 21 - UNSUPPORTED PAYMENT MODE
  // ========================================

  it("handles unsupported payment methods", () => {
    const error = new Error(
      "Only cash checkout is available in this development flow."
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Payment Method Unavailable"
    );
  });

  // ========================================
  // TEST 22 - INVALID SERVER RESPONSE
  // ========================================

  it("handles unexpected server responses", () => {
    const error = new Error(
      "Unexpected mock order response."
    );

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "Unexpected Server Response"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 23 - CUSTOM CHECKOUT ERROR
  // ========================================

  it("preserves custom checkout errors", () => {
    const error = new CheckoutError({
      title: "No Internet Connection",

      message: "Reconnect before checkout.",

      requiresVerification: false,
    });

    const result = getCheckoutError(error);

    expect(result.title).toBe(
      "No Internet Connection"
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 24 - UNKNOWN ERROR
  // ========================================

  it("handles unknown errors safely", () => {
    const result = getCheckoutError(
      new Error("Unexpected failure")
    );

    expect(result.title).toBe(
      "Order Confirmation Unavailable"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });
});