// src/components/Buttons/Button.config.ts
import type { ButtonSize, ButtonVariant } from "./Button.types";

// ═══════════════════════════════════════════
// BUTTON — BASE
// ═══════════════════════════════════════════
export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-[0.04em] " +
  "rounded-[8px] border transition-colors duration-200 outline-none " +
  "whitespace-nowrap " + 
  "disabled:bg-disabled disabled:text-disabled-text disabled:border-border disabled:cursor-not-allowed disabled:pointer-events-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

// ═══════════════════════════════════════════
// BUTTON — VARIANTS
// ═══════════════════════════════════════════
export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary border-transparent hover:bg-primary-dark",
  secondary:
    "bg-surface-alt text-text border-border hover:bg-bg",
  outline:
    "bg-surface text-primary border-primary hover:bg-surface-alt",
  ghost:
    "bg-transparent text-text border-transparent hover:bg-surface-alt",
  danger:
    "bg-error text-on-primary border-transparent hover:opacity-90",
};

// ═══════════════════════════════════════════
// BUTTON — SIZES
// ═══════════════════════════════════════════
export const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[12px]",                               // 36px height
  md: "h-10 px-5 text-[14px]",                              // 40px height
  lg: "h-11 px-6 text-[14px]",                              // 44px height
  login: "h-[52px] px-4 text-[14px]",                       // 52px height (Login Spec)
  icon: "p-2",
};

// ═══════════════════════════════════════════
// BUTTON — MODIFIERS (This is the missing part!)
// ═══════════════════════════════════════════
export const BUTTON_FULL_WIDTH = "w-full";

// ═══════════════════════════════════════════
// ICON BUTTON — BASE
// ═══════════════════════════════════════════
export const ICON_BUTTON_BASE =
  "inline-flex items-center justify-center rounded-lg border border-transparent transition-colors duration-200 outline-none " +
  "disabled:bg-disabled disabled:text-disabled-text disabled:cursor-not-allowed disabled:pointer-events-none";

export const ICON_BUTTON_SIZES: Record<"sm" | "md" | "lg", string> = {
  sm: "w-9 h-9",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

// ═══════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════
export const SPINNER_CLASSES = "animate-spin";