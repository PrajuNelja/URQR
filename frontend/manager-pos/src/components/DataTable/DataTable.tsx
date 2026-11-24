// src/components/DataTable/DataTable.tsx

import type { DataTableProps, Column } from "./DataTable.types";
import { tableConfig, TABLE_ALIGN } from "./DataTable.config";
import { EmptyState } from "../DataCard/EmptyState";

function getRowKey<T>(
  row: T,
  index: number,
  rowKey: DataTableProps<T>["rowKey"]
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
}: DataTableProps<T>) { // <-- Removed minWidth
  const isClickable = typeof onRowClick === "function";

  const thPad = compact ? tableConfig.compact.th : "";
  const tdPad = compact ? tableConfig.compact.td : "";

  return (
    <div className={`${tableConfig.wrapper} ${className}`.trim()}>
      {/* Removed the inline style minWidth here */}
      <table className={tableConfig.table}>
        {/* Head */}
        <thead className={tableConfig.thead}>
          <tr>
            {columns.map((col: Column<T>) => (
              <th
                key={col.key}
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
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className={`${tableConfig.td} text-center text-text-muted py-10 border-b-0`}
              >
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0 border-b-0">
                <EmptyState message={emptyMessage} icon={emptyIcon} />
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
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
                      {col.render ? col.render(row, i) : getCellValue(row, col.key)}
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