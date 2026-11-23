// manager-pos/src/components/Notification/NotificationContext.ts
import { createContext } from "react"; // <-- ADDED THIS IMPORT
import type { NotificationContextValue } from "./Notification.types";

export const NotificationContext = createContext<NotificationContextValue | null>(null);