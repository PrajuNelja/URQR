// src/components/PopupModal/PopupModal.types.ts
// All types for the PopupModal folder: PopupModal, Receipt

import type { ReactNode } from "react";

// ═══════════════════════════════════════════
// POPUP MODAL
// ═══════════════════════════════════════════

export type PopupModalSize = "sm" | "md" | "lg" | "xl";

export interface PopupModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Close handler (fires on backdrop click, X, Escape) */
  onClose: () => void;
  /** Modal title (rendered in header) */
  title?: string;
  /** Body content */
  children?: ReactNode;
  /** Optional footer content (buttons, actions) */
  footer?: ReactNode;
  /** Confirm button text (if onConfirm provided) */
  confirmText?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string;
  /** Called when confirm button clicked */
  onConfirm?: () => void;
  /** Called when cancel button clicked (falls back to onClose) */
  onCancel?: () => void;
  /** Use danger (red) style for confirm button */
  isDanger?: boolean;
  /** Show loading spinner on confirm */
  isLoading?: boolean;
  /** Size preset (default: 'md') */
  size?: PopupModalSize;
  /** Close when backdrop is clicked (default: true) */
  closeOnBackdrop?: boolean;
  /** Close on Escape key (default: true) */
  closeOnEscape?: boolean;
  /** Extra classes on modal panel */
  className?: string;
  /** Hide the header close (X) button */
  hideCloseButton?: boolean;
}

// ═══════════════════════════════════════════
// RECEIPT (printable)
// ═══════════════════════════════════════════

export interface ReceiptItem {
  /** Item name */
  name: string;
  /** Unit price */
  price: number;
  /** Quantity */
  quantity: number;
}

export interface ReceiptProps {
  /** Business info */
  business: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  /** Order ID (e.g. ABC20261118001) */
  orderId: string;
  /** Date string (e.g. "18 Nov 2026") */
  date: string;
  /** Time string (e.g. "12:05 PM") */
  time: string;
  /** Line items */
  items: ReceiptItem[];
  /** Subtotal before tax */
  subtotal: number;
  /** Tax rate percentage (e.g. 5) */
  taxRate: number;
  /** Tax amount */
  tax: number;
  /** Final total */
  total: number;
  /** Payment method (Cash / UPI / Card) */
  paymentMethod: string;
  /** Cash collected (only for cash payments) */
  cashCollected?: number;
  /** Change to return (only for cash payments) */
  change?: number;
  /** Order status (default: 'Completed') */
  status?: string;
  /** Is this a reprint? */
  isReprint?: boolean;
  /** Reprint timestamp (shown when isReprint is true) */
  reprintedAt?: string;
  /** Currency symbol (default: '₹') */
  currency?: string;
  /** Extra classes */
  className?: string;
}