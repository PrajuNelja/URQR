// manager-pos/src/components/Notification/useNotification.ts
import { useContext } from "react";
import { NotificationContext } from "./NotificationContext"; // <-- UPDATED IMPORT
import type { NotificationContextValue } from "./Notification.types";

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);

  if (!ctx) {
    // Fail-safe fallback for unit tests and isolated components
    return {
      notify: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
      dismiss: () => {},
      dismissAll: () => {},
    };
  }

  return ctx;
};

export default useNotification;