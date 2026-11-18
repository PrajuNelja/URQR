// src/components/Notification/Notification.config.ts

export const notificationConfig = {
  wrapper: "fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-md shadow-md border bg-surface min-w-[300px] max-w-md transition-all duration-300 transform",
  hidden: "translate-x-[120%] opacity-0 pointer-events-none",
  visible: "translate-x-0 opacity-100",
  closeBtn: "ml-auto text-text-muted hover:text-primary transition-colors",
  
  types: {
    success: {
      border: "border-green-200",
      iconColor: "text-green-600",
      bg: "bg-green-50",
    },
    error: {
      border: "border-red-200",
      iconColor: "text-red-600",
      bg: "bg-red-50",
    },
    warning: {
      border: "border-orange-200",
      iconColor: "text-orange-600",
      bg: "bg-orange-50",
    },
    info: {
      border: "border-blue-200",
      iconColor: "text-blue-600",
      bg: "bg-blue-50",
    },
  },
};