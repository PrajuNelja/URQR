// src/components/Notification/Notification.config.ts

import {
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
} from "lucide-react";
import type {
  NotificationType,
  NotificationPosition,
} from "./Notification.types";

// ═══════════════════════════════════════════
// BASE
// ═══════════════════════════════════════════

export const NOTIFICATION_BASE =
  "fixed z-[60] flex items-center gap-2.5 px-5 py-3 rounded-full font-bold text-sm " +
  "shadow-lg animate-[toastIn_0.3s_ease-out] pointer-events-auto";

// ═══════════════════════════════════════════
// TYPE → COLOR CLASSES
// ═══════════════════════════════════════════

export const NOTIFICATION_VARIANTS: Record<NotificationType, string> = {
  success: "bg-success-text text-white",
  error: "bg-error-text text-white",
  info: "bg-info-text text-white",
  warning: "bg-warning-text text-white",
};

// ═══════════════════════════════════════════
// TYPE → ICON
// ═══════════════════════════════════════════

export const NOTIFICATION_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
} as const;

// ═══════════════════════════════════════════
// POSITION → WRAPPER CLASSES
// ═══════════════════════════════════════════

export const NOTIFICATION_POSITIONS: Record<NotificationPosition, string> = {
  "top-center": "top-5 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-5 right-5 items-end",
  "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-5 right-5 items-end",
};

// ═══════════════════════════════════════════
// STACK WRAPPER (for provider with multiple toasts)
// ═══════════════════════════════════════════

export const NOTIFICATION_STACK_BASE =
  "fixed z-[60] flex flex-col gap-2 pointer-events-none";

// ═══════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════

export const NOTIFICATION_DEFAULT_DURATION = 2600;
export const NOTIFICATION_DEFAULT_POSITION: NotificationPosition = "top-center";
export const NOTIFICATION_DEFAULT_MAX_VISIBLE = 4;
