// src/components/Notification/Notification.types.ts

import type { ReactNode } from "react";

// ═══════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════

export type NotificationType = "success" | "error" | "info" | "warning";

export type NotificationPosition =
  | "top-center"
  | "top-right"
  | "bottom-center"
  | "bottom-right";

// ═══════════════════════════════════════════
// NOTIFICATION (single toast UI)
// ═══════════════════════════════════════════

export interface NotificationProps {
  /** Whether the toast is visible */
  isOpen: boolean;
  /** Toast type (color + icon) */
  type?: NotificationType;
  /** Message body */
  message: string;
  /** Called when the toast closes (auto-dismiss, X click, timeout) */
  onClose: () => void;
  /** Auto-dismiss after ms (default: 2600). Use 0 to disable auto-dismiss. */
  duration?: number;
  /** Screen position (default: 'top-center') */
  position?: NotificationPosition;
  /** Optional custom icon (overrides default per-type icon) */
  icon?: ReactNode;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// NOTIFICATION PROVIDER (context + queue)
// ═══════════════════════════════════════════

export interface ToastItem {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

export interface NotificationContextValue {
  /** Show a toast */
  notify: (message: string, type?: NotificationType, duration?: number) => void;
  /** Convenience shortcuts */
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  /** Dismiss a specific toast by id */
  dismiss: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
}

export interface NotificationProviderProps {
  children: ReactNode;
  /** Default duration for all toasts (default: 2600ms) */
  defaultDuration?: number;
  /** Screen position for all toasts (default: 'top-center') */
  position?: NotificationPosition;
  /** Max toasts visible at once (default: 4) */
  maxVisible?: number;
}