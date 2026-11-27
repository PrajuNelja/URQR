import { isAxiosError } from "axios";

// ==========================================
// CHECKOUT ERROR TYPES
// ==========================================

export interface CheckoutErrorDetails {
  title: string;
  message: string;
  requiresVerification: boolean;
}

// ==========================================
// CUSTOM CHECKOUT ERROR CLASS
// ==========================================

export class CheckoutError extends Error {
  readonly details: CheckoutErrorDetails;

  constructor(details: CheckoutErrorDetails) {
    super(details.message);

    this.name = "CheckoutError";
    this.details = details;
  }
}

// ==========================================
// MANAGER POS ERROR MESSAGES
// BASED ON PROVIDED PDF
// ==========================================

export const POS_ERRORS = {
  // 1. DUPLICATE PAYMENT

  DUPLICATE_PAYMENT: {
    title: "Duplicate Payment Submission",

    message:
      "A payment request is currently active. Avoid submitting again.",

    requiresVerification: true,
  },

  // 2. UPI TIMEOUT

  UPI_TIMEOUT: {
    title: "UPI Payment Timeout",

    message:
      "Unable to confirm UPI payment. Verify transaction status to continue.",

    requiresVerification: true,
  },

  // 3. UPI DECLINED

  UPI_DECLINED: {
    title: "UPI Payment Declined",

    message:
      "UPI transaction declined. Please try another payment method.",

    requiresVerification: true,
  },

  // 4. UPI PENDING

  UPI_PENDING: {
    title: "UPI Transaction Pending",

    message:
      "UPI transaction is awaiting confirmation. Check payment status before proceeding.",

    requiresVerification: true,
  },

  // 5. CARD FAILED

  CARD_FAILED: {
    title: "Card Payment Failed",

    message:
      "Card transaction could not be completed. Check its status and try again.",

    requiresVerification: true,
  },

  // 6. CARD TIMEOUT

  CARD_TIMEOUT: {
    title: "Card Transaction Timeout",

    message:
      "No response received from the card terminal. Verify transaction status.",

    requiresVerification: true,
  },

  // 7. ITEM SOLD OUT

  ITEM_SOLD_OUT: {
    title: "Item Sold Out",

    message:
      "This item is currently unavailable. Update the cart to proceed.",

    requiresVerification: true,
  },

  // 8. INSUFFICIENT STOCK

  INSUFFICIENT_STOCK: {
    title: "Insufficient Stock",

    message:
      "Requested quantity exceeds available inventory. Please adjust the quantity.",

    requiresVerification: true,
  },

  // 9. STOCK CONFLICT

  STOCK_CONFLICT: {
    title: "Stock Conflict (409)",

    message:
      "Inventory has changed during checkout. Review the affected item before proceeding.",

    requiresVerification: true,
  },

  // 10. INTERNET DISCONNECTED

  INTERNET_DISCONNECTED: {
    title: "Internet Disconnected",

    message:
      "Network connection interrupted. Check connectivity to restore online services.",

    requiresVerification: true,
  },

  // 11. SERVER TIMEOUT

  SERVER_TIMEOUT: {
    title: "Server Timeout",

    message:
      "Server response timed out. Check whether the order was processed before trying again.",

    requiresVerification: true,
  },

  // 12. PRINTER DISCONNECTED

  PRINTER_DISCONNECTED: {
    title: "Printer Disconnected",

    message:
      "Unable to connect to the thermal printer. Verify the device connection.",

    requiresVerification: false,
  },

  // 13. WEBSOCKET DISCONNECTED

  WEBSOCKET_DISCONNECTED: {
    title: "WebSocket Disconnected",

    message:
      "Real-time connection lost. Attempting to restore live updates.",

    requiresVerification: false,
  },

  // 14. PRINTER OUT OF PAPER

  PRINTER_OUT_OF_PAPER: {
    title: "Printer Out of Paper",

    message:
      "Paper supply is exhausted. Load a new paper roll to resume printing.",

    requiresVerification: false,
  },

  // 15. RECEIPT PRINTING TIMEOUT

  RECEIPT_PRINTING_TIMEOUT: {
    title: "Receipt Printing Timeout",

    message:
      "Receipt printing is taking longer than expected. Verify printer status and retry.",

    requiresVerification: false,
  },
} as const satisfies Record<
  string,
  CheckoutErrorDetails
>;

// ==========================================
// ADDITIONAL CHECKOUT ERROR MESSAGES
// ==========================================

