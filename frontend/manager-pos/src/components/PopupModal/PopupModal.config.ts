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

// NO BORDERS (removed border-b)
export const MODAL_HEADER =
  "flex items-center justify-between gap-4 px-6 pt-5 pb-2 bg-surface shrink-0";

export const MODAL_TITLE =
  "font-sans text-lg font-semibold text-text m-0 truncate";

// Bigger button area (w-10 h-10) so the X icon never squishes
export const MODAL_CLOSE_BTN =
  "w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-text hover:bg-surface-alt transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary";

// Body: flex-1 fills the space
export const MODAL_BODY = 
  "px-6 py-4 overflow-y-auto bg-surface grow flex flex-col";

// NO BORDERS (removed border-t), nice bottom padding
export const MODAL_FOOTER =
  "flex items-center justify-end gap-3 px-6 pt-2 pb-6 bg-surface shrink-0";

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