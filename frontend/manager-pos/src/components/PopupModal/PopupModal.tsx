import { useEffect, useId, useRef } from "react";
import type { MouseEvent } from "react";
import { X } from "lucide-react";
import type { PopupModalProps } from "./PopupModal.types";
import {
  MODAL_BACKDROP,
  MODAL_PANEL_BASE,
  MODAL_SIZES,
  MODAL_HEADER,
  MODAL_TITLE,
  MODAL_CLOSE_BTN,
  MODAL_BODY,
  MODAL_FOOTER,
} from "./PopupModal.config";
import { Button } from "../Buttons/Button";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Same public API as existing modal, with focus trap + focus restoration. */
export function PopupModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false,
  isLoading = false,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = "",
  hideCloseButton = false,
}: PopupModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const previous = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () => Array.from(
      panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
    ).filter((el) => el.getClientRects().length > 0);

    const animationFrame = window.requestAnimationFrame(() => {
      (getFocusable()[0] ?? panel)?.focus();
    });

    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeys);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeys);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else onClose();
  };

  const showFooter = footer !== undefined || onConfirm !== undefined;

  return (
    <div className={MODAL_BACKDROP} onClick={handleBackdrop} role="presentation">
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`${MODAL_PANEL_BASE} ${MODAL_SIZES[size]} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
      >
        {(title || !hideCloseButton) && (
          <div className={MODAL_HEADER}>
            {title && <h2 id={titleId} className={MODAL_TITLE}>{title}</h2>}
            {!hideCloseButton && (
              <button
                type="button"
                className={MODAL_CLOSE_BTN}
                onClick={onClose}
                aria-label="Close modal"
                title="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className={MODAL_BODY}>{children}</div>
        {showFooter && (
          <div className={MODAL_FOOTER}>
            {footer ?? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  {cancelText}
                </Button>
                {onConfirm && (
                  <Button
                    variant={isDanger ? "danger" : "primary"}
                    onClick={onConfirm}
                    isLoading={isLoading}
                  >
                    {confirmText}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PopupModal;
