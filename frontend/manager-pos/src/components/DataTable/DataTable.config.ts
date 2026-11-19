// src/components/DataTable/DataTable.config.ts
// All configs for the DataTable folder: DataTable, QuantityStepper, DateRangePicker

// ═══════════════════════════════════════════
// DATA TABLE
// ═══════════════════════════════════════════

export const tableConfig = {
  /** Outer wrapper — inline-block so it hugs the table width */
  wrapper:
    "inline-block max-w-full overflow-x-auto rounded-md border border-border-subtle bg-surface shadow-ivory align-top",

  /** Table element */
  table: "border-collapse text-sm text-left whitespace-nowrap",

  /** Header row */
  thead: "bg-[#FCFAF8]",

  /** Header cell */
  th: "font-semibold text-text-muted text-[11px] uppercase tracking-wider px-4 py-3 border-b border-border-subtle",

  /** Body cell */
  td: "px-4 py-3.5 border-b border-border-subtle text-primary text-[13px]",

  /** Last row shouldn't have a bottom border */
  trLast: "border-b-0",

  /** Row base */
  tr: "transition-colors",

  /** Row hover */
  trHover: "hover:bg-app-bg/40",

  /** Striped rows */
  trStriped: "bg-app-bg/20",

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
    "flex items-center gap-2 px-3 py-2 bg-surface border border-border-subtle rounded-md",

  group: "flex items-center gap-1.5",

  label: "text-[11px] font-bold tracking-[0.1em] text-text-muted uppercase m-0",
} as const;