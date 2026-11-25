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
      className="flex h-10 items-center justify-between border-b border-white/10 bg-slate-950 px-3 text-white"
    >
      <div data-tauri-drag-region className="flex items-center gap-4">
        <span
          data-tauri-drag-region
          className="select-none text-sm font-semibold"
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
          className="rounded p-2 hover:bg-white/10"
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
          className="rounded p-2 hover:bg-white/10"
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
          className="rounded p-2 hover:bg-red-600"
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
