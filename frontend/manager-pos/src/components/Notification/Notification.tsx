// src/components/Notification/Notification.tsx
import { useEffect } from "react";
import { X } from "lucide-react";
import type { NotificationProps } from "./Notification.types";
import {
  NOTIFICATION_BASE,
  NOTIFICATION_VARIANTS,
  NOTIFICATION_ICONS,
  NOTIFICATION_POSITIONS,
  NOTIFICATION_DEFAULT_DURATION,
  NOTIFICATION_DEFAULT_POSITION,
} from "./Notification.config";

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
    <div className={classes} role="status" aria-live="polite">
      {icon ?? <IconComponent size={18} className="shrink-0 mt-0.5" aria-hidden="true" />}
      <div className="flex-1 flex flex-col justify-center min-h-[20px]">
        <span className="font-semibold leading-tight">{message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 p-1 -mr-2 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;