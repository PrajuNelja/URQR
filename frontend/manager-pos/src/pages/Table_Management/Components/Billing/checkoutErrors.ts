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
// CUSTOM CHECKOUT ERROR
// ==========================================

export class CheckoutError extends Error {
  public readonly details: CheckoutErrorDetails;

  constructor(details: CheckoutErrorDetails) {
    super(details.message);

    this.name = "CheckoutError";
    this.details = details;
  }
}

// ==========================================
// BACKEND ERROR RESPONSE
// ==========================================

interface BackendError {
  code?: string;
  message?: string;
}

// ==========================================
// NETWORK CONNECTION CHECK
// ==========================================

function isNetworkOnline(): boolean {
  return typeof navigator === "undefined"
    ? true
    : navigator.onLine;
}

// ==========================================
// CENTRALIZED CHECKOUT ERROR HANDLER
// ==========================================

export function getCheckoutError(
  error: unknown
): CheckoutErrorDetails {

  // ========================================
  // 1. CUSTOM CHECKOUT ERRORS
  // ========================================

  if (error instanceof CheckoutError) {
    return error.details;
  }

  // ========================================
  // 2. AXIOS API ERRORS
  // ========================================

  if (isAxiosError<BackendError>(error)) {
    const status = error.response?.status;

    const responseData = error.response?.data;

    const code =
      typeof responseData?.code === "string"
        ? responseData.code.toUpperCase()
        : undefined;

    // ======================================
    // REQUEST TIMEOUT
    // ======================================

    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      status === 408 ||
      status === 504
    ) {
      return {
        title: "Confirmation Timeout",

        message:
          "The server did not confirm your order in time. Verify the previous transaction before retrying.",

        requiresVerification: true,
      };
    }

    // ======================================
    // REQUEST CANCELLED
    // ======================================

    if (error.code === "ERR_CANCELED") {
      return {
        title: "Checkout Interrupted",

        message:
          "The checkout request was interrupted. Your payment status could not be confirmed.",

        requiresVerification: true,
      };
    }

    // ======================================
    // NETWORK CONNECTION ERROR
    // ======================================

    if (!error.response) {
      const online = isNetworkOnline();

      return {
        title: online
          ? "Connection Interrupted"
          : "Internet Connection Lost",

        message: online
          ? "Unable to communicate with the checkout server. Verify the previous transaction before retrying."
          : "Your internet connection was lost during checkout. Reconnect and verify the payment status.",

        requiresVerification: true,
      };
    }

    // ======================================
    // BACKEND-SPECIFIC ERROR CODES
    // ======================================

    switch (code) {
      case "OUT_OF_STOCK":
      case "INSUFFICIENT_STOCK":
        return {
          title: "Insufficient Stock",

          message:
            "One or more selected products are no longer available. Verify the order before modifying the cart.",

          requiresVerification: true,
        };

      case "PAYMENT_DECLINED":
        return {
          title: "Payment Declined",

          message:
            "The server reported that the payment was declined. Verify the transaction before retrying.",

          requiresVerification: true,
        };

      case "DUPLICATE_ORDER":
      case "IDEMPOTENCY_CONFLICT":
        return {
          title: "Duplicate Order Detected",

          message:
            "A matching or conflicting order request already exists. Verify the previous transaction.",

          requiresVerification: true,
        };

      case "ORDER_PENDING":
      case "PAYMENT_PENDING":
        return {
          title: "Payment Confirmation Pending",

          message:
            "The previous transaction is still awaiting confirmation. Do not submit another payment.",

          requiresVerification: true,
        };
    }

    // ======================================
    // HTTP STATUS CODE HANDLING
    // ======================================

    switch (status) {
      // INVALID REQUEST

      case 400:
      case 422:
        return {
          title: "Invalid Order Details",

          message:
            "The server rejected the order details. Verify the cart and payment information.",

          requiresVerification: true,
        };

      // AUTHENTICATION REQUIRED

      case 401:
        return {
          title: "Authentication Required",

          message:
            "Your session may have expired. Verify the previous transaction before signing in again.",

          requiresVerification: true,
        };

      // PERMISSION DENIED

      case 403:
        return {
          title: "Access Denied",

          message:
            "You do not have permission to complete this transaction. Contact your administrator.",

          requiresVerification: true,
        };

      // ENDPOINT NOT FOUND

      case 404:
        return {
          title: "Checkout Service Unavailable",

          message:
            "The checkout endpoint could not be found. Contact the technical support team.",

          requiresVerification: true,
        };

      // ORDER CONFLICT

      case 409:
        return {
          title: "Order Conflict",

          message:
            "A conflicting order or transaction was detected. Verify the previous order status.",

          requiresVerification: true,
        };

      // RATE LIMIT

      case 429:
        return {
          title: "Too Many Requests",

          message:
            "The server is receiving too many requests. Do not repeatedly submit payment.",

          requiresVerification: true,
        };

      // INTERNAL SERVER ERROR

      case 500:
        return {
          title: "Server Error",

          message:
            "The checkout server encountered an internal error. Your order confirmation is uncertain.",

          requiresVerification: true,
        };

      // BAD GATEWAY

      case 502:
        return {
          title: "Server Communication Error",

          message:
            "The checkout server received an invalid response from another service. Verify your transaction.",

          requiresVerification: true,
        };

      // SERVICE UNAVAILABLE

      case 503:
        return {
          title: "Service Temporarily Unavailable",

          message:
            "The checkout service is currently unavailable. Verify the previous transaction before retrying.",

          requiresVerification: true,
        };
    }

    // ======================================
    // OTHER SERVER ERRORS
    // ======================================

    if (
      typeof status === "number" &&
      status >= 500
    ) {
      return {
        title: "Server Error",

        message:
          "The server could not confirm your order. Verify your transaction before retrying.",

        requiresVerification: true,
      };
    }

    // ======================================
    // OTHER HTTP ERRORS
    // ======================================

    return {
      title: "Checkout Request Unsuccessful",

      message:
        "The checkout request was not confirmed. Verify your transaction before retrying.",

      requiresVerification: true,
    };
  }

  // ========================================
  // 3. BILLING VALIDATION ERRORS
  // ========================================

  if (error instanceof Error) {
    const message = error.message.trim();

    const normalizedMessage =
      message.toLowerCase();

    // ======================================
    // PREVIOUS UNRESOLVED TRANSACTION
    // ======================================

    if (
      normalizedMessage.includes(
        "previous result is unresolved"
      )
    ) {
      return {
        title: "Previous Order Pending",

        message:
          "The previous transaction is unresolved. Verify its status and use the original cart and cash amount if retrying.",

        requiresVerification: true,
      };
    }

    // ======================================
    // INVALID CHECKOUT DETAILS
    // ======================================

    if (
      message ===
        "Invalid checkout details or empty cart." ||
      message ===
        "Invalid cash amount or cart total." ||
      message ===
        "Invalid order quantities."
    ) {
      return {
        title: "Invalid Checkout Details",

        message,

        requiresVerification: false,
      };
    }

    // ======================================
    // UNSUPPORTED PAYMENT METHOD
    // ======================================

    if (
      normalizedMessage.includes(
        "only cash checkout"
      )
    ) {
      return {
        title: "Payment Method Unavailable",

        message:
          "Only Cash payment is currently supported. Card and UPI integration are not available.",

        requiresVerification: false,
      };
    }

    // ======================================
    // LIVE CHECKOUT DISABLED
    // ======================================

    if (
      normalizedMessage.includes(
        "live checkout is blocked"
      )
    ) {
      return {
        title: "Live Checkout Unavailable",

        message:
          "Live payment integration is not enabled. Only development checkout is currently supported.",

        requiresVerification: false,
      };
    }

    // ======================================
    // UNEXPECTED API RESPONSE
    // ======================================

    if (
      normalizedMessage.includes(
        "unexpected mock order response"
      )
    ) {
      return {
        title: "Unexpected Server Response",

        message:
          "The server returned an unexpected order response. Payment confirmation could not be verified.",

        requiresVerification: true,
      };
    }

    // ======================================
    // ORDER CONFIRMATION UNSUCCESSFUL
    // ======================================

    if (
      normalizedMessage.includes(
        "order confirmation was not completed"
      )
    ) {
      return {
        title: "Order Confirmation Pending",

        message:
          "The order has not been confirmed. Verify the previous transaction before retrying.",

        requiresVerification: true,
      };
    }
  }

  // ========================================
  // 4. UNKNOWN CHECKOUT ERROR
  // ========================================

  return {
    title: "Order Confirmation Unavailable",

    message:
      "Unable to confirm the payment status. Verify the previous transaction before retrying.",

    requiresVerification: true,
  };
}