// src/components/Buttons/Buttons.config.ts
// All configs for the Buttons folder: Button, IconButton

import type { ButtonSize, ButtonVariant } from "./Button.types";


// ═══════════════════════════════════════════
// BUTTON — BASE
// ═══════════════════════════════════════════

export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-bold tracking-[0.04em] " +
  "rounded-md border transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 " +
  "disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none " +
  "hover:-translate-y-[2px] active:translate-y-0";

// ═══════════════════════════════════════════
// BUTTON — VARIANTS
// ═══════════════════════════════════════════

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-button-text border-primary hover:brightness-110 shadow-ivory",
  secondary:
    "bg-accent-gold text-button-text border-accent-gold hover:brightness-110 shadow-ivory",
  outline:
    "bg-transparent text-primary border-border-subtle hover:border-accent-gold hover:text-accent-gold",
  ghost:
    "bg-transparent text-primary border-transparent hover:bg-app-bg",
  danger:
    "bg-error-text text-button-text border-error-text hover:brightness-110",
};

// ═══════════════════════════════════════════
// BUTTON — SIZES
// ═══════════════════════════════════════════

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "text-[11px] px-3 py-1.5",
  md: "text-xs px-3.5 py-2.5",
  lg: "text-sm px-5 py-3.5",
  icon: "p-2",
};

// ═══════════════════════════════════════════
// BUTTON — MODIFIERS
// ═══════════════════════════════════════════

export const BUTTON_FULL_WIDTH = "w-full";

// ═══════════════════════════════════════════
// ICON BUTTON — BASE
// ═══════════════════════════════════════════

export const ICON_BUTTON_BASE =
  "inline-flex items-center justify-center rounded-md border " +
  "transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 " +
  "disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none";

export const ICON_BUTTON_SIZES: Record<"sm" | "md" | "lg", string> = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-11 h-11",
};

// ═══════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════

export const SPINNER_CLASSES = "animate-spin";