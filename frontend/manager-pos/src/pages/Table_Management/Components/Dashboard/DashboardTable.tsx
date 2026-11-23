// src/pages/Table_Management/Components/Dashboard/DashboardTable.tsx
import { useState } from "react";
import { Card } from "../../../../components/DataCard/Card";
import { SearchInput } from "../../../../components/InputField/SearchInput";
import { Button } from "../../../../components/Buttons/Button";
import { Icon } from "../../../../components/DataCard/Icon";
import { DataTable } from "../../../../components/DataTable/DataTable";
import { StatusBadge } from "../../../../components/StatusBadge/StatusBadge";
import { IconButton } from "../../../../components/Buttons/IconButton";
import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Receipt } from "../../../../components/PopupModal/Receipt";
import type { OrderData } from "../../Types/Dashboard.types";

interface Props {
  filteredOrders: OrderData[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const DashboardTable = ({
  filteredOrders,
  searchQuery,
  setSearchQuery,
}: Props) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // --- CSV DOWNLOAD LOGIC ---
  const handleDownloadCSV = () => {
    const headers = [
      "Date", "Time", "Order ID", "Items", "Before Tax", "After Tax", "Payment Mode", "Status",
    ];

    const csvRows = filteredOrders.map((order) => {
      // Fix the Date: Convert "18 Nov 2026" to "18-11-2026" so Excel reads it as a real date
      const dateParts = order.date.split(" ");
      const monthMap: Record<string, string> = {
        Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
        Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
      };
      const formattedDate = `${dateParts[0]}-${monthMap[dateParts[1]] || "01"}-${dateParts[2]}`;

      // Return row with all text wrapped in quotes to prevent Excel errors
      return [
        `"${formattedDate}"`,
        `"${order.time}"`,
        `"${order.orderId}"`,
        `"${order.items}"`,
        `"${order.beforeTax}"`,
        `"${order.afterTax}"`,
        `"${order.paymentMode}"`,
        `"${order.status}"`,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Add UTF-8 BOM ("\uFEFF") to fix the Rupee symbol (₹) in Excel
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "orderId", header: "Order ID" },
    { key: "items", header: "Items" },
    { key: "beforeTax", header: "Before Tax" },
    { key: "afterTax", header: "After Tax" },
    { key: "paymentMode", header: "Payment Mode" },
    {
      key: "status",
      header: "Status",
      render: (row: OrderData) => <StatusBadge status={row.status} />,
    },
    {
      key: "receipt",
      header: "Receipt",
      align: "center" as const,
      render: (row: OrderData) => (
        <IconButton
          variant="outline"
          size="sm"
          label="View Receipt"
          icon={<Icon name="Eye" size="sm" />}
          onClick={() => setSelectedOrder(row)}
        />
      ),
    },
  ];

  return (
    <Card padding="lg" className="shadow-ivory">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <h2 className="font-serif text-xl text-primary m-0">Order Details</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-[320px]">
            <SearchInput
              placeholder="Search by Order ID, Items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              className="shadow-none"
            />
          </div>
          <div className="flex-none">
            <Button
              variant="primary"
              className="!p-0 !w-10 !h-10 !bg-primary !text-button-text hover:!brightness-110 rounded-md flex items-center justify-center"
              title="Download CSV"
              onClick={handleDownloadCSV}
            >
              <Icon name="Download" size="md" />
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        data={filteredOrders}
        columns={columns}
        rowKey="id"
        striped={false}
        className="!w-full !max-w-none !border-none !shadow-none !bg-transparent [&>table]:w-full [&>table]:border-collapse"
      />

      <PopupModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Receipt"
        size="md"
        footer={
          <Button variant="primary" onClick={() => window.print()}>
            Print Receipt
          </Button>
        }
      >
        {selectedOrder && (
          <Receipt
            business={{
              name: "Grand Horizon",
              address: "18 Harbour View Road",
              phone: "+91 98765 43210",
              email: "dining@grandhorizon.example",
            }}
            orderId={selectedOrder.orderId}
            date={selectedOrder.date}
            time={selectedOrder.time}
            items={[{ name: selectedOrder.items, price: 820, quantity: 1 }]}
            subtotal={parseFloat(selectedOrder.beforeTax.replace("₹", ""))}
            taxRate={10}
            tax={
              parseFloat(selectedOrder.afterTax.replace("₹", "")) -
              parseFloat(selectedOrder.beforeTax.replace("₹", ""))
            }
            total={parseFloat(selectedOrder.afterTax.replace("₹", ""))}
            paymentMethod={selectedOrder.paymentMode}
          />
        )}
      </PopupModal>
    </Card>
  );
};