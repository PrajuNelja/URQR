import {
  STATUS_BADGE_BASE_CLASS,
  STATUS_BADGE_DEFAULT_CLASS,
  STATUS_BADGE_STYLES,
} from "./StatusBadge.config";
import type { StatusBadgeProps } from "./StatusBadge.types";

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const label = status.trim() || "Unknown";
  const classes = [
    STATUS_BADGE_BASE_CLASS,
    STATUS_BADGE_STYLES[label.toLowerCase()] ?? STATUS_BADGE_DEFAULT_CLASS,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{label}</span>;
}
