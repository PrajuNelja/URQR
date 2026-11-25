// src/components/PopupModal/PopupModal.types.ts
import type { ReactNode } from "react";

export type PopupModalSize = "sm" | "md" | "lg" | "xl";

export interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isDanger?: boolean;
  isLoading?: boolean;
  size?: PopupModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  hideCloseButton?: boolean;

  // ── NEW: Session Timeout Props ──
  variant?: "default" | "timeout";
  onExtendSession?: () => void;
  onLogout?: () => void;
  timeoutSeconds?: number;
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptProps {
  business: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  orderId: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashCollected?: number;
  change?: number;
  status?: string;
  isReprint?: boolean;
  reprintedAt?: string;
  currency?: string;
  className?: string;
  variant?:string;
}