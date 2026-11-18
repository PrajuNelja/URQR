// src/components/Header/Header.types.ts

import type { ReactNode } from "react";


export type HeaderVariant = "dashboard" | "billing" | "compact";

export interface HeaderProps {
  /** The layout style of the header */
  variant?: HeaderVariant;
  /** Main title (used in dashboard and billing variants) */
  title?: string;
  /** Subtitle (used in dashboard variant) */
  subtitle?: string;
  /** Action buttons or elements to render on the right side */
  actions?: ReactNode;
}