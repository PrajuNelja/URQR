// @vitest-environment jsdom

import {
  describe,
  it,
  expect,
} from "vitest";

import {
  POS_ERRORS,
  CheckoutError,
  getCheckoutError,
  getPrinterError,
} from "./checkoutErrors";

// ==========================================
// MOCK AXIOS API ERROR RESPONSE
// ==========================================

function createApiError(
  status: number,
  code?: string
) {
  return {
    isAxiosError: true,

    name: "AxiosError",

    message: "Simulated checkout error",

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
// DAY 5 AFTERNOON TASK 3
// CHECKOUT FAILURE ERROR HANDLING
// ==========================================

describe("Manager POS Checkout Error Handling", () => {
  // ========================================
  // TEST 1 - DUPLICATE PAYMENT SUBMISSION
  // ========================================

  it("handles duplicate payment submission", () => {
    const result = getCheckoutError(
      createApiError(
        409,
        "DUPLICATE_PAYMENT_SUBMISSION"
      )
    );

    expect(result.title).toBe(
      "Duplicate Payment Submission"
    );

    expect(result.message).toBe(
      "A payment request is currently active. Avoid submitting again."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 2 - UPI PAYMENT TIMEOUT
  // ========================================

  it("handles UPI payment timeout", () => {
    const result = getCheckoutError(
      createApiError(
        504,
        "UPI_PAYMENT_TIMEOUT"
      )
    );

    expect(result.title).toBe(
      "UPI Payment Timeout"
    );

    expect(result.message).toBe(
      "Unable to confirm UPI payment. Verify transaction status to continue."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 3 - UPI PAYMENT DECLINED
  // ========================================

  it("handles UPI payment declined", () => {
    const result = getCheckoutError(
      createApiError(
        422,
        "UPI_PAYMENT_DECLINED"
      )
    );

    expect(result.title).toBe(
      "UPI Payment Declined"
    );

    expect(result.message).toBe(
      "UPI transaction declined. Please try another payment method."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 4 - UPI TRANSACTION PENDING
  // ========================================

  it("handles pending UPI transaction errors", () => {
    const result = getCheckoutError(
      createApiError(
        409,
        "UPI_TRANSACTION_PENDING"
      )
    );

    expect(result.title).toBe(
      "UPI Transaction Pending"
    );

    expect(result.message).toBe(
      "UPI transaction is awaiting confirmation. Check payment status before proceeding."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 5 - CARD PAYMENT FAILED
  // ========================================

  it("handles card payment failure", () => {
    const result = getCheckoutError(
      createApiError(
        422,
        "CARD_PAYMENT_FAILED"
      )
    );

    expect(result.title).toBe(
      "Card Payment Failed"
    );

    expect(result.message).toBe(
      "Card transaction could not be completed. Check its status and try again."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 6 - CARD TRANSACTION TIMEOUT
  // ========================================

  it("handles card transaction timeout", () => {
    const result = getCheckoutError(
      createApiError(
        504,
        "CARD_TRANSACTION_TIMEOUT"
      )
    );

    expect(result.title).toBe(
      "Card Transaction Timeout"
    );

    expect(result.message).toBe(
      "No response received from the card terminal. Verify transaction status."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 7 - ITEM SOLD OUT
  // ========================================

  it("handles item sold out", () => {
    const result = getCheckoutError(
      createApiError(
        409,
        "ITEM_SOLD_OUT"
      )
    );

    expect(result.title).toBe(
      "Item Sold Out"
    );

    expect(result.message).toBe(
      "This item is currently unavailable. Update the cart to proceed."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 8 - INSUFFICIENT STOCK
  // ========================================

  it("handles insufficient stock", () => {
    const result = getCheckoutError(
      createApiError(
        409,
        "INSUFFICIENT_STOCK"
      )
    );

    expect(result.title).toBe(
      "Insufficient Stock"
    );

    expect(result.message).toBe(
      "Requested quantity exceeds available inventory. Please adjust the quantity."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 9 - STOCK CONFLICT
  // ========================================

  it("handles stock conflict HTTP 409", () => {
    const result = getCheckoutError(
      createApiError(
        409,
        "STOCK_CONFLICT"
      )
    );

    expect(result.title).toBe(
      "Stock Conflict (409)"
    );

    expect(result.message).toBe(
      "Inventory has changed during checkout. Review the affected item before proceeding."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 10 - INTERNET DISCONNECTED
  // ========================================

  it("handles internet disconnection", () => {
    const result = getCheckoutError({
      isAxiosError: true,

      code: "ERR_NETWORK",

      message: "Network Error",
    });

    expect(result.title).toBe(
      "Internet Disconnected"
    );

    expect(result.message).toBe(
      "Network connection interrupted. Check connectivity to restore online services."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 11 - SERVER TIMEOUT
  // ========================================

  it("handles server timeout", () => {
    const result = getCheckoutError({
      isAxiosError: true,

      code: "ECONNABORTED",

      message: "Request timed out",
    });

    expect(result.title).toBe(
      "Server Timeout"
    );

    expect(result.message).toBe(
      "Server response timed out. Check whether the order was processed before trying again."
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });
});

// ==========================================
// PRINTER ERROR HANDLING
// ==========================================

describe("Manager POS Printer Error Handling", () => {
  // ========================================
  // TEST 12 - PRINTER DISCONNECTED
  // ========================================

  it("handles printer disconnection", () => {
    const result = getPrinterError(
      "DISCONNECTED"
    );

    expect(result.title).toBe(
      "Printer Disconnected"
    );

    expect(result.message).toBe(
      "Unable to connect to the thermal printer. Verify the device connection."
    );

    // Printing errors must not invalidate
    // an already confirmed payment.

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 14 - PRINTER OUT OF PAPER
  // ========================================

  it("handles printer out of paper", () => {
    const result = getPrinterError(
      "OUT_OF_PAPER"
    );

    expect(result.title).toBe(
      "Printer Out of Paper"
    );

    expect(result.message).toBe(
      "Paper supply is exhausted. Load a new paper roll to resume printing."
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 15 - RECEIPT PRINTING TIMEOUT
  // ========================================

  it("handles receipt printing timeout", () => {
    const result = getPrinterError(
      "TIMEOUT"
    );

    expect(result.title).toBe(
      "Receipt Printing Timeout"
    );

    expect(result.message).toBe(
      "Receipt printing is taking longer than expected. Verify printer status and retry."
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });
});

// ==========================================
// WEBSOCKET ERROR MESSAGE
// ==========================================

describe("Manager POS WebSocket Error", () => {
  // ========================================
  // TEST 13 - WEBSOCKET DISCONNECTED
  // ========================================

  it("provides the WebSocket disconnected message", () => {
    const result =
      POS_ERRORS.WEBSOCKET_DISCONNECTED;

    expect(result.title).toBe(
      "WebSocket Disconnected"
    );

    expect(result.message).toBe(
      "Real-time connection lost. Attempting to restore live updates."
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });
});

// ==========================================
// ADDITIONAL HTTP SERVER ERROR HANDLING
// ==========================================

describe("Checkout HTTP Error Handling", () => {
  // TESTS 16 - 27

  it.each([
    [400, "Invalid Order Details"],

    [401, "Authentication Required"],

    [403, "Access Denied"],

    [404, "Checkout Service Unavailable"],

    [408, "Server Timeout"],

    [409, "Order Conflict"],

    [422, "Invalid Order Details"],

    [429, "Too Many Requests"],

    [500, "Server Error"],

    [502, "Server Error"],

    [503, "Checkout Service Unavailable"],

    [504, "Server Timeout"],
  ] as const)(
    "handles HTTP status %i as %s",
    (status, expectedTitle) => {
      const result = getCheckoutError(
        createApiError(status)
      );

      expect(result.title).toBe(
        expectedTitle
      );

      expect(
        result.requiresVerification
      ).toBe(true);
    }
  );
});

// ==========================================
// ADDITIONAL TRANSACTION SAFETY TESTS
// ==========================================

describe("Checkout Transaction Safety", () => {
  // ========================================
  // TEST 28 - REQUEST CANCELLED
  // ========================================

  it("handles cancelled checkout requests", () => {
    const result = getCheckoutError({
      isAxiosError: true,

      code: "ERR_CANCELED",

      message: "Request cancelled",
    });

    expect(result.title).toBe(
      "Checkout Interrupted"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 29 - UNRESOLVED TRANSACTION
  // ========================================

  it("protects unresolved transactions", () => {
    const result = getCheckoutError(
      new Error(
        "Retry the unchanged checkout; the previous result is unresolved."
      )
    );

    expect(result.title).toBe(
      "Previous Order Pending"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 30 - INVALID CASH AMOUNT
  // ========================================

  it("handles invalid cash amounts", () => {
    const result = getCheckoutError(
      new Error(
        "Invalid cash amount or cart total."
      )
    );

    expect(result.title).toBe(
      "Invalid Checkout Details"
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 31 - UNSUPPORTED PAYMENT METHOD
  // ========================================

  it("handles unsupported payment methods", () => {
    const result = getCheckoutError(
      new Error(
        "Only cash checkout is available in this development flow."
      )
    );

    expect(result.title).toBe(
      "Payment Method Unavailable"
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 32 - UNEXPECTED SERVER RESPONSE
  // ========================================

  it("handles unexpected server responses", () => {
    const result = getCheckoutError(
      new Error(
        "Unexpected mock order response."
      )
    );

    expect(result.title).toBe(
      "Unexpected Server Response"
    );

    expect(
      result.requiresVerification
    ).toBe(true);
  });

  // ========================================
  // TEST 33 - CUSTOM CHECKOUT ERROR
  // ========================================

  it("preserves custom checkout errors", () => {
    const customError = new CheckoutError({
      ...POS_ERRORS.INTERNET_DISCONNECTED,

      requiresVerification: false,
    });

    const result =
      getCheckoutError(customError);

    expect(result.title).toBe(
      "Internet Disconnected"
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 34 - UNKNOWN CHECKOUT ERROR
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

  // ========================================
  // TEST 35 - UNKNOWN PRINTER ERROR
  // ========================================

  it("handles unknown printer errors", () => {
    const result =
      getPrinterError("UNKNOWN");

    expect(result.title).toBe(
      "Receipt Printing Failed"
    );

    expect(
      result.requiresVerification
    ).toBe(false);
  });

  // ========================================
  // TEST 36 - NESTED SERVER ERROR RESPONSE
  // ========================================

  it("handles nested server error codes", () => {
    const result = getCheckoutError({
      isAxiosError: true,

      response: {
        status: 409,

        data: {
          error: {
            code: "ITEM_SOLD_OUT",
          },
        },
      },
    });

    expect(result).toEqual(
      POS_ERRORS.ITEM_SOLD_OUT
    );
  });

  // ========================================
  // TEST 37 - OUT OF STOCK ALIAS
  // ========================================

  it("handles out of stock error codes", () => {
    const result = getCheckoutError(
      createApiError(
        409,
        "OUT_OF_STOCK"
      )
    );

    expect(result).toEqual(
      POS_ERRORS.INSUFFICIENT_STOCK
    );
  });

  // ========================================
  // TEST 38 - SERVER ERROR CODE PRIORITY
  // ========================================

  it("prioritizes specific server error codes over HTTP status", () => {
    const result = getCheckoutError(
      createApiError(
        409,
        "UPI_TRANSACTION_PENDING"
      )
    );

    expect(result.title).toBe(
      "UPI Transaction Pending"
    );

    expect(result.title).not.toBe(
      "Order Conflict"
    );
  });
});