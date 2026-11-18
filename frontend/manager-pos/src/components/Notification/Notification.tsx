// src/components/Notification/Notification.tsx

// 1. Imports
import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { notificationConfig } from "./Notification.config";
import type { NotificationProps } from "./Notification.types";

// 2. Component
export const Notification: React.FC<NotificationProps> = ({
  type = "info",
  message,
  isOpen,
  onClose,
  duration = 3000,
}) => {
  // 3. Handlers & Effects
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  // 4. Render Variables
  const typeConfig = notificationConfig.types[type];
  
  const icons = {
    success: <CheckCircle2 size={20} className={typeConfig.iconColor} />,
    error: <XCircle size={20} className={typeConfig.iconColor} />,
    warning: <AlertCircle size={20} className={typeConfig.iconColor} />,
    info: <Info size={20} className={typeConfig.iconColor} />,
  };

  const wrapperClasses = `
    ${notificationConfig.wrapper}
    ${typeConfig.border}
    ${typeConfig.bg}
    ${isOpen ? notificationConfig.visible : notificationConfig.hidden}
  `.trim();

  // 5. Export / Return
  return (
    <div className={wrapperClasses}>
      <div>{icons[type]}</div>
      <p className="text-sm font-medium text-primary flex-1">{message}</p>
      <button onClick={onClose} className={notificationConfig.closeBtn}>
        <X size={16} />
      </button>
    </div>
  );
};