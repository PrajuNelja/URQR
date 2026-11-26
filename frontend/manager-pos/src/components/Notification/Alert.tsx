// src/components/Notification/Alert.tsx
import type { ReactNode } from "react";
import { ALERT_BASE, ALERT_VARIANTS, NOTIFICATION_ICONS } from "./Notification.config";
import type { NotificationType } from "./Notification.types";

interface AlertProps {
  type?: NotificationType;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Alert = ({
  type = "info",
  title,
  children,
  className = "",
}: AlertProps) => {
  const IconComponent = NOTIFICATION_ICONS[type];
  
  const classes = [ALERT_BASE, ALERT_VARIANTS[type], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role={type === "error" ? "alert" : "status"}>
      <IconComponent size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        {title && <span className="font-semibold">{title}</span>}
        <div className="text-sm font-medium opacity-90">{children}</div>
      </div>
    </div>
  );
};

export default Alert;