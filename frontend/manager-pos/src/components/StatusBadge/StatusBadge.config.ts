// src/components/StatusBadge/StatusBadge.config.ts

import type {
  StatusBadgeVariant,
  StatusBadgeSize,
} from "./StatusBadge.types";

// ═══════════════════════════════════════════
// BASE
// ═══════════════════════════════════════════

export const BADGE_BASE =
  "inline-flex items-center justify-center font-semibold rounded-md whitespace-nowrap";

// ═══════════════════════════════════════════
// VARIANTS (use your CSS status tokens)
// ═══════════════════════════════════════════

export const BADGE_VARIANTS: Record<StatusBadgeVariant, string> = {
  success: "bg-success-bg text-success-text",
  error: "bg-error-bg text-error-text",
  warning: "bg-warning-bg text-warning-text",
  info: "bg-info-bg text-info-text",
  neutral: "bg-neutral-bg text-neutral-text",
};

// ═══════════════════════════════════════════
// SIZES
// ═══════════════════════════════════════════

export const BADGE_SIZES: Record<StatusBadgeSize, string> = {
  sm: "text-[11px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

// ═══════════════════════════════════════════
// STATUS → VARIANT MAP
// ═══════════════════════════════════════════
// Covers both explicit variant names AND app-level statuses
// (paid / pending / cancelled / completed / etc.)

export const STATUS_VARIANT_MAP: Record<string, StatusBadgeVariant> = {
  // Direct variant names
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  neutral: "neutral",

  // Order / payment statuses
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

// ═══════════════════════════════════════════
// LABEL MAP (pretty display text)
// ═══════════════════════════════════════════
// If a status isn't mapped here, we just capitalize it.

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