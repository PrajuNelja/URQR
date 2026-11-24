// src/components/Notification/Notification.config.ts
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";
import type { NotificationType, NotificationPosition } from "./Notification.types";

// ═══════════════════════════════════════════
// TOAST (Radix UI style)
// ═══════════════════════════════════════════

export const NOTIFICATION_BASE =
  "fixed z-[60] flex items-start gap-3 px-4 py-3 rounded-[8px] border text-sm " +
  "shadow-lg animate-[toastIn_0.3s_ease-out] pointer-events-auto w-full max-w-sm";

export const NOTIFICATION_VARIANTS: Record<NotificationType, string> = {
  success: "bg-success-bg border-success text-success",
  error: "bg-error-bg border-error text-error",
  info: "bg-surface border-border text-text",
  warning: "bg-warning-bg border-warning text-warning",
};

export const NOTIFICATION_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
} as const;

export const NOTIFICATION_POSITIONS: Record<NotificationPosition, string> = {
  "top-center": "top-5 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-5 right-5 items-end",
  "bottom-center": "bottom-5 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-5 right-5 items-end",
};

export const NOTIFICATION_STACK_BASE =
  "fixed z-[60] flex flex-col gap-2.5 pointer-events-none bottom-4 right-4 w-full max-w-sm";

// ═══════════════════════════════════════════
// ALERT (Inline Banners)
// ═══════════════════════════════════════════

export const ALERT_BASE = "flex items-start gap-3 p-4 rounded-[8px] border text-sm w-full";

export const ALERT_VARIANTS: Record<NotificationType, string> = {
  success: "bg-success-bg border-success/40 text-success",
  error: "bg-error-bg border-error text-error",
  info: "bg-surface border-border text-text",
  warning: "bg-warning-bg border-warning/40 text-warning",
};

// ═══════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════

export const NOTIFICATION_DEFAULT_DURATION = 4000;
export const NOTIFICATION_DEFAULT_POSITION: NotificationPosition = "bottom-right";
export const NOTIFICATION_DEFAULT_MAX_VISIBLE = 3;