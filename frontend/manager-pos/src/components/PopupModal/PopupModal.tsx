// src/components/PopupModal/PopupModal.tsx

// 1. Imports
import React from "react";
import { X } from "lucide-react";
import { popupModalConfig } from "./PopupModal.config";
import { Button } from "../Buttons/Button"; // Using our reusable Button!
import type { PopupModalProps } from "./PopupModal.types";

// 2. Component
export const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
  isDanger = false,
}) => {
  // 3. Handlers
  if (!isOpen) return null;

  // 4. Render Variables

  // 5. Export / Return
  return (
    <div className={popupModalConfig.overlay}>
      <div className={popupModalConfig.container}>
        
        {/* Header */}
        <div className={popupModalConfig.header}>
          <h2 className={popupModalConfig.title}>{title}</h2>
          <button 
            onClick={onClose} 
            className={popupModalConfig.closeBtn}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={popupModalConfig.body}>
          {children}
        </div>

        {/* Footer */}
        <div className={popupModalConfig.footer}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
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
        </div>

      </div>
    </div>
  );
};