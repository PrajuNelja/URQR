// manager-pos/src/components/Notification/useNotification.ts
import { useContext } from "react";
import { NotificationContext } from "./NotificationContext"; // <-- UPDATED IMPORT
import type { NotificationContextValue } from "./Notification.types";

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);

  if (!ctx) {
    // Fail-safe fallback for unit tests and isolated components
    return {
      notifications: [],
      addNotification: () => "",
      removeNotification: () => {},
      clearAll: () => {},
      success: () => "",
      error: () => "",
      info: () => "",
      warning: () => "",
    };
  }

  return ctx;
};

export default useNotification;