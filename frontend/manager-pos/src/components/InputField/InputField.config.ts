// src/components/InputField/InputField.config.ts

import type { FieldSize } from "./InputField.types";

// ═══════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════

export const FIELD_WRAPPER = "flex flex-col gap-1.5 w-full";

export const FIELD_LABEL =
  "block text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted";

export const FIELD_HINT = "text-xs text-text-muted mt-0.5";

export const FIELD_ERROR = "text-xs font-semibold text-error-text mt-0.5";

// ═══════════════════════════════════════════
// INPUT BASE
// ═══════════════════════════════════════════

// Using !important on border to override Tailwind's Preflight reset
export const INPUT_BASE =
  "w-full bg-input-bg text-primary border !border-border-subtle rounded-md " +
  "outline-none transition-all duration-200 placeholder:text-text-muted " +
  "disabled:opacity-55 disabled:cursor-not-allowed shadow-sm";

// ═══════════════════════════════════════════
// INPUT VARIANTS (normal / error)
// ═══════════════════════════════════════════

export const INPUT_VARIANTS = {
  // No ring, just a nice gold border on focus, and a subtle shadow
  default:
    "focus:!border-accent-gold focus:shadow-[0_0_0_3px_rgba(184,137,59,0.15)]",
  error:
    "!border-error-text focus:!border-error-text focus:shadow-[0_0_0_3px_rgba(179,64,42,0.15)]",
} as const;

// ═══════════════════════════════════════════
// INPUT SIZES
// ═══════════════════════════════════════════

export const INPUT_SIZES: Record<FieldSize, string> = {
  sm: "text-[13px] px-3 py-2",
  md: "text-sm px-3.5 py-2.5",
  lg: "text-base px-4 py-3",
};

// ═══════════════════════════════════════════
// ICON WRAPPERS
// ═══════════════════════════════════════════

export const INPUT_LEFT_ICON =
  "absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center";

export const INPUT_RIGHT_ICON =
  "absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted flex items-center";

// ═══════════════════════════════════════════
// TEXTAREA
// ═══════════════════════════════════════════

export const TEXTAREA_BASE =
  "w-full bg-input-bg text-primary border !border-border-subtle rounded-md " +
  "outline-none transition-all duration-200 resize-none shadow-sm " +
  "placeholder:text-text-muted px-3.5 py-2.5 text-sm " +
  "focus:!border-accent-gold focus:shadow-[0_0_0_3px_rgba(184,137,59,0.15)] " +
  "disabled:opacity-55 disabled:cursor-not-allowed";

export const TEXTAREA_ERROR =
  "!border-error-text focus:!border-error-text focus:shadow-[0_0_0_3px_rgba(179,64,42,0.15)]";

// ═══════════════════════════════════════════
// DATE INPUT
// ═══════════════════════════════════════════

// Removed the heavy border/ring. Let's make it look like a clean button pill.
export const DATE_INPUT_BASE =
  "bg-input-bg text-primary border !border-border-subtle rounded-md " +
  "text-[13px] px-3 py-1.5 outline-none transition-all duration-200 shadow-sm " +
  "focus:!border-accent-gold focus:shadow-[0_0_0_3px_rgba(184,137,59,0.15)] " +
  "disabled:opacity-55 disabled:cursor-not-allowed appearance-none";

// ═══════════════════════════════════════════
// SEARCH CLEAR BUTTON
// ═══════════════════════════════════════════

export const SEARCH_CLEAR_BUTTON =
  "absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center " +
  "justify-center rounded-sm text-text-muted hover:text-primary " +
  "transition-colors cursor-pointer z-10";
