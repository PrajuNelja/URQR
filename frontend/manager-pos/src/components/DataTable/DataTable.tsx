// src/components/DataTable/DataTable.tsx

// 1. Imports
import { dataTableConfig } from "./DataTable.config";
import type { DataTableProps } from "./DataTable.types";

// 2. Component
export function DataTable<T>({
  data,
  columns,
  rowKey,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  
  // 3. Handlers
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    return String(row[rowKey] || index);
  };

  // 4. Export / Return
  return (
    <div className={dataTableConfig.wrapper}>
      <table className={dataTableConfig.table}>
        {/* Table Header */}
        <thead className={dataTableConfig.thead}>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={dataTableConfig.th}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className={dataTableConfig.tbody}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={dataTableConfig.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)} className={dataTableConfig.tr}>
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`${dataTableConfig.td} ${col.className || ""}`}
                  >
                    {/* If a custom render function is provided, use it. Otherwise, show the raw value. */}
                    {col.render 
                      ? col.render(row) 
                      : String(row[col.key as keyof T] || "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}