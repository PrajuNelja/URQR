import { useEffect, useMemo, useRef, useState } from "react";
import { MOCK_ORDERS } from "../../pages/Table_Management/Config/Dashboard.config";
import { downloadDashboardOrdersCsv } from "./DashboardOrdersExport";

interface DashboardOrdersTableProps {
  onSelectOrder?: (orderId: string) => void;
}

type PaymentFilterMode = "all" | "cash" | "upi" | "others";

interface FilterOption {
  mode: PaymentFilterMode;
  label: string;
  icon: string;
}

const filterOptions: FilterOption[] = [
  { mode: "all", label: "All", icon: "select_all" },
  { mode: "cash", label: "Cash", icon: "payments" },
  { mode: "upi", label: "UPI", icon: "smartphone" },
  { mode: "others", label: "Others", icon: "credit_card" },
];

export function DashboardOrdersTable({ onSelectOrder }: DashboardOrdersTableProps) {
  const [search, setSearch] = useState("");
  const [currentMode, setCurrentMode] = useState<PaymentFilterMode>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        dropdownBtnRef.current &&
        !dropdownBtnRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_ORDERS.filter((order) => {
      let matchesMode = true;
      const orderModeLower = order.paymentMode.toLowerCase();
      if (currentMode === "cash") {
        matchesMode = orderModeLower.includes("cash");
      } else if (currentMode === "upi") {
        matchesMode = orderModeLower.includes("upi");
      } else if (currentMode === "others") {
        matchesMode =
          orderModeLower.includes("card") ||
          orderModeLower.includes("other") ||
          (!orderModeLower.includes("cash") && !orderModeLower.includes("upi"));
      }

      const text = `${order.orderId} ${order.items} ${order.date} ${order.paymentMode} ${order.status}`.toLowerCase();
      const matchesSearch = query === "" || text.includes(query);

      return matchesMode && matchesSearch;
    });
  }, [currentMode, search]);

  const getPaymentDotColor = (paymentMode: string) => {
    const pm = paymentMode.toLowerCase();
    if (pm.includes("upi")) return "#5C3D26";
    if (pm.includes("card")) return "#8B5E3C";
    return "#A68B75"; // cash
  };

  const getPaymentLabel = (paymentMode: string) => {
    const pm = paymentMode.toLowerCase();
    if (pm.includes("upi")) return "UPI";
    if (pm.includes("card")) return "Card";
    return "Cash";
  };

  return (
    <div className="bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Top Section Header */}
      <div className="p-6 border-b border-[#E4D8C3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3
            className="text-xl font-bold text-[#3B2A1E]"
            style={{ fontFamily: "Newsreader, Georgia, serif" }}
          >
            Order Details
          </h3>
          <span
            id="ordersCountBadge"
            className="px-2.5 py-0.5 rounded-full bg-[#FAF3E6] border border-[#E4D8C3] font-ticket-mono text-xs font-bold text-[#8B5E3C]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {search.trim() === "" && currentMode === "all"
              ? "128 Orders"
              : filteredOrders.length === 1
              ? "1 Order"
              : `${filteredOrders.length} Orders`}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search + Filter Dropdown */}
          <div className="relative flex items-center" id="orderSearchFilterWrapper">
            <span className="material-symbols-outlined absolute left-3 text-[#7A6A5A] text-[18px] pointer-events-none">
              search
            </span>
            <input
              id="orderSearchInput"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Items..."
              className="h-9 pl-9 pr-8 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-xs text-[#3B2A1E] placeholder:text-[#7A6A5A] focus:outline-none focus:bg-[#FFFDF8] focus:border-[#8B5E3C] transition-all w-64"
            />
            <button
              ref={dropdownBtnRef}
              id="orderFilterDropdownBtn"
              type="button"
              aria-label="Filter payment modes"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((open) => !open)}
              className="absolute right-2 text-[#7A6A5A] hover:text-[#3B2A1E] flex items-center justify-center p-0.5 rounded cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
            </button>

            {/* Filter Dropdown Menu */}
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                id="orderFilterDropdown"
                className="absolute top-full right-0 mt-2 z-50 p-1.5 flex flex-col gap-1 bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-[0_10px_25px_-5px_rgba(59,42,30,0.18)] min-w-[200px]"
              >
                {filterOptions.map((opt) => {
                  const isSelected = currentMode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      data-mode={opt.mode}
                      onClick={() => {
                        setCurrentMode(opt.mode);
                        setDropdownOpen(false);
                      }}
                      className={`order-filter-item w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#3B2A1E] text-[#FFFFFF] font-semibold shadow-sm"
                          : "text-[#3B2A1E] hover:bg-[#FAF3E6] font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`material-symbols-outlined text-[17px] ${
                            isSelected ? "text-white" : "text-[#7A6A5A]"
                          }`}
                        >
                          {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[15px] check-mark">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={() => downloadDashboardOrdersCsv(MOCK_ORDERS)}
            className="h-9 px-4 bg-[#5C3D26] hover:bg-[#3B2A1E] text-[#FFFFFF] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FAF3E6] text-[#7A6A5A] text-[11px] uppercase tracking-wider border-b border-[#E4D8C3]">
            <tr>
              <th className="py-3 px-4 font-bold">Date</th>
              <th className="py-3 px-4 font-bold">Time</th>
              <th className="py-3 px-4 font-bold">Order ID</th>
              <th className="py-3 px-4 font-bold">Items</th>
              <th className="py-3 px-4 font-bold text-right">Before Tax</th>
              <th className="py-3 px-4 font-bold text-right">After Tax</th>
              <th className="py-3 px-4 font-bold">Payment Mode</th>
              <th className="py-3 px-4 font-bold text-center">Status</th>
              <th className="py-3 px-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody
            id="orderTableBody"
            className="divide-y divide-[#E4D8C3]/60 text-xs text-[#3B2A1E]"
          >
            {filteredOrders.length === 0 ? (
              <tr id="orderEmptyStateRow">
                <td className="py-8 px-4 text-center" colSpan={9}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-[#7A6A5A]/70">
                      search_off
                    </span>
                    <span className="text-sm font-semibold text-[#7A6A5A]">
                      No orders found for this payment mode.
                    </span>
                    <span className="text-xs text-[#7A6A5A]/60">
                      Try clearing the search query or switching back to 'All'.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isCancelled = order.status.toLowerCase() === "cancelled";
                return (
                  <tr
                    key={order.orderId}
                    data-order-id={order.orderId}
                    data-mode={order.paymentMode.toLowerCase()}
                    onClick={() => onSelectOrder?.(order.orderId)}
                    className="order-table-row hover:bg-[#FAF3E6]/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 whitespace-nowrap font-medium">
                      {order.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#7A6A5A]">
                      {order.time}
                    </td>
                    <td
                      className="py-3 px-4 whitespace-nowrap font-ticket-mono font-bold text-[#5C3D26]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#3B2A1E]">
                      {order.items}
                    </td>
                    <td
                      className="py-3 px-4 whitespace-nowrap text-right font-ticket-mono text-[#7A6A5A]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {order.beforeTax}
                    </td>
                    <td
                      className="py-3 px-4 whitespace-nowrap text-right font-ticket-mono font-bold text-[#3B2A1E]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {order.afterTax}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF3E6] border border-[#E4D8C3] text-[11px] font-medium text-[#7A6A5A]">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: getPaymentDotColor(order.paymentMode),
                          }}
                        />
                        {getPaymentLabel(order.paymentMode)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                          isCancelled
                            ? "bg-[#FDF1E1] border-[#B91C1C]/20 text-[#B91C1C]"
                            : "bg-[#EEF3E8] border-[#3F6B3A]/20 text-[#3F6B3A]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCancelled ? "bg-[#B91C1C]" : "bg-[#3F6B3A]"
                          }`}
                        />
                        {isCancelled ? "Cancelled" : "Completed"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        data-order-id={order.orderId}
                        title="View Order Check"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder?.(order.orderId);
                        }}
                        className="view-order-btn w-7 h-7 rounded hover:bg-[#FAF3E6] text-[#7A6A5A] hover:text-[#5C3D26] inline-flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          visibility
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#E4D8C3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#7A6A5A]">
        <div>
          Showing{" "}
          <span className="font-bold text-[#3B2A1E]" id="paginationShowingRange">
            {filteredOrders.length > 0 ? `1–${filteredOrders.length}` : "0"}
          </span>{" "}
          of{" "}
          <span className="font-bold text-[#3B2A1E]" id="paginationTotalCount">
            128
          </span>{" "}
          recorded transactions
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="px-2.5 py-1 rounded border border-[#E4D8C3] bg-[#FAF3E6] hover:bg-[#FFFDF8] text-[#7A6A5A] hover:text-[#3B2A1E] transition-colors cursor-pointer text-xs font-semibold"
          >
            Previous
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded bg-[#5C3D26] text-[#FFFFFF] font-bold text-xs shadow-sm"
          >
            1
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded border border-[#E4D8C3] bg-[#FFFDF8] hover:bg-[#FAF3E6] text-[#3B2A1E] font-semibold text-xs transition-colors cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded border border-[#E4D8C3] bg-[#FFFDF8] hover:bg-[#FAF3E6] text-[#3B2A1E] font-semibold text-xs transition-colors cursor-pointer"
          >
            3
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded border border-[#E4D8C3] bg-[#FAF3E6] hover:bg-[#FFFDF8] text-[#7A6A5A] hover:text-[#3B2A1E] transition-colors cursor-pointer text-xs font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
