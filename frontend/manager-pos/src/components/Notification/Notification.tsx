// src/components/Notification/Notification.tsx

import { useEffect } from "react";
import type { NotificationProps } from "./Notification.types";
import {
  NOTIFICATION_BASE,
  NOTIFICATION_VARIANTS,
  NOTIFICATION_ICONS,
  NOTIFICATION_POSITIONS,
  NOTIFICATION_DEFAULT_DURATION,
  NOTIFICATION_DEFAULT_POSITION,
} from "./Notification.config";

/**
 * Notification — single toast.
 * Matches your Showcase usage:
 *   <Notification isOpen type message onClose />
 */
export const Notification = ({
  isOpen,
  type = "success",
  message,
  onClose,
  duration = NOTIFICATION_DEFAULT_DURATION,
  position = NOTIFICATION_DEFAULT_POSITION,
  icon,
  className = "",
}: NotificationProps) => {
  // ── Auto-dismiss ──
  useEffect(() => {
    if (!isOpen || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const IconComponent = NOTIFICATION_ICONS[type];

  const classes = [
    NOTIFICATION_BASE,
    NOTIFICATION_VARIANTS[type],
    NOTIFICATION_POSITIONS[position],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {icon ?? <IconComponent size={18} aria-hidden="true" />}
      <span>{message}</span>
    </div>
  );
};

export default Notification;
