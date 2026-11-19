// src/components/StatusBadge/StatusBadge.types.ts

export type StatusBadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral";

export type StatusBadgeSize = "sm" | "md";

export interface StatusBadgeProps {
  /**
   * Status value. Accepts either:
   *  - a raw status string ("paid", "pending", "cancelled", "completed")
   *  - a variant name ("success", "error", "warning", "info", "neutral")
   * (mapped automatically via StatusBadge.config)
   */
  status?: string;

  /** Explicit variant (overrides `status` mapping) */
  variant?: StatusBadgeVariant;

  /** Custom display label (defaults to the formatted status) */
  label?: string;

  /** Size preset (default: 'sm') */
  size?: StatusBadgeSize;

  /** Extra classes */
  className?: string;
}
