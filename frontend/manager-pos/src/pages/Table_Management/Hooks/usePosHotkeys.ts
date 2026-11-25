import { useEffect } from "react";

export interface PosHotkeyActions {
  onHelp?: () => void;           // F1: Hotkey cheat sheet / help
  onSearchFocus?: () => void;    // F2: Focus dish search input
  onNextCategory?: () => void;   // F3: Next category filter
  onClearCart?: () => void;      // F4: Clear active cart
  onRefreshCatalog?: () => void; // F5: Invalidate/refresh catalog query
  onNoteFocus?: () => void;      // F6: Focus order note input
  onSelectCash?: () => void;     // F7: Select Cash payment
  onSelectUPI?: () => void;      // F8: Select UPI payment
  onSelectCard?: () => void;     // F9: Select Card payment
  onCheckout?: () => void;       // F10: 1-Tap Checkout / Complete payment
  onToggleFullscreen?: () => void; // F11: Fullscreen POS toggle
  onPrintReceipt?: () => void;   // F12: Open receipt / print modal
  onEscape?: () => void;         // Escape: Dismiss modal / blur
}

/**
 * Fast keyboard shortcut event listener skeleton for standard POS function keys (F1-F12).
 * Prevents default browser actions (such as F1 help, F3 find, F5 reload, F11/F12)
 * when POS handlers are defined.
 */
export function usePosHotkeys(actions: PosHotkeyActions, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      switch (key) {
        case "F1":
          if (actions.onHelp) {
            event.preventDefault();
            actions.onHelp();
          }
          break;
        case "F2":
          if (actions.onSearchFocus) {
            event.preventDefault();
            actions.onSearchFocus();
          }
          break;
        case "F3":
          if (actions.onNextCategory) {
            event.preventDefault();
            actions.onNextCategory();
          }
          break;
        case "F4":
          if (actions.onClearCart) {
            event.preventDefault();
            actions.onClearCart();
          }
          break;
        case "F5":
          if (actions.onRefreshCatalog) {
            event.preventDefault();
            actions.onRefreshCatalog();
          }
          break;
        case "F6":
          if (actions.onNoteFocus) {
            event.preventDefault();
            actions.onNoteFocus();
          }
          break;
        case "F7":
          if (actions.onSelectCash) {
            event.preventDefault();
            actions.onSelectCash();
          }
          break;
        case "F8":
          if (actions.onSelectUPI) {
            event.preventDefault();
            actions.onSelectUPI();
          }
          break;
        case "F9":
          if (actions.onSelectCard) {
            event.preventDefault();
            actions.onSelectCard();
          }
          break;
        case "F10":
          if (actions.onCheckout) {
            event.preventDefault();
            actions.onCheckout();
          }
          break;
        case "F11":
          if (actions.onToggleFullscreen) {
            event.preventDefault();
            actions.onToggleFullscreen();
          }
          break;
        case "F12":
          if (actions.onPrintReceipt) {
            event.preventDefault();
            actions.onPrintReceipt();
          }
          break;
        case "Escape":
          if (actions.onEscape) {
            event.preventDefault();
            actions.onEscape();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions, enabled]);
}
