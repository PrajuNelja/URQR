import type { OrderData } from "../../pages/Table_Management/Types/Dashboard.types";

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function downloadDashboardOrdersCsv(orders: OrderData[]) {
  const rows = [
    [
      "Date",
      "Time",
      "Order ID",
      "Items",
      "Before Tax",
      "After Tax",
      "Payment Mode",
      "Status",
    ],
    ...orders.map((order) => [
      order.date,
      order.time,
      order.orderId,
      order.items,
      order.beforeTax,
      order.afterTax,
      order.paymentMode,
      order.status,
    ]),
  ];
  const content = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard_orders_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
