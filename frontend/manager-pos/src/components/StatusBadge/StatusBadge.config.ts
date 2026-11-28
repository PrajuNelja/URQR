// src/components/StatusBadge/StatusBadge.config.ts
import type {
  StatusBadgeVariant,
  StatusBadgeSize,
} from "./StatusBadge.types";

export const BADGE_BASE =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded-full whitespace-nowrap transition-colors";

export const BADGE_VARIANTS: Record<StatusBadgeVariant, string> = {
  success: "bg-success-bg text-success border border-success/20",
  error: "bg-error-bg text-error border border-error/20",
  warning: "bg-warning-bg text-warning border border-warning/20",
  info: "bg-surface-alt text-text border border-border",
  neutral: "bg-surface-alt text-text-secondary border border-border",

  // Order Lifecycle Pills
  default: "bg-primary text-on-primary border border-primary",
  secondary: "bg-bg text-text border border-border",
  destructive: "bg-error text-on-primary border border-error",
  outline: "bg-surface text-primary border border-primary",
};

export const BADGE_SIZES: Record<StatusBadgeSize, string> = {
  sm: "text-[11px] px-2.5 py-0.5",
  md: "text-xs px-3 py-1",
};

export const STATUS_VARIANT_MAP: Record<string, StatusBadgeVariant> = {
  // Base variants
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  neutral: "neutral",
  
  // Order lifecycle pills
  preparing: "default",
  active: "default",
  queued: "secondary",
  draft: "secondary",
  failed: "destructive",
  voided: "destructive",
  settled: "outline",
  paid: "outline",

  // Standard mappings
  completed: "success",
  success_full: "success",
  pending: "warning",
  processing: "warning",
  in_progress: "warning",
  cancelled: "error",
  canceled: "error",
  rejected: "error",
  refunded: "info",
  new: "info",
  inactive: "neutral",
  unknown: "neutral",
  
  // Stock / Inventory Statuses (Added)
  "in-stock": "info",
  in_stock: "info",
  instock: "info",
  "low-stock": "warning",
  low_stock: "warning",
  lowstock: "warning",
  "sold-out": "error",
  sold_out: "error",
  soldout: "error",
  "out-of-stock": "error",
  out_of_stock: "error",
  "out of stock": "error",
  outofstock: "error",
};

export const STATUS_LABEL_MAP: Record<string, string> = {
  preparing: "Preparing",
  active: "Active",
  queued: "Queued",
  draft: "Draft",
  failed: "Print Failed",
  voided: "Voided",
  settled: "Settled · UPI", 
  paid: "Paid",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  rejected: "Rejected",
  refunded: "Refunded",
  processing: "Processing",
  in_progress: "In Progress",
  inactive: "Inactive",
  new: "New",
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
  neutral: "Neutral",

  // Stock / Inventory Statuses (Added)
  "in-stock": "In stock",
  in_stock: "In stock",
  instock: "In stock",
  "low-stock": "Low stock",
  low_stock: "Low stock",
  lowstock: "Low stock",
  "sold-out": "Sold out",
  sold_out: "Sold out",
  soldout: "Sold out",
  "out-of-stock": "Out of Stock",
  out_of_stock: "Out of Stock",
  "out of stock": "Out of Stock",
  outofstock: "Out of Stock",
};