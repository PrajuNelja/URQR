// src/components/DataTable/DataTable.types.ts
// All types for the DataTable folder: DataTable, QuantityStepper, DateRangePicker

import type { ReactNode } from "react";

// ═══════════════════════════════════════════
// DATA TABLE
// ═══════════════════════════════════════════

export type ColumnAlign = "left" | "center" | "right";
export type SortDirection = "asc" | "desc";

export interface Column<T> {
  /** Data key (or custom render key) */
  key: string;
  /** Column header label */
  header: string;
  /** Text alignment (default: 'left') */
  align?: ColumnAlign;
  /** Optional fixed width (e.g. "120px", "20%") */
  width?: string;
  /** Enable client-side sorting for this column */
  sortable?: boolean;
  /** Value used for sorting when the row value is not the desired sort key */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** Custom cell renderer — receives the row + index */
  render?: (row: T, index: number) => ReactNode;
  /** Extra classes for header cell */
  headerClassName?: string;
  /** Extra classes for body cell */
  cellClassName?: string;
}

export interface DataTableProps<T> {
  /** Row data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Row key accessor (property name or getter) */
  rowKey: keyof T | ((row: T) => string | number);
  /** Loading state */
  isLoading?: boolean;
  /** Empty message (default: 'No data found.') */
  emptyMessage?: string;
  /** Optional empty-state icon */
  emptyIcon?: ReactNode;
  /** Extra classes on outer wrapper */
  className?: string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Striped rows (default: false) */
  striped?: boolean;
  /** Compact padding (default: false) */
  compact?: boolean;
  /** Number of skeleton rows when isLoading is true (default: 5) */
  loadingRows?: number;
  /** Minimum width for the table (e.g. '980px') */
  minWidth?: string;
}

// ═══════════════════════════════════════════
// QUANTITY STEPPER (cart − 1 +)
// ═══════════════════════════════════════════

export interface QuantityStepperProps {
  /** Current quantity */
  value: number;
  /** Called with new quantity */
  onChange: (value: number) => void;
  /** Minimum (default: 1) */
  min?: number;
  /** Maximum (optional) */
  max?: number;
  /** Size preset (default: 'md') */
  size?: "sm" | "md";
  /** Disable all controls */
  disabled?: boolean;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// DATE RANGE PICKER (From / To)
// ═══════════════════════════════════════════

export interface DateRange {
  from: string; // ISO yyyy-mm-dd
  to: string; // ISO yyyy-mm-dd
}

export interface DateRangePickerProps {
  /** Current range */
  value: DateRange;
  /** Called when either date changes */
  onChange: (range: DateRange) => void;
  /** From label (default: 'From') */
  fromLabel?: string;
  /** To label (default: 'To') */
  toLabel?: string;
  /** Extra classes */
  className?: string;
}
