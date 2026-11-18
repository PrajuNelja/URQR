// src/components/Notification/Notification.types.ts

export type NotificationType = "success" | "error" | "info" | "warning";

export interface NotificationProps {
  /** The type of notification */
  type?: NotificationType;
  /** The message to display */
  message: string;
  /** Whether the notification is visible */
  isOpen: boolean;
  /** Function to close the notification */
  onClose: () => void;
  /** Duration in ms before auto-closing (default: 3000) */
  duration?: number;
}