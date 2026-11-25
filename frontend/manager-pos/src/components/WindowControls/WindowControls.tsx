import { useEffect, useState } from "react";
import { Expand, Minimize, Minimize2, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  bridgeClient,
  isTauriRuntime,
} from "../../lib/bridge/bridgeClient";
import { getPrinterStatusPresentation } from "../Header/printerStatus";

function WindowControls() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bridgeState, setBridgeState] = useState(bridgeClient.getState());
  const printerPresentation = getPrinterStatusPresentation(
    bridgeState.status,
    bridgeState.isOnline,
    bridgeState.printerStatus,
  );

  useEffect(() => {
    if (!isTauriRuntime()) {
      return;
    }

    const unsubscribeStatus = bridgeClient.subscribe(setBridgeState);
    void getCurrentWindow()
      .isFullscreen()
      .then(setIsFullscreen)
      .catch((error: unknown) => {
        console.error("Could not read Tauri window state", error);
      });

    return unsubscribeStatus;
  }, []);

  if (!isTauriRuntime()) {
    return null;
  }

  const runWindowAction = async (
    action: () => Promise<void>,
    actionName: string,
  ) => {
    try {
      await action();
    } catch (error) {
      console.error(`Could not ${actionName} the Tauri window`, error);
    }
  };

  const toggleFullscreen = async () => {
    const nextFullscreen = !isFullscreen;
    try {
      await getCurrentWindow().setFullscreen(nextFullscreen);
      setIsFullscreen(nextFullscreen);
    } catch (error) {
      console.error("Could not toggle Tauri fullscreen mode", error);
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="flex h-10 items-center justify-between border-b border-primary-dark/20 bg-primary-dark px-3 text-on-primary select-none"
    >
      <div data-tauri-drag-region className="flex items-center gap-4">
        <span
          data-tauri-drag-region
          className="text-sm font-semibold tracking-wide"
        >
          URQR Manager POS
        </span>
        <span
          aria-live="polite"
          className={`flex items-center gap-2 text-xs ${
            printerPresentation.tone === "ready"
              ? "text-emerald-300"
              : printerPresentation.tone === "disconnected"
                ? "text-red-300"
                : "text-amber-300"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              printerPresentation.tone === "ready"
                ? "bg-emerald-400"
                : printerPresentation.tone === "disconnected"
                  ? "bg-red-400"
                  : "bg-amber-400"
          className="flex items-center gap-2 text-xs font-medium text-on-primary/80"
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full transition-colors ${
              bridgeStatus === "connected"
                ? "bg-success"
                : bridgeStatus === "connecting"
                  ? "bg-warning"
                  : "bg-error"
            }`}
          />
          Printer {printerPresentation.label.toLowerCase()}
        </span>
      </div>
      
      <div className="flex h-full items-center gap-1">
        <button
          type="button"
          aria-label="Minimize window"
          title="Minimize"
          className="rounded-md p-2 outline-none transition-colors hover:bg-on-primary/10 focus-visible:ring-2 focus-visible:ring-on-primary"
          onClick={() =>
            void runWindowAction(
              () => getCurrentWindow().minimize(),
              "minimize",
            )
          }
        >
          <Minimize size={16} aria-hidden="true" />
        </button>
        
        <button
          type="button"
          aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
          title={isFullscreen ? "Exit full screen" : "Full screen"}
          className="rounded-md p-2 outline-none transition-colors hover:bg-on-primary/10 focus-visible:ring-2 focus-visible:ring-on-primary"
          onClick={() => void toggleFullscreen()}
        >
          {isFullscreen ? (
            <Minimize2 size={16} aria-hidden="true" />
          ) : (
            <Expand size={16} aria-hidden="true" />
          )}
        </button>
        
        <button
          type="button"
          aria-label="Close window"
          title="Close"
          className="rounded-md p-2 outline-none transition-colors hover:bg-error focus-visible:ring-2 focus-visible:ring-on-primary"
          onClick={() =>
            void runWindowAction(() => getCurrentWindow().close(), "close")
          }
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default WindowControls;