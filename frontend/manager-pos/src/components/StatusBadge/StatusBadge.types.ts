// src/components/StatusBadge/StatusBadge.types.ts

export type StatusBadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral"
  // Spec §8 Order Lifecycle Pills
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export type StatusBadgeSize = "sm" | "md";

export interface StatusBadgeProps {
  status?: string;
  variant?: StatusBadgeVariant;
  label?: string;
  size?: StatusBadgeSize;
  className?: string;
}