const FALLBACK_ERRORS = {
  INVALID_ORDER: {
    title: "Invalid Order Details",

    message:
      "Review the order details before proceeding.",

    requiresVerification: true,
  },

  AUTHENTICATION: {
    title: "Authentication Required",

    message:
      "Your session may have expired. Contact your supervisor to verify the transaction.",

    requiresVerification: true,
  },

  ACCESS_DENIED: {
    title: "Access Denied",

    message:
      "You do not have permission to complete this operation.",

    requiresVerification: true,
  },

  SERVICE_UNAVAILABLE: {
    title: "Checkout Service Unavailable",

    message:
      "The checkout service is unavailable. Verify the previous order before retrying.",

    requiresVerification: true,
  },

  ORDER_CONFLICT: {
    title: "Order Conflict",

    message:
      "The order conflicts with an existing request. Verify its status before proceeding.",

    requiresVerification: true,
  },

  TOO_MANY_REQUESTS: {
    title: "Too Many Requests",

    message:
      "Too many checkout requests were received. Verify the transaction before retrying.",

    requiresVerification: true,
  },

  SERVER_ERROR: {
    title: "Server Error",

    message:
      "The server encountered an error. Verify whether the order was processed.",

    requiresVerification: true,
  },

  PAYMENT_DECLINED: {
    title: "Payment Declined",

    message:
      "The server reported that the payment was declined. Verify the transaction status.",

    requiresVerification: true,
  },

  CHECKOUT_INTERRUPTED: {
    title: "Checkout Interrupted",

    message:
      "The checkout request was interrupted. Verify the order status before retrying.",

    requiresVerification: true,
  },

  PREVIOUS_ORDER_PENDING: {
    title: "Previous Order Pending",

    message:
      "Verify the previous transaction before retrying the original checkout.",

    requiresVerification: true,
  },

  INVALID_CHECKOUT: {
    title: "Invalid Checkout Details",

    message:
      "Check the payable amount, product quantity and cash collected.",

    requiresVerification: false,
  },

  PAYMENT_UNAVAILABLE: {
    title: "Payment Method Unavailable",

    message:
      "This payment method is not available in the current checkout integration.",

    requiresVerification: false,
  },

  UNEXPECTED_RESPONSE: {
    title: "Unexpected Server Response",

    message:
      "The server returned an unexpected response. Verify the order before trying again.",

    requiresVerification: true,
  },

  UNKNOWN_ERROR: {
    title: "Order Confirmation Unavailable",

    message:
      "Unable to confirm the order. Verify its status before submitting another payment.",

    requiresVerification: true,
  },
} as const satisfies Record<
  string,
  CheckoutErrorDetails
>;

// ==========================================
// SAFE ERROR RESPONSE PARSING
// ==========================================

