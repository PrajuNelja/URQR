import { useState, useEffect, useCallback } from "react";

export interface TauriWindowState {
  isFullscreen: boolean;
  isTauriContainer: boolean;
}

interface TauriGlobal {
  __TAURI__?: {
    window?: {
      getCurrentWindow: () => {
        minimize: () => Promise<void>;
        toggleMaximize: () => Promise<void>;
        close: () => Promise<void>;
      };
    };
  };
}

/**
 * useTauriWindow — Manages desktop window controls, fullscreen toggle,
 * and POS kiosk-mode parameters in Tauri v2 and modern browsers.
 */
export function useTauriWindow() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTauriContainer] = useState<boolean>(() => {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not permitted or cancelled
    }
  }, []);

  const minimizeWindow = useCallback(async () => {
    const tauriWindow = (window as unknown as TauriGlobal).__TAURI__?.window;
    if (tauriWindow) {
      try {
        await tauriWindow.getCurrentWindow().minimize();
      } catch {
        // Fallback
      }
    }
  }, []);

  const maximizeWindow = useCallback(async () => {
    const tauriWindow = (window as unknown as TauriGlobal).__TAURI__?.window;
    if (tauriWindow) {
      try {
        await tauriWindow.getCurrentWindow().toggleMaximize();
      } catch {
        // Fallback
      }
    }
  }, []);

  const closeWindow = useCallback(async () => {
    const tauriWindow = (window as unknown as TauriGlobal).__TAURI__?.window;
    if (tauriWindow) {
      try {
        await tauriWindow.getCurrentWindow().close();
      } catch {
        // Fallback
      }
    }
  }, []);

  return {
    isFullscreen,
    isTauriContainer,
    toggleFullscreen,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
  };
}
