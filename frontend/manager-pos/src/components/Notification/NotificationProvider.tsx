// src/components/Notification/NotificationProvider.tsx
import { useCallback, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type {
  NotificationProviderProps,
  NotificationContextValue,
  NotificationType,
  ToastItem,
} from "./Notification.types";
import { NotificationContext } from "./NotificationContext";
import {
  NOTIFICATION_BASE,
  NOTIFICATION_VARIANTS,
  NOTIFICATION_ICONS,
  NOTIFICATION_STACK_BASE,
  NOTIFICATION_DEFAULT_DURATION,
  NOTIFICATION_DEFAULT_MAX_VISIBLE,
} from "./Notification.config";

export const NotificationProvider = ({
  children,
  defaultDuration = NOTIFICATION_DEFAULT_DURATION,
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
    (message: string, type: NotificationType = "success", duration: number = defaultDuration) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => {
        const next = [...prev, { id, type, message, duration }];
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
      <div className={NOTIFICATION_STACK_BASE} aria-live="polite">
        {toasts.map((t) => {
          const IconComponent = NOTIFICATION_ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`${NOTIFICATION_BASE} ${NOTIFICATION_VARIANTS[t.type]} animate-[toastIn_0.3s_ease-out]`}
              role="status"
            >
              <IconComponent size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col justify-center min-h-[20px]">
                <span className="font-semibold leading-tight">{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 p-1 -mr-2 text-current opacity-70 hover:opacity-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;