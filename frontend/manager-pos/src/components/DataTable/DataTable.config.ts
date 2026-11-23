// src/components/DataTable/DataTable.config.ts
// All configs for the DataTable folder: DataTable, QuantityStepper, DateRangePicker

// ═══════════════════════════════════════════
// DATA TABLE
// ═══════════════════════════════════════════

export const tableConfig = {
  /** Outer wrapper */
  wrapper:
    "block w-full max-w-full overflow-x-auto rounded-lg border border-[#e8d9bf] bg-[#fffaf1] shadow-[0_2px_0_#e5d7bf] align-top",

  /** Table element */
  table: "w-full min-w-[980px] border-collapse text-sm text-left whitespace-nowrap",

  /** Header row */
  thead: "bg-[#f8f1e4]",

  /** Header cell */
  th: "font-semibold text-text-muted text-[12px] px-4 py-3 border-b border-[#e8d9bf]",

  /** Body cell */
  td: "px-4 py-3.5 border-b border-[#eee4d3] text-primary text-[13px]",

  /** Last row shouldn't have a bottom border */
  trLast: "border-b-0",

  /** Row base */
  tr: "transition-colors",

  /** Row hover */
  trHover: "hover:bg-[#f7f0e3]",

  /** Striped rows */
  trStriped: "bg-[#fbf6eb]",

  /** Compact padding */
  compact: {
    th: "px-3 py-2",
    td: "px-3 py-2",
  },

  /** Clickable row */
  trClickable: "cursor-pointer",
} as const;

// ═══════════════════════════════════════════
// TABLE ALIGNMENT
// ═══════════════════════════════════════════

export const TABLE_ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

// ═══════════════════════════════════════════
// QUANTITY STEPPER
// ═══════════════════════════════════════════

export const quantityStepperConfig = {
  wrapper: "flex items-center gap-2 font-bold text-primary",

  button:
    "flex items-center justify-center border border-border-subtle rounded-md " +
    "bg-transparent text-primary transition-all duration-200 " +
    "hover:border-accent-gold hover:text-accent-gold " +
    "disabled:opacity-40 disabled:cursor-not-allowed",

  value: "min-w-[24px] text-center select-none tabular-nums",

  sizes: {
    sm: {
      button: "w-6 h-6",
      value: "text-xs",
    },
    md: {
      button: "w-7 h-7",
      value: "text-sm",
    },
  },
} as const;

// ═══════════════════════════════════════════
// DATE RANGE PICKER
// ═══════════════════════════════════════════

export const dateRangePickerConfig = {
  wrapper:
    "flex items-center gap-2 px-3 py-2 bg-[#fffaf1] border border-[#e8d9bf] rounded-md shadow-[0_2px_0_#e5d7bf]",

  group: "flex items-center gap-1.5",

  label: "text-[11px] font-semibold text-text-muted m-0",
} as const;