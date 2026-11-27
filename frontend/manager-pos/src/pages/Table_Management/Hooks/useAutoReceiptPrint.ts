import { useCallback, useRef } from "react";

import { useBridgeHeartbeat } from "./useBridgeHeartbeat";

import {
  bridgeClient,
  isTauriRuntime,
} from "../../../lib/bridge/bridgeClient";

import {
  serializeReceiptForBridge,
} from "../../../lib/bridge/printPayload";

import {
  useNotification,
} from "../../../components/Notification/useNotification";

import type {
  ReceiptData,
} from "../Types/billing.types";

// ==========================================
// DAY 5 AFTERNOON TASK 1
// AUTOMATIC THERMAL RECEIPT PRINTING
// ==========================================

export function useAutoReceiptPrint() {
  const { printReceipt } =
    useBridgeHeartbeat(false);

  const {
    success,
    error,
    info,
  } = useNotification();

  // Prevent duplicate automatic print attempts.
  const attemptedOrders = useRef(
    new Set<string>()
  );

  const printConfirmedReceipt = useCallback(
    async (
      receipt: ReceiptData,
      checkoutStartedAt?: number
    ): Promise<void> => {
      // ======================================
      // DEVELOPMENT DEBUGGING
      // ======================================

      if (import.meta.env.DEV) {
        console.log(
          "[PRINT] Automatic receipt hook executed"
        );

        console.log(
          "[PRINT] Order ID:",
          receipt.orderId
        );
      }

      // ======================================
      // VALIDATE RECEIPT
      // ======================================

      if (
        !receipt.orderId ||
        receipt.items.length === 0
      ) {
        error(
          "Order confirmed, but receipt data is unavailable."
        );

        return;
      }

      // ======================================
      // DEMO ORDER PROTECTION
      // ======================================

      if (
        receipt.orderId
          .toUpperCase()
          .includes("DEMO-")
      ) {
        if (import.meta.env.DEV) {
          console.log(
            "[PRINT] Demo order - physical printing skipped"
          );
        }

        info(
          "Demo checkout completed. Physical printing skipped."
        );

        return;
      }

      // ======================================
      // CHECK TAURI ENVIRONMENT
      // ======================================

      if (!isTauriRuntime()) {
        if (import.meta.env.DEV) {
          console.log(
            "[PRINT] Browser environment detected"
          );
        }

        info(
          "Order confirmed. Thermal printing requires the URQR desktop application."
        );

        return;
      }

      // ======================================
      // PREVENT DUPLICATE PRINTING
      // ======================================

      if (
        attemptedOrders.current.has(
          receipt.orderId
        )
      ) {
        if (import.meta.env.DEV) {
          console.warn(
            "[PRINT] Duplicate automatic print prevented"
          );
        }

        return;
      }

      attemptedOrders.current.add(
        receipt.orderId
      );

      try {
        // ====================================
        // GET TENANT ID
        // ====================================

        const tenantId =
          localStorage.getItem("tenant_id");

        // ====================================
        // SERIALIZE RECEIPT
        // ====================================

        const request =
          serializeReceiptForBridge(
            receipt,
            tenantId
          );

        // ====================================
        // CONNECT PRINTER BRIDGE
        // ====================================

        if (import.meta.env.DEV) {
          console.log(
            "[PRINT] Connecting to URQR Bridge"
          );
        }

        await bridgeClient.connect();

        // ====================================
        // SEND PRINT REQUEST
        // ====================================

        if (import.meta.env.DEV) {
          console.log(
            "[PRINT] Sending automatic print request"
          );
        }

        const response = await printReceipt(
          {
            ...request,
            action: "print",
          },
          checkoutStartedAt
        );

        const status =
          response.status.trim().toUpperCase();

        if (import.meta.env.DEV) {
          console.log(
            "[PRINT] Bridge status:",
            status
          );

          console.log(
            "[PRINT] Request successful:",
            response.success
          );
        }

        // ====================================
        // PRINT REQUEST FAILURE
        // ====================================

        if (!response.success) {
          if (
            status === "TIMEOUT" ||
            status === "DISCONNECTED" ||
            status === "DUPLICATE_REQUEST"
          ) {
            error(
              "Order confirmed. Printing status is uncertain. Verify the printer before reprinting."
            );

            return;
          }

          error(
            `Order confirmed. Receipt printing failed: ${
              response.message ??
              response.status
            }. Check the printer before reprinting.`
          );

          return;
        }

        // ====================================
        // RECEIPT QUEUED
        // ====================================

        if (
          status === "SPOOLED" ||
          status === "PRINTING"
        ) {
          info(
            "Order confirmed. Receipt sent to the printer queue."
          );

          return;
        }

        // ====================================
        // RECEIPT PRINTED SUCCESSFULLY
        // ====================================

        if (status === "PRINTED") {
          success(
            "Receipt printed successfully."
          );

          return;
        }

        // Do not assume physical printing
        // for unknown successful statuses.

        info(
          `Receipt request accepted. Printer status: ${response.status}`
        );

      } catch (cause) {
        // ====================================
        // PRINTER CONNECTION ERROR
        // ====================================

        const message =
          cause instanceof Error
            ? cause.message
            : "Unknown printer bridge error";

        if (import.meta.env.DEV) {
          console.error(
            "[PRINT] Printer bridge error:",
            message
          );
        }

        // Printing failure does not change
        // the confirmed payment result.

        error(
          `Order confirmed. Receipt printing could not be verified: ${message}`
        );
      }
    },
    [
      printReceipt,
      success,
      error,
      info,
    ]
  );

  return {
    printConfirmedReceipt,
  };
}