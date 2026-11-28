// src/components/DataTable/DataTable.tsx

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { DataTableProps, Column, SortDirection } from "./DataTable.types";
import { tableConfig, TABLE_ALIGN } from "./DataTable.config";
import { EmptyState } from "../DataCard/EmptyState";

function getRowKey<T>(
  row: T,
  index: number,
  rowKey: DataTableProps<T>["rowKey"],
): string | number {
  if (typeof rowKey === "function") return rowKey(row);
  const v = (row as Record<string, unknown>)[rowKey as string];
  return (v as string | number) ?? index;
}

function getCellValue<T>(row: T, key: string): React.ReactNode {
  const v = (row as Record<string, unknown>)[key];
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number") return v;
  return String(v);
}

function getSortValue<T>(
  row: T,
  column: Column<T>,
): string | number | Date | null | undefined {
  if (column.sortValue) return column.sortValue(row);
  const value = (row as Record<string, unknown>)[column.key];
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date ||
    value === null ||
    value === undefined
  ) {
    return value;
  }
  return String(value);
}

function compareSortValues(
  left: string | number | Date | null | undefined,
  right: string | number | Date | null | undefined,
): number {
  if (left == null) return right == null ? 0 : 1;
  if (right == null) return -1;

  const leftValue = left instanceof Date ? left.getTime() : left;
  const rightValue = right instanceof Date ? right.getTime() : right;

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return leftValue - rightValue;
  }

  return String(leftValue).localeCompare(String(rightValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  emptyMessage = "No data found.",
  emptyIcon,
  className = "",
  onRowClick,
  striped = false,
  compact = false,
  loadingRows = 5,
  minWidth = "980px",
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);
  const isClickable = typeof onRowClick === "function";

  const thPad = compact ? tableConfig.compact.th : "";
  const tdPad = compact ? tableConfig.compact.td : "";
  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((candidate) => candidate.key === sort.key);
    if (!column) return data;

    return data
      .map((row, index) => ({ row, index }))
      .sort((left, right) => {
        const leftValue = getSortValue(left.row, column);
        const rightValue = getSortValue(right.row, column);
        const comparison = compareSortValues(leftValue, rightValue);
        return comparison === 0
          ? left.index - right.index
          : leftValue == null || rightValue == null || sort.direction === "asc"
            ? comparison
            : -comparison;
      })
      .map(({ row }) => row);
  }, [columns, data, sort]);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    setSort((current) => ({
      key: column.key,
      direction:
        current?.key === column.key && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <div className={`${tableConfig.wrapper} ${className}`.trim()}>
      {isLoading && (
        <span className="sr-only" role="status">
          Loading table data
        </span>
      )}
      <table
        className={tableConfig.table}
        style={{ minWidth }}
        aria-busy={isLoading}
      >
        {/* Head */}
        <thead className={tableConfig.thead}>
          <tr>
            {columns.map((col: Column<T>) => (
              <th
                key={col.key}
                aria-sort={
                  col.sortable && sort?.key === col.key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : col.sortable
                      ? "none"
                      : undefined
                }
                className={[
                  tableConfig.th,
                  thPad,
                  TABLE_ALIGN[col.align ?? "left"],
                  col.headerClassName ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    aria-label={`Sort by ${col.header}`}
                    className={tableConfig.sortButton}
                    onClick={() => handleSort(col)}
                  >
                    {col.header}
                    {sort?.key === col.key ? (
                      sort.direction === "asc" ? (
                        <ArrowUp size={14} aria-hidden="true" />
                      ) : (
                        <ArrowDown size={14} aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown size={14} aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            Array.from({ length: loadingRows }, (_, rowIndex) => (
              <tr key={`loading-${rowIndex}`} aria-hidden="true">
                {columns.map((col, columnIndex) => (
                  <td
                    key={col.key}
                    className={[
                      tableConfig.td,
                      tdPad,
                      TABLE_ALIGN[col.align ?? "left"],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span
                      className={`block h-4 animate-pulse rounded bg-[#eee4d3] ${
                        columnIndex % 3 === 0 ? "w-3/4" : "w-1/2"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0 border-b-0">
                <EmptyState message={emptyMessage} icon={emptyIcon} />
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => {
              const key = getRowKey(row, i, rowKey);
              const isStriped = striped && i % 2 === 1;
              const isLast = i === data.length - 1;

              return (
                <tr
                  key={key}
                  className={[
                    tableConfig.tr,
                    tableConfig.trHover,
                    isStriped ? tableConfig.trStriped : "",
                    isClickable ? tableConfig.trClickable : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={isClickable ? () => onRowClick?.(row, i) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        tableConfig.td,
                        tdPad,
                        TABLE_ALIGN[col.align ?? "left"],
                        isLast ? tableConfig.trLast : "",
                        col.cellClassName ?? "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {col.render
                        ? col.render(row, i)
                        : getCellValue(row, col.key)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
