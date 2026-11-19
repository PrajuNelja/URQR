// src/components/PopupModal/PopupModal.config.ts

import type { PopupModalSize } from "./PopupModal.types";

// ═══════════════════════════════════════════
// POPUP MODAL
// ═══════════════════════════════════════════

export const MODAL_BACKDROP =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]";

// Added !w-full, explicit min-widths, and block display to stop the flex squishing
export const MODAL_PANEL_BASE =
  "!w-full bg-surface border border-border-subtle rounded-lg shadow-lg flex flex-col overflow-hidden animate-[modalIn_0.25s_ease-out] max-h-[90vh]";

export const MODAL_SIZES: Record<PopupModalSize, string> = {
  sm: "!max-w-sm min-w-[300px]",
  md: "!max-w-md min-w-[400px]",
  lg: "!max-w-2xl min-w-[500px]",
  xl: "!max-w-4xl min-w-[600px]",
};

export const MODAL_HEADER =
  "flex items-center justify-between gap-3 px-6 py-4 border-b border-border-subtle bg-surface shrink-0";

export const MODAL_TITLE =
  "font-serif text-xl font-semibold text-primary m-0 truncate";

export const MODAL_CLOSE_BTN =
  "w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:text-primary hover:bg-app-bg transition-colors shrink-0";

export const MODAL_BODY = "p-6 overflow-y-auto bg-app-bg grow";

export const MODAL_FOOTER =
  "flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle bg-surface shrink-0";

// ═══════════════════════════════════════════
// RECEIPT
// ═══════════════════════════════════════════

export const RECEIPT_WRAPPER = "print-receipt w-full flex justify-center py-4";

export const receiptConfig = {
  paper:
    "bg-[#FEFDF8] text-[#4A2C25] rounded-md w-full max-w-[420px] p-8 " +
    "shadow-lg border border-[#ECDCC3] font-sans text-sm leading-relaxed",

  businessName: "font-serif text-[28px] font-bold text-center m-0",
  businessMeta: "text-center text-[#7A6F68] text-[13px] mt-1.5 mb-3.5",
  title:
    "text-center font-bold uppercase pb-3.5 border-b border-dashed border-[#ECDCC3] mb-3.5 tracking-wide",
  infoGrid:
    "grid grid-cols-2 gap-2.5 pb-3.5 border-b border-[#ECDCC3] text-[13px]",
  infoLabel: "text-[11px] font-bold text-[#7A6F68] uppercase",
  infoValue: "m-0",
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