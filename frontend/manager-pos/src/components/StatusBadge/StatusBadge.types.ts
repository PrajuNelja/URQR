// src/components/StatusBadge/StatusBadge.types.ts

import type { HTMLAttributes } from "react";


export type BadgeStatus = "paid" | "pending" | "failed" | "cancelled";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** The status to display */
  status: BadgeStatus;
  /** Optional custom label (e.g., to override "Paid" with "Completed") */
  label?: string;
}