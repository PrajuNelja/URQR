import { useState, useEffect } from "react";
import {
  bridgeClient,
  isTauriRuntime,
  type BridgeState,
  type BridgePrintRequest,
  type BridgePrintResponse,
} from "../../../lib/bridge/bridgeClient";

/**
 * useBridgeHeartbeat — React hook managing WebSocket connection to the local Go URQR-Bridge.
 * Monitors bridge health with a 3-second heartbeat ping.
 */
export function useBridgeHeartbeat(autoConnect = true) {
  const [bridgeState, setBridgeState] = useState<BridgeState>(bridgeClient.getState());

  useEffect(() => {
    const unsubscribe = bridgeClient.subscribe((state) => {
      setBridgeState(state);
    });

    if (autoConnect) {
      if (isTauriRuntime()) {
        void bridgeClient.connect().catch((error: unknown) => {
          console.error("Could not connect to the local URQR Bridge", error);
        });
      }
    }

    return () => {
      unsubscribe();
    };
  }, [autoConnect]);

  const printReceipt = (
    req: BridgePrintRequest,
    checkoutStartedAt?: number,
  ): Promise<BridgePrintResponse> => {
    return bridgeClient.printReceipt(req, checkoutStartedAt);
  };

  const manualPing = () => {
    bridgeClient.sendPing();
  };

  const reconnect = () => {
    bridgeClient.disconnect();
    void bridgeClient.connect().catch((error: unknown) => {
      console.error("Could not reconnect to the local URQR Bridge", error);
    });
  };

  return {
    status: bridgeState.status,
    isOnline: bridgeState.isOnline,
    printerStatus: bridgeState.printerStatus,
    latencyMs: bridgeState.latencyMs,
    lastHeartbeat: bridgeState.lastHeartbeat,
    reconnectAttempts: bridgeState.reconnectAttempts,
    lastMessage: bridgeState.lastMessage,
    printReceipt,
    manualPing,
    reconnect,
  };
}
