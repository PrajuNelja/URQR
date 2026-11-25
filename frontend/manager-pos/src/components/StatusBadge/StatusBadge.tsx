// src/components/StatusBadge/StatusBadge.tsx

import type { StatusBadgeProps } from "./StatusBadge.types";
import {
  BADGE_BASE,
  BADGE_VARIANTS,
  BADGE_SIZES,
  STATUS_VARIANT_MAP,
  STATUS_LABEL_MAP,
} from "./StatusBadge.config";

/**
 * resolveVariant — explicit `variant` wins; else map `status`; else neutral.
 */
const resolveVariant = (
  status?: string,
  variant?: StatusBadgeProps["variant"]
) => {
  if (variant) return variant;
  if (!status) return "neutral";
  const key = status.toLowerCase().trim();
  return STATUS_VARIANT_MAP[key] ?? "neutral";
};

/**
 * resolveLabel — explicit `label` wins; else pretty-map; else capitalize.
 */
const resolveLabel = (status?: string, label?: string) => {
  if (label) return label;
  if (!status) return "";
  const key = status.toLowerCase().trim();
  if (STATUS_LABEL_MAP[key]) return STATUS_LABEL_MAP[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
};

/**
 * StatusBadge — colored pill for order/payment status.
 */
export const StatusBadge = ({
  status,
  variant,
  label,
  size = "sm",
  className = "",
}: StatusBadgeProps) => {
  const resolvedVariant = resolveVariant(status, variant);
  const resolvedLabel = resolveLabel(status, label);

  const classes = [
    BADGE_BASE,
    BADGE_VARIANTS[resolvedVariant],
    BADGE_SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{resolvedLabel}</span>;
};

export default StatusBadge;