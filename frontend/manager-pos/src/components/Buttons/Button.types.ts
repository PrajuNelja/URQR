// src/components/Buttons/Buttons.types.ts
// All types for the Buttons folder: Button, IconButton

import type { ButtonHTMLAttributes, ReactNode } from "react";

// ═══════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

// ═══════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style (default: 'primary') */
  variant?: ButtonVariant;
  /** Size preset (default: 'md') */
  size?: ButtonSize;
  /** Stretch to full container width */
  fullWidth?: boolean;
  /** Show spinner + disable */
  isLoading?: boolean;
  /** Icon before label */
  leftIcon?: ReactNode;
  /** Icon after label */
  rightIcon?: ReactNode;
  /** Button label */
  children?: ReactNode;
}

// ═══════════════════════════════════════════
// ICON BUTTON
// ═══════════════════════════════════════════

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style (default: 'outline') */
  variant?: ButtonVariant;
  /** Size preset (default: 'md') */
  size?: "sm" | "md" | "lg";
  /** Accessible label (required — used as aria-label + title) */
  label: string;
  /** Icon element (e.g. <Icon name="Eye" />) */
  icon: ReactNode;
  /** Show spinner + disable */
  isLoading?: boolean;
}