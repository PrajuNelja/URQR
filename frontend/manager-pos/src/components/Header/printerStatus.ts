import type {
  BridgeConnectionStatus,
  BridgePrinterStatus,
} from "../../lib/bridge/bridgeClient";

export type PrinterStatusTone = "ready" | "disconnected" | "warning";

export interface PrinterStatusPresentation {
  label: string;
  tone: PrinterStatusTone;
}

export function getPrinterStatusPresentation(
  connectionStatus: BridgeConnectionStatus,
  isBridgeOnline: boolean,
  printerStatus: BridgePrinterStatus | null,
): PrinterStatusPresentation {
  if (connectionStatus === "CONNECTING") {
    return { label: "Connecting", tone: "warning" };
  }
  if (
    !isBridgeOnline ||
    connectionStatus === "DISCONNECTED" ||
    connectionStatus === "ERROR" ||
    printerStatus === "PRINTER_OFFLINE"
  ) {
    return { label: "Disconnected", tone: "disconnected" };
  }
  if (printerStatus === "PRINTER_READY") {
    return { label: "Ready", tone: "ready" };
  }
  if (printerStatus === "PAPER_OUT") {
    return { label: "Paper out", tone: "warning" };
  }
  if (printerStatus === "COVER_OPEN") {
    return { label: "Cover open", tone: "warning" };
  }
  if (printerStatus === "PRINTING") {
    return { label: "Printing", tone: "warning" };
  }
  if (printerStatus === "PRINT_ERROR") {
    return { label: "Printer warning", tone: "warning" };
  }
  return { label: "Checking printer", tone: "warning" };
}