function asRecord(
  value: unknown
): Record<string, unknown> | undefined {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function normalizeCode(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function extractServerCode(
  data: unknown
): string {
  const root = asRecord(data);

  if (!root) {
    return "";
  }

  const nestedError =
    asRecord(root.error);

  return normalizeCode(
    root.code ??
      root.errorCode ??
      nestedError?.code ??
      nestedError?.errorCode
  );
}

// ==========================================
// SERVER ERROR CODE MAPPING
// ==========================================

const ERROR_CODE_MAP: Partial<
  Record<string, CheckoutErrorDetails>
> = {
  DUPLICATE_PAYMENT:
    POS_ERRORS.DUPLICATE_PAYMENT,

  DUPLICATE_PAYMENT_SUBMISSION:
    POS_ERRORS.DUPLICATE_PAYMENT,

  PAYMENT_IN_PROGRESS:
    POS_ERRORS.DUPLICATE_PAYMENT,

  UPI_TIMEOUT:
    POS_ERRORS.UPI_TIMEOUT,

  UPI_PAYMENT_TIMEOUT:
    POS_ERRORS.UPI_TIMEOUT,

  UPI_DECLINED:
    POS_ERRORS.UPI_DECLINED,

  UPI_PAYMENT_DECLINED:
    POS_ERRORS.UPI_DECLINED,

  UPI_PENDING:
    POS_ERRORS.UPI_PENDING,

  UPI_TRANSACTION_PENDING:
    POS_ERRORS.UPI_PENDING,

  CARD_FAILED:
    POS_ERRORS.CARD_FAILED,

  CARD_PAYMENT_FAILED:
    POS_ERRORS.CARD_FAILED,

  CARD_TIMEOUT:
    POS_ERRORS.CARD_TIMEOUT,

  CARD_TRANSACTION_TIMEOUT:
    POS_ERRORS.CARD_TIMEOUT,

  ITEM_SOLD_OUT:
    POS_ERRORS.ITEM_SOLD_OUT,

  SOLD_OUT:
    POS_ERRORS.ITEM_SOLD_OUT,

  OUT_OF_STOCK:
    POS_ERRORS.INSUFFICIENT_STOCK,

  INSUFFICIENT_STOCK:
    POS_ERRORS.INSUFFICIENT_STOCK,

  STOCK_CONFLICT:
    POS_ERRORS.STOCK_CONFLICT,

  INVENTORY_CONFLICT:
    POS_ERRORS.STOCK_CONFLICT,

  INTERNET_DISCONNECTED:
    POS_ERRORS.INTERNET_DISCONNECTED,

  SERVER_TIMEOUT:
    POS_ERRORS.SERVER_TIMEOUT,

  PAYMENT_DECLINED:
    FALLBACK_ERRORS.PAYMENT_DECLINED,

  DUPLICATE_ORDER:
    FALLBACK_ERRORS.ORDER_CONFLICT,
};

// ==========================================
// MAIN CHECKOUT ERROR HANDLER
// ==========================================

export function getCheckoutError(
  cause: unknown
): CheckoutErrorDetails {
  // Preserve custom checkout errors.

  if (cause instanceof CheckoutError) {
    return cause.details;
  }

  // ========================================
  // AXIOS API ERRORS
  // ========================================

  if (isAxiosError(cause)) {
    const serverCode =
      extractServerCode(
        cause.response?.data
      );

    // Server-specific error codes take
    // priority over generic HTTP statuses.

    const mappedError =
      Object.prototype.hasOwnProperty.call(
        ERROR_CODE_MAP,
        serverCode
      )
        ? ERROR_CODE_MAP[serverCode]
        : undefined;

    if (mappedError) {
      return mappedError;
    }

    // ======================================
    // NETWORK ERRORS
    // ======================================

    if (
      cause.code === "ECONNABORTED" ||
      cause.code === "ETIMEDOUT"
    ) {
      return POS_ERRORS.SERVER_TIMEOUT;
    }

    if (cause.code === "ERR_CANCELED") {
      return FALLBACK_ERRORS.CHECKOUT_INTERRUPTED;
    }

    if (
      cause.code === "ERR_NETWORK" ||
      !cause.response
    ) {
      return POS_ERRORS.INTERNET_DISCONNECTED;
    }

    // ======================================
    // HTTP STATUS ERRORS
    // ======================================

    switch (cause.response.status) {
      case 400:
      case 422:
        return FALLBACK_ERRORS.INVALID_ORDER;

      case 401:
        return FALLBACK_ERRORS.AUTHENTICATION;

      case 403:
        return FALLBACK_ERRORS.ACCESS_DENIED;

      case 404:
        return FALLBACK_ERRORS.SERVICE_UNAVAILABLE;

      case 408:
      case 504:
        return POS_ERRORS.SERVER_TIMEOUT;

      case 409:
        // A generic 409 does not necessarily
        // indicate an inventory conflict.
        return FALLBACK_ERRORS.ORDER_CONFLICT;

      case 429:
        return FALLBACK_ERRORS.TOO_MANY_REQUESTS;

      case 500:
      case 502:
        return FALLBACK_ERRORS.SERVER_ERROR;

      case 503:
        return FALLBACK_ERRORS.SERVICE_UNAVAILABLE;

      default:
        return FALLBACK_ERRORS.UNKNOWN_ERROR;
    }
  }

  // ========================================
  // EXISTING LOCAL CHECKOUT ERRORS
  // ========================================

  if (cause instanceof Error) {
    const message =
      cause.message.toLowerCase();

    if (
      message.includes(
        "previous result is unresolved"
      )
    ) {
      return FALLBACK_ERRORS.PREVIOUS_ORDER_PENDING;
    }

    if (
      message.includes(
        "only cash checkout is available"
      )
    ) {
      return FALLBACK_ERRORS.PAYMENT_UNAVAILABLE;
    }

    if (
      message ===
        "invalid cash amount or cart total." ||
      message ===
        "invalid checkout details or empty cart." ||
      message ===
        "invalid order quantities."
    ) {
      return FALLBACK_ERRORS.INVALID_CHECKOUT;
    }

    if (
      message.includes(
        "unexpected mock order response"
      ) ||
      message.includes(
        "unexpected server response"
      )
    ) {
      return FALLBACK_ERRORS.UNEXPECTED_RESPONSE;
    }
  }

  // Unknown errors must never be treated
  // as confirmed payment failures.

  return FALLBACK_ERRORS.UNKNOWN_ERROR;
}

// ==========================================
// PRINTER ERROR HANDLER
// ==========================================

export function getPrinterError(
  status: string
): CheckoutErrorDetails {
  const code = normalizeCode(status);

  switch (code) {
    case "DISCONNECTED":
    case "PRINTER_DISCONNECTED":
    case "NOT_CONNECTED":
      return POS_ERRORS.PRINTER_DISCONNECTED;

    case "OUT_OF_PAPER":
    case "PAPER_OUT":
    case "PRINTER_OUT_OF_PAPER":
      return POS_ERRORS.PRINTER_OUT_OF_PAPER;

    case "TIMEOUT":
    case "PRINT_TIMEOUT":
    case "RECEIPT_PRINTING_TIMEOUT":
      return POS_ERRORS.RECEIPT_PRINTING_TIMEOUT;

    default:
      return {
        title: "Receipt Printing Failed",

        message:
          "Verify printer status before reprinting the receipt.",

        requiresVerification: false,
      };
  }
}