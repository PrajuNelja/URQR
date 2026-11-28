import type { FieldSize } from "./InputField.types";

export const FIELD_WRAPPER = "flex flex-col gap-[8px] w-full";

export const FIELD_LABEL =
  "block text-[12px] leading-[16px] font-semibold tracking-[0.05em] uppercase text-text";

export const FIELD_HINT =
  "text-[13px] leading-[20px] font-normal text-text-secondary";

export const FIELD_ERROR =
  "text-[13px] leading-[20px] font-medium text-error";

// INPUT BASE - Explicit Dark Mode Overrides
export const INPUT_BASE =
  "w-full bg-white dark:bg-[#1B1511] text-text dark:text-white border border-[#D1C4B5] dark:border-[#8B5E3C] rounded-[10px] " +
  "outline-none transition-all duration-200 placeholder:font-sans placeholder:text-text-secondary dark:placeholder:text-[#BFAEA0] font-medium " +
  "focus:outline focus:outline-[2px] focus:outline-[#8B5E3C] focus:outline-offset-[2px] dark:focus:outline-[#B07C54] " +
  "disabled:bg-[#f5f5f5] dark:disabled:bg-[#3A2F27] disabled:text-text-secondary dark:disabled:text-[#857467] disabled:border-border dark:disabled:border-[#43352A] disabled:cursor-not-allowed " +
  // Autofill fix for both light and dark
  "[&:-webkit-autofill]:!bg-white dark:[&:-webkit-autofill]:!bg-[#1B1511] " +
  "[&:-webkit-autofill]:!shadow-[0_0_0_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:!shadow-[0_0_0_1000px_#1B1511_inset] " +
  "[&:-webkit-autofill]:!text-text dark:[&:-webkit-autofill]:!text-white";

export const INPUT_VARIANTS = {
  default: "",
  // Error state: Light red border in light mode, dark red in dark mode
  error: "!border-[#FDA29B] dark:!border-[#E55353] !border-1 focus:outline-[#B91C1C] dark:focus:outline-[#E55353]", 
} as const;

export const INPUT_SIZES: Record<FieldSize, string> = {
  sm: "text-[14px] leading-[20px] px-3 h-10",
  md: "text-[14px] leading-[20px] px-3.5 h-11",
  lg: "text-[14px] leading-[20px] pl-5 pr-4 h-[52px]",
};

export const INPUT_LEFT_ICON =
  "absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-[#BFAEA0] pointer-events-none flex items-center";

export const INPUT_RIGHT_ICON =
  "absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-[#BFAEA0] flex items-center";

// TEXTAREA
export const TEXTAREA_BASE =
  "w-full bg-white dark:bg-[#1B1511] text-text dark:text-white border border-[#D1C4B5] dark:border-[#8B5E3C] rounded-[10px] " +
  "outline-none transition-all duration-200 resize-none font-medium " +
  "placeholder:font-sans placeholder:text-text-secondary dark:placeholder:text-[#BFAEA0] px-4 py-3 text-[14px] leading-[20px] " +
  "focus:outline focus:outline-[2px] focus:outline-[#8B5E3C] focus:outline-offset-[2px] dark:focus:outline-[#B07C54] " +
  "disabled:bg-[#f5f5f5] dark:disabled:bg-[#3A2F27] disabled:text-text-secondary dark:disabled:text-[#857467] disabled:border-border dark:disabled:border-[#43352A] disabled:cursor-not-allowed";

export const TEXTAREA_ERROR = "!border-[#FDA29B] dark:!border-[#E55353] !border-1 focus:outline-[#B91C1C] dark:focus:outline-[#E55353]";

// DATE INPUT
export const DATE_INPUT_BASE =
  "bg-white dark:bg-[#1B1511] text-text dark:text-white border border-[#D1C4B5] dark:border-[#8B5E3C] rounded-[10px] " +
  "text-[14px] px-3 py-2 outline-none transition-all duration-200 font-medium " +
  "focus:outline focus:outline-[2px] focus:outline-[#8B5E3C] focus:outline-offset-[2px] dark:focus:outline-[#B07C54] " +
  "disabled:bg-[#f5f5f5] dark:disabled:bg-[#3A2F27] disabled:text-text-secondary dark:disabled:text-[#857467] disabled:border-border dark:disabled:border-[#43352A] disabled:cursor-not-allowed appearance-none";

export const SEARCH_CLEAR_BUTTON =
  "absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center " +
  "justify-center rounded-sm text-text-secondary dark:text-[#BFAEA0] hover:text-text dark:hover:text-white " +
  "transition-colors cursor-pointer z-10";