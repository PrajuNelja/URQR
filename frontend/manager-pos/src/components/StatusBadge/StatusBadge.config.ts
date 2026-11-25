// src/components/StatusBadge/StatusBadge.config.ts
import type {
  StatusBadgeVariant,
  StatusBadgeSize,
} from "./StatusBadge.types";

export const BADGE_BASE =
  "inline-flex items-center justify-center font-semibold rounded-md whitespace-nowrap";

export const BADGE_VARIANTS: Record<StatusBadgeVariant, string> = {
  success: "bg-success-bg text-success",
  error: "bg-error-bg text-error",
  warning: "bg-warning-bg text-warning",
  info: "bg-surface-alt text-text",
  neutral: "bg-surface-alt text-text-secondary",
};

export const BADGE_SIZES: Record<StatusBadgeSize, string> = {
  sm: "text-[11px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export const STATUS_VARIANT_MAP: Record<string, StatusBadgeVariant> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  neutral: "neutral",
  paid: "success",
  completed: "success",
  success_full: "success",
  active: "success",
  pending: "warning",
  processing: "warning",
  in_progress: "warning",
  cancelled: "error",
  canceled: "error",
  failed: "error",
  rejected: "error",
  refunded: "info",
  new: "info",
  inactive: "neutral",
  draft: "neutral",
  unknown: "neutral",
};

export const STATUS_LABEL_MAP: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  failed: "Failed",
  rejected: "Rejected",
  refunded: "Refunded",
  processing: "Processing",
  in_progress: "In Progress",
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
  new: "New",
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
  neutral: "Neutral",
};