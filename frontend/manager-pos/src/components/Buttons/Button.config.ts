// src/components/Buttons/Button.config.ts
import type { ButtonSize, ButtonVariant } from "./Button.types";

// ═══════════════════════════════════════════
// BUTTON — BASE
// ═══════════════════════════════════════════

export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-[0.04em] " +
  "rounded-md border transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "disabled:bg-disabled disabled:text-disabled-text disabled:cursor-not-allowed disabled:pointer-events-none " +
  "hover:-translate-y-[1px] active:translate-y-0";

// ═══════════════════════════════════════════
// BUTTON — VARIANTS
// ═══════════════════════════════════════════

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary border-primary hover:bg-primary-dark",
  secondary:
    "bg-surface-alt text-text border-border hover:bg-bg",
  outline:
    "bg-surface text-primary border-primary hover:bg-surface-alt",
  ghost:
    "bg-transparent text-text border-transparent hover:bg-surface-alt",
  danger:
    "bg-error text-on-primary border-error hover:opacity-90",
};

// ═══════════════════════════════════════════
// BUTTON — SIZES
// ═══════════════════════════════════════════

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[12px]",         // 36px
  md: "h-10 px-4 text-[14px]",        // 40px (default)
  lg: "h-11 px-5 text-[14px]",        // 44px (POS touch floor)
  login: "h-[52px] px-4 text-[14px] w-full max-w-[360px]", // 52px (Login CTA)
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
  "inline-flex items-center justify-center rounded-md border transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
  "disabled:bg-disabled disabled:text-disabled-text disabled:cursor-not-allowed disabled:pointer-events-none";

export const ICON_BUTTON_SIZES: Record<"sm" | "md" | "lg", string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

// ═══════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════

export const SPINNER_CLASSES = "animate-spin";