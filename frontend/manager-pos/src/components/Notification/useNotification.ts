// manager-pos/src/components/Notification/useNotification.ts
import { useContext } from "react";
import { NotificationContext } from "./NotificationContext"; // <-- UPDATED IMPORT
import type { NotificationContextValue } from "./Notification.types";

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