// src/components/DataCard/DataCard.types.ts

import type { HTMLAttributes, ReactNode } from "react";


export type CardVariant = "summary" | "info" | "content";

export interface DataCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The layout style of the card */
  variant?: CardVariant;
  /** Title of the card (e.g., "Total Revenue", "Customer Info") */
  title?: string;
  /** Main highlight value (e.g., "$1,72,430") - mainly used for summary variant */
  value?: string;
  /** Subtitle or description (e.g., "↑ +14%") */
  trend?: string;
  /** Icon to display in the top left (pass a Lucide icon) */
  icon?: ReactNode;
  /** Inner content (used mainly for info and content variants) */
  children?: ReactNode;
}