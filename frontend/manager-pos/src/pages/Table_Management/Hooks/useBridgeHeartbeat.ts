import { useState, useEffect } from "react";
import {
  bridgeClient,
  type BridgeState,
  type BridgePrintRequest,
  type BridgePrintResponse,
} from "../../../lib/bridgeClient";

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
      bridgeClient.connect();
    }

    return () => {
      unsubscribe();
    };
  }, [autoConnect]);

  const printReceipt = async (req: BridgePrintRequest): Promise<BridgePrintResponse> => {
    return bridgeClient.printReceipt(req);
  };

  const manualPing = () => {
    bridgeClient.sendPing();
  };

  const reconnect = () => {
    bridgeClient.disconnect();
    bridgeClient.connect();
  };

  return {
    status: bridgeState.status,
    isOnline: bridgeState.isOnline,
    latencyMs: bridgeState.latencyMs,
    lastHeartbeat: bridgeState.lastHeartbeat,
    reconnectAttempts: bridgeState.reconnectAttempts,
    lastMessage: bridgeState.lastMessage,
    printReceipt,
    manualPing,
    reconnect,
  };
}
