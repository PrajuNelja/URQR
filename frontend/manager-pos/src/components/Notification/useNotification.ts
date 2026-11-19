// src/components/Notification/useNotification.ts

import { useContext } from "react";
import { NotificationContext } from "./NotificationProvider";
import type { NotificationContextValue } from "./Notification.types";

/**
 * useNotification — access the global toast system.
 *
 * Must be used inside <NotificationProvider>.
 *
 * const toast = useNotification();
 * toast.success("Payment complete!");
 * toast.error("Something went wrong");
 * toast.info("Order sent to kitchen");
 * toast.warning("Low stock");
 * toast.notify("Custom message", "info", 4000);
 */
export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);

  if (!ctx) {
    throw new Error(
      "[useNotification] Must be used within <NotificationProvider>. " +
        "Wrap your app with <NotificationProvider>...</NotificationProvider>."
    );
  }

  return ctx;
};

export default useNotification;