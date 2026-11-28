import { useEffect, useState } from "react";
import type { OrderDetail } from "../../pages/Table_Management/Types/Dashboard.types";

interface DashboardOrderDrawerProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardOrderDrawer({
  order,
  isOpen,
  onClose,
}: DashboardOrderDrawerProps) {
  const [rendered, setRendered] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  if (isOpen && !rendered) {
    setRendered(true);
  }

  useEffect(() => {
    let animTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      animTimer = setTimeout(() => setVisible(true), 10);
    } else {
      animTimer = setTimeout(() => setVisible(false), 0);
      closeTimer = setTimeout(() => setRendered(false), 300);
    }

    return () => {
      clearTimeout(animTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!rendered || !order) return null;

  const isCancelled = order.status === "Cancelled";

  return (
    <div
      id="orderDrawerBackdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawerOrderId"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Dimmed & subtle blur backdrop overlay */}
      <div
        id="orderDrawerOverlay"
        onClick={onClose}
        className={`absolute inset-0 bg-[#3B2A1E]/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          id="orderDrawerPanel"
          className={`w-screen max-w-[520px] bg-[#FFFDF8] border-l border-[#E4D8C3] shadow-[-8px_0_30px_rgba(59,42,30,0.15)] flex flex-col justify-between transform transition-transform duration-300 ease-out ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Top Drawer Header */}
          <div className="px-6 py-5 border-b border-[#E4D8C3] bg-[#FFFDF8] sticky top-0 z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-ticket-mono text-xl font-bold text-[#5C3D26] tracking-tight"
                    id="drawerOrderId"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {order.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
                      isCancelled
                        ? "bg-[#FDF1E1] border-[#B91C1C]/25 text-[#B91C1C]"
                        : "bg-[#EEF3E8] border-[#3F6B3A]/25 text-[#3F6B3A]"
                    }`}
                    id="drawerStatusBadge"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCancelled ? "bg-[#B91C1C]" : "bg-[#3F6B3A]"
                      }`}
                    />
                    <span>{order.status}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#7A6A5A] font-label-md">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#8B5E3C]">
                      schedule
                    </span>
                    <span>{order.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-[#3B2A1E]">
                    {order.service}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                id="closeOrderDrawerBtn"
                onClick={onClose}
                aria-label="Close Order Detail Drawer"
                className="w-8 h-8 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#7A6A5A] hover:text-[#3B2A1E] hover:bg-[#E4D8C3]/40 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Meta Badges Strip */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#E4D8C3]/60 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF3E6]/70 border border-[#E4D8C3]/70 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#7A6A5A] tracking-wider">
                  Payment
                </span>
                <span className="font-bold text-[#3B2A1E] truncate mt-0.5 flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: order.paymentColor || "#5C3D26" }}
                  />
                  {order.paymentMode}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF3E6]/70 border border-[#E4D8C3]/70 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#7A6A5A] tracking-wider">
                  Terminal
                </span>
                <span
                  className="font-ticket-mono text-[11px] font-semibold text-[#3B2A1E] truncate mt-0.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {order.terminal}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF3E6]/70 border border-[#E4D8C3]/70 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#7A6A5A] tracking-wider">
                  Token / Check
                </span>
                <span
                  className="font-ticket-mono text-[11px] font-bold text-[#8B5E3C] truncate mt-0.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {order.token}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {/* Staff & Customer Section */}
            <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#5C3D26] text-[#FFFFFF] flex items-center justify-center font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#7A6A5A] tracking-wider">
                    Captain / Cashier
                  </span>
                  <span className="font-bold text-[#3B2A1E]">{order.cashier}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[#3F6B3A] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#3F6B3A]" />
                <span>Register Reconciled</span>
              </div>
            </div>

            {/* Itemized List Header */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-title-md text-sm font-bold text-[#3B2A1E] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#8B5E3C]">
                    restaurant_menu
                  </span>
                  Ordered Items ({order.items.length})
                </h4>
                <span
                  className="text-[11px] font-ticket-mono text-[#7A6A5A]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Qty × Rate = Total
                </span>
              </div>

              {/* Items Table / Container */}
              <div
                className="border border-[#E4D8C3] rounded-xl overflow-hidden divide-y divide-[#E4D8C3]/70 bg-[#FFFDF8]"
                id="drawerItemsList"
              >
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex items-start justify-between gap-3 hover:bg-[#FAF3E6]/40 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#3B2A1E]">
                          {item.name}
                        </span>
                        <span
                          className="px-1.5 py-0.2 rounded bg-[#FAF3E6] border border-[#E4D8C3] text-[10px] font-bold text-[#8B5E3C]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          ×{item.qty}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-[#7A6A5A] italic">
                          {item.note}
                        </p>
                      )}
                      <span
                        className="text-[10px] text-[#7A6A5A]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Rate: {item.rate} each
                      </span>
                    </div>
                    <div
                      className="text-right font-ticket-mono"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <span className="font-bold text-xs text-[#3B2A1E]">
                        {item.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary / Tax Breakdown Ledger */}
            <div className="p-4 rounded-xl bg-[#FAF3E6]/90 border border-[#E4D8C3] flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7A6A5A] font-medium">
                  Subtotal (Net Items)
                </span>
                <span
                  className="font-ticket-mono font-bold text-[#3B2A1E]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {order.subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#7A6A5A]">
                <span className="flex items-center gap-1.5">
                  <span>CGST (2.5%)</span>
                  <span
                    className="text-[10px] px-1 rounded bg-[#FFFDF8] border border-[#E4D8C3]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    2.5%
                  </span>
                </span>
                <span
                  className="font-ticket-mono text-[#3B2A1E]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {order.cgst}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#7A6A5A]">
                <span className="flex items-center gap-1.5">
                  <span>SGST (2.5%)</span>
                  <span
                    className="text-[10px] px-1 rounded bg-[#FFFDF8] border border-[#E4D8C3]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    2.5%
                  </span>
                </span>
                <span
                  className="font-ticket-mono text-[#3B2A1E]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {order.sgst}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#7A6A5A]">
                <span className="flex items-center gap-1.5">
                  <span>Service Charge (5%)</span>
                  <span
                    className="text-[10px] px-1 rounded bg-[#FFFDF8] border border-[#E4D8C3]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Hospitality
                  </span>
                </span>
                <span
                  className="font-ticket-mono text-[#3B2A1E]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {order.serviceCharge}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#7A6A5A]">
                <span>Round Off</span>
                <span
                  className="font-ticket-mono text-[#7A6A5A]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ₹0.00
                </span>
              </div>

              {/* Highlighted Grand Total Box */}
              <div className="pt-3 mt-1 border-t border-[#E4D8C3] flex items-center justify-between p-3 rounded-lg bg-[#FFFDF8] border border-[#8B5E3C]/30 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-bold text-[#5C3D26] tracking-wider">
                    Grand Total (After Tax)
                  </span>
                  <span className="text-[11px] text-[#7A6A5A]">
                    Inclusive of all statutory levies
                  </span>
                </div>
                <span
                  className="font-ticket-mono text-2xl font-bold text-[#5C3D26]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {order.grandTotal}
                </span>
              </div>
            </div>

            {/* Audit & Session Footnote */}
            <div className="p-3 rounded-lg bg-[#FAF3E6]/40 border border-dashed border-[#E4D8C3] flex items-center gap-2.5 text-[11px] text-[#7A6A5A]">
              <span className="material-symbols-outlined text-[18px] text-[#8B5E3C]">
                verified
              </span>
              <span>
                Invoice authenticated digitally under URQR POS fiscal ledger.
                Settlement timestamp synchronized.
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-[#E4D8C3] bg-[#FFFDF8] flex flex-col gap-2.5 sticky bottom-0 z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="drawerPrintBtn"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 bg-[#5C3D26] hover:bg-[#3B2A1E] text-[#FFFFFF] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">print</span>
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                id="drawerInvoiceBtn"
                onClick={() => alert("Tax Invoice PDF prepared for download.")}
                className="flex-1 py-2.5 px-4 bg-[#FAF3E6] hover:bg-[#E4D8C3]/50 text-[#3B2A1E] border border-[#E4D8C3] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-[#8B5E3C]">
                  description
                </span>
                <span>Tax Invoice PDF</span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                id="drawerVoidBtn"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to void this transaction check? Manager PIN required.",
                    )
                  ) {
                    alert("Void request routed for manager authorization.");
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#B91C1C] hover:bg-[#FDF1E1] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">block</span>
                <span>Refund / Void Check</span>
              </button>
              <button
                type="button"
                id="drawerDismissBtn"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#7A6A5A] hover:text-[#3B2A1E] hover:bg-[#E4D8C3]/40 text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
