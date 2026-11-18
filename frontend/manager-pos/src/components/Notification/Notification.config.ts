import type {
  NotificationConfig,
  NotificationType,
} from "./Notification.types";

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> =
  {
    "bill-success": {
      message: "Bill Generated Successfully",
      icon: "✓",
      className: "border-green-200 bg-green-50 text-green-800",
      role: "status",
    },
    "payment-success": {
      message: "Payment Successfull",
      icon: "✓",
      className: "border-green-200 bg-green-50 text-green-800",
      role: "status",
    },
    error: {
      message: "Something Went Wrong!",
      icon: "!",
      className: "border-red-200 bg-red-50 text-red-800",
      role: "alert",
    },
  };
