import { describe, expect, it } from "vitest";
import { getPrinterStatusPresentation } from "./printerStatus";

describe("getPrinterStatusPresentation", () => {
  it.each([
    ["CONNECTED", true, "PRINTER_READY", "Ready", "ready"],
    ["DISCONNECTED", false, null, "Disconnected", "disconnected"],
    ["CONNECTED", true, "PRINTER_OFFLINE", "Disconnected", "disconnected"],
    ["CONNECTED", true, "PAPER_OUT", "Paper out", "warning"],
    ["CONNECTED", true, "COVER_OPEN", "Cover open", "warning"],
    ["CONNECTED", true, "PRINTING", "Printing", "warning"],
    ["CONNECTED", true, "PRINT_ERROR", "Printer warning", "warning"],
    ["CONNECTED", true, null, "Checking printer", "warning"],
    ["CONNECTING", false, null, "Connecting", "warning"],
  ] as const)(
    "maps %s/%s/%s to the correct badge",
    (connectionStatus, isOnline, printerStatus, label, tone) => {
      expect(
        getPrinterStatusPresentation(
          connectionStatus,
          isOnline,
          printerStatus,
        ),
      ).toEqual({ label, tone });
    },
  );
});
