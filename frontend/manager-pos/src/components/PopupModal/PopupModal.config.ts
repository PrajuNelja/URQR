// src/components/PopupModal/PopupModal.config.ts
import type { PopupModalSize } from "./PopupModal.types";

export const MODAL_BACKDROP =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A1E]/55 backdrop-blur-sm animate-[fadeIn_150ms_cubic-bezier(0.16,1,0.3,1)]";

export const MODAL_PANEL_BASE =
  "w-full bg-surface rounded-2xl shadow-[0_8px_32px_rgba(59,42,30,0.25)] flex flex-col overflow-hidden animate-[modalIn_180ms_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] focus:outline-none";

export const MODAL_SIZES: Record<PopupModalSize, string> = {
  sm: "max-w-sm min-w-[300px]",
  md: "max-w-md min-w-[400px]",
  lg: "max-w-2xl min-w-[500px]",
  xl: "max-w-4xl min-w-[600px]",
};

// Header & Footer with distinct background tint and clean separator borders
export const MODAL_HEADER =
  "pos-modal-header flex items-center justify-between gap-4 px-6 py-3.5 bg-surface-alt border-b border-border shrink-0 dark:bg-[#1A130D] dark:border-[#382B20]";

export const MODAL_TITLE =
  "pos-modal-title font-sans text-base sm:text-lg font-bold text-text dark:text-[#F5EEE0] m-0 truncate";

// Prominent, tactile circular close button cleanly aligned inside header
export const MODAL_CLOSE_BTN =
  "pos-modal-close-btn w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-[#D8C7B0] bg-surface hover:bg-surface-alt active:scale-95 text-[#4A382A] shadow-xs dark:bg-[#251D17] dark:border-[#4A3728] dark:text-[#E8DEC8] dark:hover:bg-[#32271F] dark:hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0";

// Body: flex-1 fills the space
export const MODAL_BODY = 
  "px-6 py-4 overflow-y-auto bg-surface grow flex flex-col";

// Distinct footer background and top border for clear visual separation
export const MODAL_FOOTER =
  "pos-modal-footer flex items-center justify-end gap-3 px-6 py-3.5 bg-surface-alt border-t border-border shrink-0 dark:bg-[#1A130D] dark:border-[#382B20]";

// ═══════════════════════════════════════════
// RECEIPT (Thermal Paper Style)
// ═══════════════════════════════════════════
export const RECEIPT_WRAPPER = "print-receipt w-full flex justify-center py-4";

export const receiptConfig = {
  paper:
    "bg-[#FEFDF8] text-[#4A2C25] rounded-md w-full max-w-[420px] p-8 " +
    "shadow-sm border border-[#ECDCC3] font-sans text-sm leading-relaxed",
  businessName: "font-sans text-[24px] font-bold text-center m-0 uppercase tracking-wide",
  businessMeta: "text-center text-[#7A6F68] text-[13px] mt-1.5 mb-3.5",
  title:
    "text-center font-bold uppercase pb-3.5 border-b border-dashed border-[#ECDCC3] mb-3.5 tracking-wide text-[13px]",
  infoGrid:
    "grid grid-cols-2 gap-2.5 pb-3.5 border-b border-[#ECDCC3] text-[13px]",
  infoLabel: "text-[11px] font-bold text-[#7A6F68] uppercase",
  infoValue: "m-0 font-medium",
  table: "w-full border-collapse mt-1.5",
  th: "text-left font-bold py-2",
  td: "text-left py-2 border-t border-[#F3EAD9]",
  rowLastTdBorder: "border-b border-[#ECDCC3]",
  totalsWrap: "mt-2.5 ml-auto w-[64%]",
  totalsRow: "flex justify-between py-1",
  totalsFinal:
    "flex justify-between border-t border-[#ECDCC3] mt-1.5 pt-2.5 font-extrabold text-[18px]",
  thanks: "text-center text-[#7A6F68] text-[13px] mt-4.5",
  reprint: "text-center text-[#7A6F68] text-xs mt-1",
} as const;