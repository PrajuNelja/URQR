// src/components/DataTable/DataTable.types.ts

import type { ReactNode } from "react";


export interface Column<T> {
  /** The key in the data object (e.g., 'id', 'name', 'date') */
  key: keyof T | string;
  /** The text to show in the table header */
  header: string;
  /** Optional custom renderer (e.g., to render a StatusBadge or a Button) */
  render?: (row: T) => ReactNode;
  /** Optional custom class for the column cells */
  className?: string;
}

export interface DataTableProps<T> {
  /** The array of data objects to display */
  data: T[];
  /** The column configuration */
  columns: Column<T>[];
  /** A unique key for each row (e.g., 'id') */
  rowKey: keyof T | ((row: T) => string);
  /** Message to show when there is no data */
  emptyMessage?: string;
}