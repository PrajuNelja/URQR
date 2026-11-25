// src/components/Notification/Notification.types.ts

import type { ReactNode } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export type NotificationPosition =
  | "top-center"
  | "top-right"
  | "bottom-center"
  | "bottom-right";

export interface NotificationProps {
  isOpen: boolean;
  type?: NotificationType;
  message: string;
  onClose: () => void;
  /** Auto-dismiss ms (default: 4000). Use 0 to disable. */
  duration?: number;
  position?: NotificationPosition;
  icon?: ReactNode;
  className?: string;
}

export interface ToastItem {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

export interface NotificationContextValue {
  notify: (message: string, type?: NotificationType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface NotificationProviderProps {
  children: ReactNode;
  /** Default duration for all toasts (default: 4000ms) */
  defaultDuration?: number;
  /** Screen position for all toasts (default: 'bottom-right') */
  position?: NotificationPosition;
  /** Max toasts visible at once (default: 4) */
  maxVisible?: number;
}