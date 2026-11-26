import React from "react";
import {
  AlertTriangle,
  Maximize2,
  Minimize2,
  Minus,
  Printer,
  Square,
  WifiOff,
  X,
} from "lucide-react";
import { useTauriWindow } from "../../pages/Table_Management/Hooks/useTauriWindow";
import { useBridgeHeartbeat } from "../../pages/Table_Management/Hooks/useBridgeHeartbeat";
import { getPrinterStatusPresentation } from "./printerStatus";

export interface DesktopWindowControlsProps {
  className?: string;
  showBridgePill?: boolean;
}

/**
 * DesktopWindowControls — Desktop window controls and POS kiosk-mode toolbar.
 * Supports:
 * 1. Bridge heartbeat status pill (monitoring ws://localhost:9101).
 * 2. Fullscreen POS kiosk mode toggle.
 * 3. Desktop minimize, maximize/restore, and close buttons in Tauri v2.
 */
export const DesktopWindowControls: React.FC<DesktopWindowControlsProps> = ({
  className = "",
  showBridgePill = true,
}) => {
  const { isFullscreen, isTauriContainer, toggleFullscreen, minimizeWindow, maximizeWindow, closeWindow } =
    useTauriWindow();
  const { isOnline, latencyMs, status, printerStatus } =
    useBridgeHeartbeat();
  const presentation = getPrinterStatusPresentation(
    status,
    isOnline,
    printerStatus,
  );
  const PrinterIcon =
    presentation.tone === "ready"
      ? Printer
      : presentation.tone === "disconnected"
        ? WifiOff
        : AlertTriangle;
  const statusColor =
    presentation.tone === "ready"
      ? "bg-[#d9eedd] text-[#2f7a45] border-[#b7dfbd]"
      : presentation.tone === "disconnected"
        ? "bg-[#fbd9d6] text-[#b3402a] border-[#f5c2be]"
        : "bg-[#fef3c7] text-[#92400e] border-[#fde68a]";

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Bridge Heartbeat Status Pill */}
      {showBridgePill && (
        <div
          title={
            `Printer ${presentation.label} (URQR-Bridge ${status})${
              isOnline ? ` - Latency: ${latencyMs}ms` : ""
            }`
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${statusColor}`}
        >
          <PrinterIcon size={12} className="shrink-0" />
          <span>
            Printer: {presentation.label}
            {isOnline ? ` (${latencyMs}ms)` : ""}
          </span>
        </div>
      )}

      {/* Fullscreen Kiosk Mode Toggle */}
      <button
        type="button"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Kiosk Mode (F11)" : "Enter Fullscreen Kiosk Mode (F11)"}
        className="h-8 px-2.5 flex items-center gap-1 rounded-md text-xs font-semibold text-[#30261d] border border-[#dfcdb4] bg-white hover:bg-[#e9ddcc] transition-colors"
        aria-label="Toggle Fullscreen Kiosk"
      >
        {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        <span className="hidden sm:inline">{isFullscreen ? "Exit Kiosk" : "Kiosk"}</span>
      </button>

      {/* Desktop Window Controls (Tauri v2 Container) */}
      {isTauriContainer && (
        <div className="flex items-center gap-1 pl-1 border-l border-[#dfcdb4]">
          <button
            type="button"
            onClick={minimizeWindow}
            title="Minimize"
            className="w-7 h-7 flex items-center justify-center rounded text-[#705e4b] hover:bg-[#e9ddcc] transition-colors"
            aria-label="Minimize Window"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={maximizeWindow}
            title="Maximize / Restore"
            className="w-7 h-7 flex items-center justify-center rounded text-[#705e4b] hover:bg-[#e9ddcc] transition-colors"
            aria-label="Maximize Window"
          >
            <Square size={11} />
          </button>
          <button
            type="button"
            onClick={closeWindow}
            title="Close POS"
            className="w-7 h-7 flex items-center justify-center rounded text-[#b3402a] hover:bg-[#fbd9d6] transition-colors"
            aria-label="Close Window"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DesktopWindowControls;
