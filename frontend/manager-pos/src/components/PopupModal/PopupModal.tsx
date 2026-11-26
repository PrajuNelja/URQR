import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
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

export const PopupModal = ({
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
}: PopupModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    } else {
      panel.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }

      if (e.key === "Tab") {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else onClose();
  };

  const showFooter = footer !== undefined || onConfirm !== undefined;

  const modalContent = (
    <div className={MODAL_BACKDROP} onClick={handleBackdrop} role="presentation">
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative ${MODAL_PANEL_BASE} ${MODAL_SIZES[size]} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-label={title ? undefined : "Dialog"}
      >
        {/* If there is a title, show the header */}
        {title && (
          <div className={MODAL_HEADER}>
            <h2 id="modal-title" className={MODAL_TITLE}>
              {title}
            </h2>
          </div>
        )}

        {/* Absolute positioned Close Button for all cases */}
        {!hideCloseButton && (
          <button
            type="button"
            className={`${MODAL_CLOSE_BTN} absolute right-4 top-4`}
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
          >
            <X size={24} strokeWidth={2} />
          </button>
        )}

        {/* Add padding-top if no title, so content doesn't overlap the X */}
        <div className={`${MODAL_BODY} ${!title ? "pt-12" : ""}`}>
          {children}
        </div>

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

  return createPortal(modalContent, document.body);
};

export default PopupModal;