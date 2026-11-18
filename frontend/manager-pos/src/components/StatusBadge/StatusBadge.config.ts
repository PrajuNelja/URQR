// src/components/StatusBadge/StatusBadge.config.ts

export const statusBadgeConfig = {
  base: "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border",
  statuses: {
    paid: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-orange-50 text-orange-700 border-orange-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  },
  defaultLabels: {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    cancelled: "Cancelled",
  },
};