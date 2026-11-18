import { NOTIFICATION_CONFIG } from "./Notification.config";
import type { NotificationProps } from "./Notification.types";

export default function Notification({ type, onClose }: NotificationProps) {
const notification = NOTIFICATION_CONFIG[type];

      return (
<div
      className={`fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-lg border px-4 py-3 shadow-md ${notification.className}`}
      role={notification.role}
      aria-live={notification.role === "alert" ? "assertive" : "polite"}
    >
      <span
        className="grid size-6 shrink-0 place-items-center rounded-full bg-surface/70 text-sm font-bold"
        aria-hidden="true"
      >
        {notification.icon}
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium">
        {notification.message}
      </p>
      {onClose && (
        <button
          type="button"
          className="rounded-md px-1 text-lg leading-none text-text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Dismiss notification"
          onClick={onClose}
        >
          &times;
        </button>
      )}
    </div>
  );
}
