// src/components/PopupModal/PopupModal.config.ts
import type { PopupModalSize } from "./PopupModal.types";

// ═══════════════════════════════════════════
// POPUP MODAL
// ═══════════════════════════════════════════

// Spec: Overlay bg #3B2A1E/55, backdrop blur 4px
export const MODAL_BACKDROP =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A1E]/55 backdrop-blur-sm animate-[fadeIn_150ms_cubic-bezier(0.16,1,0.3,1)]";

// Spec: Content bg-surface, rounded-xl (12px), max-w-md by default
export const MODAL_PANEL_BASE =
  "!w-full bg-surface border border-border rounded-xl shadow-[0_8px_24px_rgba(59,42,30,0.20)] flex flex-col overflow-hidden animate-[modalIn_180ms_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh]";

export const MODAL_SIZES: Record<PopupModalSize, string> = {
  sm: "!max-w-sm min-w-[300px]",
  md: "!max-w-md min-w-[400px]",
  lg: "!max-w-2xl min-w-[500px]",
  xl: "!max-w-4xl min-w-[600px]",
};

export const MODAL_HEADER =
  "flex items-center justify-between gap-3 px-6 py-4 border-b border-border bg-surface shrink-0";

// Spec: 18px Semi Bold (no serif)
export const MODAL_TITLE =
  "font-sans text-lg font-semibold text-text m-0 truncate";

export const MODAL_CLOSE_BTN =
  "w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:text-text hover:bg-surface-alt transition-colors shrink-0";

export const MODAL_BODY = "p-6 overflow-y-auto bg-surface grow";

export const MODAL_FOOTER =
  "flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface shrink-0";

// ═══════════════════════════════════════════
// RECEIPT (Thermal Paper Style)
// ═══════════════════════════════════════════

export const RECEIPT_WRAPPER = "print-receipt w-full flex justify-center py-4";

// Kept the specific receipt paper colors (warm off-white) because it mimics thermal paper
export const receiptConfig = {
  paper:
    "bg-[#FEFDF8] text-[#4A2C25] rounded-md w-full max-w-[420px] p-8 " +
    "shadow-lg border border-[#ECDCC3] font-sans text-sm leading-relaxed",

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