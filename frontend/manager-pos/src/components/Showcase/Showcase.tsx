// src/components/Showcase.tsx

import { useState } from "react";
import { Logo } from "../Logo/Logo";
import Notification from "../Notification/Notification";
import type { NotificationType } from "../Notification/Notification.types";
import StatusBadge from "../StatusBadge/StatusBadge";

// 1. Imports

const statusExamples = [
  { id: "completed-1", status: "Completed" },
  { id: "completed-2", status: "Completed" },
  { id: "completed-3", status: "Completed" },
  { id: "completed-4", status: "Completed" },
  { id: "completed-5", status: "Completed" },
  { id: "cancelled-1", status: "Cancelled" },
];

// 2. Component
export default function Showcase() {
  const [notificationType, setNotificationType] =
    useState<NotificationType | null>(null);

  // 3. Export / Return
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-primary mb-2">
          Component Showcase
        </h1>
        <p className="text-text-muted">
          Testing all reusable components with the Ivory Luxe theme.
        </p>
      </div>

      {/* Logo Section */}
      <section className="bg-surface p-6 rounded-md border border-border-subtle shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-4 border-b border-border-subtle pb-2">
          Logo
        </h2>
        <div className="flex flex-col gap-6">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
          <Logo size="md" showText={false} />
        </div>
      </section>

      {/* Status Badge Section */}
      <section className="overflow-hidden rounded-lg border border-border-subtle bg-app-bg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-6 py-5 text-center text-sm font-semibold text-text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {statusExamples.map(({ id, status }, index) => (
              <tr
                key={id}
                className={
                  index < statusExamples.length - 1
                    ? "border-b border-border-subtle"
                    : ""
                }
              >
                <td className="px-6 py-5 text-center">
                  <StatusBadge status={status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Notification Section */}
      <section className="rounded-md border border-border-subtle bg-surface p-6 shadow-sm">
        <h2 className="mb-4 border-b border-border-subtle pb-2 text-xl font-serif text-primary">
          Notifications
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-surface hover:bg-accent-gold"
            onClick={() => setNotificationType("bill-success")}
          >
            Bill generated
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-surface hover:bg-accent-gold"
            onClick={() => setNotificationType("payment-success")}
          >
            Payment successful
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-surface hover:bg-accent-gold"
            onClick={() => setNotificationType("error")}
          >
            Payment or bill failed
          </button>
        </div>
        {notificationType && (
          <Notification
            type={notificationType}
            onClose={() => setNotificationType(null)}
          />
        )}
      </section>
    </div>
  );
}
