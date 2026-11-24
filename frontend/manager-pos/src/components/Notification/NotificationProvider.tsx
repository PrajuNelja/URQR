// src/components/Notification/NotificationProvider.tsx

import { useCallback, useMemo, useRef, useState } from "react";
import type {
  NotificationProviderProps,
  NotificationContextValue,
  NotificationType,
  ToastItem,
} from "./Notification.types";

// Import the context from the new file
import { NotificationContext } from "./NotificationContext";

import {
  NOTIFICATION_BASE,
  NOTIFICATION_VARIANTS,
  NOTIFICATION_ICONS,
  NOTIFICATION_STACK_BASE,
  NOTIFICATION_POSITIONS,
  NOTIFICATION_DEFAULT_DURATION,
  NOTIFICATION_DEFAULT_POSITION,
  NOTIFICATION_DEFAULT_MAX_VISIBLE,
} from "./Notification.config";

/**
 * NotificationProvider — global toast system.
 */
export const NotificationProvider = ({
  children,
  defaultDuration = NOTIFICATION_DEFAULT_DURATION,
  position = NOTIFICATION_DEFAULT_POSITION,
  maxVisible = NOTIFICATION_DEFAULT_MAX_VISIBLE,
}: NotificationProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (
      message: string,
      type: NotificationType = "success",
      duration: number = defaultDuration
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast: ToastItem = { id, type, message, duration };

      setToasts((prev) => {
        const next = [...prev, toast];
        // Keep only the latest `maxVisible`
        return next.slice(-maxVisible);
      });

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [defaultDuration, maxVisible, dismiss]
  );

  const dismissAll = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success: (msg, d) => notify(msg, "success", d),
      error: (msg, d) => notify(msg, "error", d),
      info: (msg, d) => notify(msg, "info", d),
      warning: (msg, d) => notify(msg, "warning", d),
      dismiss,
      dismissAll,
    }),
    [notify, dismiss, dismissAll]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div
        className={`${NOTIFICATION_STACK_BASE} ${NOTIFICATION_POSITIONS[position]}`}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => {
          const IconComponent = NOTIFICATION_ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`${NOTIFICATION_BASE} ${NOTIFICATION_VARIANTS[t.type]} pointer-events-auto`}
              role="status"
            >
              <IconComponent size={18} aria-hidden="true" />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;