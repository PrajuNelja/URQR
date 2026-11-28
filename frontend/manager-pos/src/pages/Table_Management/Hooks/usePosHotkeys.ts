import { useEffect } from "react";

export interface PosHotkeyActions {
  onHelp?: () => void;

  onSearchFocus?: () => void;

  onNextCategory?: () => void;

  // F4: Quick Cash Pay
  onQuickCashPay?: () => void;

  // Escape: Clear active cart
  onClearCart?: () => void;

  onRefreshCatalog?: () => void;

  onNoteFocus?: () => void;

  onSelectCash?: () => void;

  onSelectUPI?: () => void;

  onSelectCard?: () => void;

  onCheckout?: () => void;

  onToggleFullscreen?: () => void;

  onPrintReceipt?: () => void;

  onEscape?: () => void;
}

// ==========================================
// CHECK WHETHER A MODAL IS OPEN
// ==========================================

function hasOpenDialog(): boolean {
  return Boolean(
    document.querySelector(
      '[role="dialog"]:not([data-state="closed"]),' +
      '[role="alertdialog"]:not([data-state="closed"]),' +
      "dialog[open]"
    )
  );
}

// ==========================================
// POS KEYBOARD SHORTCUT HOOK
// ==========================================

export function usePosHotkeys(
  actions: PosHotkeyActions,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      // Ignore keyboard events already handled
      // by another component.
      if (event.defaultPrevented) {
        return;
      }

      // Prevent repeated shortcut execution.
      if (
        event.repeat ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      // Existing modal components should handle
      // their own keyboard events.
      if (hasOpenDialog()) {
        return;
      }

      const key = event.key;

      switch (key) {
        // ==================================
        // F1 - HELP
        // ==================================

        case "F1":
          if (actions.onHelp) {
            event.preventDefault();

            actions.onHelp();
          }

          break;

        // ==================================
        // F2 - FOCUS SEARCH
        // ==================================

        case "F2":
          if (actions.onSearchFocus) {
            event.preventDefault();

            actions.onSearchFocus();
          }

          break;

        // ==================================
        // F3 - NEXT CATEGORY
        // ==================================

        case "F3":
          if (actions.onNextCategory) {
            event.preventDefault();

            actions.onNextCategory();
          }

          break;

        // ==================================
        // F4 - QUICK CASH PAY
        // ==================================

        case "F4":
          if (actions.onQuickCashPay) {
            event.preventDefault();

            actions.onQuickCashPay();
          }

          break;

        // ==================================
        // F5 - REFRESH CATALOG
        // ==================================

        case "F5":
          if (actions.onRefreshCatalog) {
            event.preventDefault();

            actions.onRefreshCatalog();
          }

          break;

        // ==================================
        // F6 - FOCUS ORDER NOTE
        // ==================================

        case "F6":
          if (actions.onNoteFocus) {
            event.preventDefault();

            actions.onNoteFocus();
          }

          break;

        // ==================================
        // F7 - SELECT CASH
        // ==================================

        case "F7":
          if (actions.onSelectCash) {
            event.preventDefault();

            actions.onSelectCash();
          }

          break;

        // ==================================
        // F8 - SELECT UPI
        // ==================================

        case "F8":
          if (actions.onSelectUPI) {
            event.preventDefault();

            actions.onSelectUPI();
          }

          break;

        // ==================================
        // F9 - SELECT CARD
        // ==================================

        case "F9":
          if (actions.onSelectCard) {
            event.preventDefault();

            actions.onSelectCard();
          }

          break;

        // ==================================
        // F10 - OPEN CHECKOUT
        // ==================================

        case "F10":
          if (actions.onCheckout) {
            event.preventDefault();

            actions.onCheckout();
          }

          break;

        // ==================================
        // F11 - FULLSCREEN
        // ==================================

        case "F11":
          if (actions.onToggleFullscreen) {
            event.preventDefault();

            actions.onToggleFullscreen();
          }

          break;

        // ==================================
        // F12 - PRINT RECEIPT
        // ==================================

        case "F12":
          if (actions.onPrintReceipt) {
            event.preventDefault();

            actions.onPrintReceipt();
          }

          break;

        // ==================================
        // ESC - CLEAR ACTIVE CART
        // ==================================

        case "Escape":
          if (actions.onEscape) {
            event.preventDefault();

            actions.onEscape();
          } else if (actions.onClearCart) {
            event.preventDefault();

            actions.onClearCart();
          }

          break;

        default:
          break;
      }
    };

    // Register keyboard event listener.
    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    // Remove listener when component unmounts.
    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [actions, enabled]);
}