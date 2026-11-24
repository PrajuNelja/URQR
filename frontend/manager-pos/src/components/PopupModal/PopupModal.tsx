
import { useEffect } from "react";
import { createPortal } from "react-dom";
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

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Don't render when closed
  if (!isOpen) return null;

  // Backdrop click handler
  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget &&
      closeOnBackdrop
    ) {
      onClose();
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const showFooter =
    footer !== undefined || onConfirm !== undefined;

  const modalContent = (
    <div
      className={MODAL_BACKDROP}
      onClick={handleBackdrop}
      role="presentation"
    >
      <div
        className={`${MODAL_PANEL_BASE} ${MODAL_SIZES[size]} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Modal Header */}
        {(title || !hideCloseButton) && (
          <div className={MODAL_HEADER}>
            {title && (
              <h2
                id="modal-title"
                className={MODAL_TITLE}
              >
                {title}
              </h2>
            )}

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

        {/* Modal Body */}
        <div className={MODAL_BODY}>
          {children}
        </div>

        {/* Modal Footer */}
        {showFooter && (
          <div className={MODAL_FOOTER}>
            {footer ?? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
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

  // Render modal outside parent stacking contexts
  return createPortal(
    modalContent,
    document.body
  );
};

export default PopupModal;
