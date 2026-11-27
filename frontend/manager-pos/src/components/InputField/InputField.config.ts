import type { FieldSize } from "./InputField.types";

// SHARED
export const FIELD_WRAPPER = "flex flex-col gap-[8px] w-full";

export const FIELD_LABEL =
  "block text-[12px] leading-[16px] font-semibold tracking-[0.05em] uppercase text-text";

export const FIELD_HINT =
  "text-[13px] leading-[20px] font-normal text-text-secondary";

export const FIELD_ERROR =
  "text-[13px] leading-[20px] font-medium text-error";

// INPUT BASE
// Removed focus-visible outline and replaced it with a clean focus border
export const INPUT_BASE =
  "w-full bg-input-bg text-text border border-primary rounded-[8px] " +
  "outline-none transition-all duration-200 placeholder:font-sans placeholder:text-text-secondary font-medium " +
  "focus:border-primary focus:ring-1 focus:ring-primary " +
  "disabled:bg-disabled disabled:text-disabled-text disabled:border-border disabled:cursor-not-allowed";

// INPUT VARIANTS
export const INPUT_VARIANTS = {
  default: "",
  error: "!border-error !ring-error focus:border-error focus:ring-error",
} as const;

// INPUT SIZES
export const INPUT_SIZES: Record<FieldSize, string> = {
  sm: "text-[14px] leading-[20px] px-3 h-10",        // 40px
  md: "text-[14px] leading-[20px] px-3.5 h-11",      // 44px
  lg: "text-[14px] leading-[20px] pl-5 pr-4 h-[52px]", // 52px (Login Spec: exact pl-5 pr-4 spacing)
};

// ICON WRAPPERS
export const INPUT_LEFT_ICON =
  "absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none flex items-center";

export const INPUT_RIGHT_ICON =
  "absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary flex items-center";

// ==========================================
// TEXTAREA
// ==========================================
export const TEXTAREA_BASE =
  "w-full bg-input-bg text-text border border-primary rounded-[8px] " +
  "outline-none transition-all duration-200 resize-none font-medium " +
  "placeholder:font-sans placeholder:text-text-secondary px-4 py-3 text-[14px] leading-[20px] " +
  "focus:border-primary focus:ring-1 focus:ring-primary " +
  "disabled:bg-disabled disabled:text-disabled-text disabled:border-border disabled:cursor-not-allowed";

export const TEXTAREA_ERROR = "!border-error !ring-error focus:border-error focus:ring-error";

// ==========================================
// DATE INPUT
// ==========================================
export const DATE_INPUT_BASE =
  "bg-input-bg text-text border border-primary rounded-[8px] " +
  "text-[14px] px-3 py-2 outline-none transition-all duration-200 font-medium " +
  "focus:border-primary focus:ring-1 focus:ring-primary " +
  "disabled:bg-disabled disabled:text-disabled-text disabled:border-border disabled:cursor-not-allowed appearance-none";

// ==========================================
// SEARCH CLEAR BUTTON
// ==========================================
export const SEARCH_CLEAR_BUTTON =
  "absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center " +
  "justify-center rounded-sm text-text-secondary hover:text-text " +
  "transition-colors cursor-pointer z-10";