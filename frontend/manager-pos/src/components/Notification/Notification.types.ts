export type NotificationType = "bill-success" | "payment-success" | "error";

export interface NotificationConfig {
  message: string;
  icon: string;
  className: string;
  role: "status" | "alert";
}

export interface NotificationProps {
  type: NotificationType;
  onClose?: () => void;
}
