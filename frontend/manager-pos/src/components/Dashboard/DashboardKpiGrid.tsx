import { useEffect, useRef, useState } from "react";
import type { AnalyticsSummary } from "../../pages/Table_Management/Types/AnalyticsSummary";

interface DashboardKpiGridProps {
  summary?: AnalyticsSummary;
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const auditCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function DashboardKpiGrid({
  summary,
  isLoading,
  error,
  onRetry,
}: DashboardKpiGridProps) {
  const [taxPopoverOpen, setTaxPopoverOpen] = useState(false);
  const taxPopoverRef = useRef<HTMLDivElement>(null);
  const taxTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        taxPopoverOpen &&
        taxPopoverRef.current &&
        !taxPopoverRef.current.contains(e.target as Node) &&
        taxTriggerRef.current &&
        !taxTriggerRef.current.contains(e.target as Node)
      ) {
        setTaxPopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && taxPopoverOpen) {
        setTaxPopoverOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [taxPopoverOpen]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-sm animate-pulse h-36"
          >
            <div className="h-4 bg-[#FAF3E6] rounded w-24 mb-4" />
            <div className="h-8 bg-[#FAF3E6] rounded w-36 mb-4" />
            <div className="h-1.5 bg-[#FAF3E6] rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 mb-6">
        <div className="p-6 bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-sm text-center">
          <p className="text-[#B91C1C] text-sm font-semibold mb-2">
            {error ?? "Sales summary is unavailable."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-[#5C3D26] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const grossRev = summary.grossSalesRevenue ?? 184650;
  const totalOrders = summary.totalOrderCount ?? 1428;
  const aov = summary.averageOrderValue ?? 1293;
  const totalTax = summary.totalTaxCollected ?? 16618;
  const cgst = summary.cgst ?? 8309;
  const sgst = summary.sgst ?? 8309;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 relative">
      {/* KPI 1: Gross Revenue */}
      <div className="p-6 bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-full min-h-[148px]">
        <div className="h-8 flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[#7A6A5A] uppercase tracking-wider">
            Gross Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#8B5E3C] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span
            className="font-ticket-mono font-bold text-[#3B2A1E] leading-tight text-3xl"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {currencyFormatter.format(grossRev)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1" />
        <div className="w-full bg-[#FAF3E6] rounded-full h-1.5 mt-4 overflow-hidden border border-[#E4D8C3]/50">
          <div
            className="bg-[#8B5E3C] h-full rounded-full transition-all duration-500"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* KPI 2: Total Orders */}
      <div className="p-6 bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[148px]">
        <div className="h-8 flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[#7A6A5A] uppercase tracking-wider">
            Total Orders
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#7A6A5A] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span
            className="font-ticket-mono font-bold text-[#3B2A1E] leading-tight text-3xl"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {new Intl.NumberFormat("en-IN").format(totalOrders)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1" />
        <div className="w-full bg-[#FAF3E6] rounded-full h-1.5 mt-4 overflow-hidden border border-[#E4D8C3]/50">
          <div
            className="bg-[#5C3D26] h-full rounded-full transition-all duration-500"
            style={{ width: "78%" }}
          />
        </div>
      </div>

      {/* KPI 3: Average Order Value */}
      <div className="p-6 bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[148px]">
        <div className="h-8 flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[#7A6A5A] uppercase tracking-wider">
            Average Order Value
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#7A6A5A] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span
            className="font-ticket-mono font-bold text-[#3B2A1E] leading-tight text-3xl"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {currencyFormatter.format(aov)}
          </span>
          <span
            className="font-ticket-mono text-xs text-[#7A6A5A]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            / order
          </span>
        </div>
        <div className="w-full bg-[#FAF3E6] rounded-full h-1.5 mt-4 overflow-hidden border border-[#E4D8C3]/50">
          <div
            className="bg-[#8B5E3C] h-full rounded-full transition-all duration-500"
            style={{ width: "86%" }}
          />
        </div>
      </div>

      {/* KPI 4: Tax Collected (GST 5%) with Popover trigger */}
      <div className="relative h-full flex flex-col">
        <div
          ref={taxTriggerRef}
          id="taxTriggerCard"
          role="button"
          tabIndex={0}
          onClick={() => setTaxPopoverOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setTaxPopoverOpen((open) => !open);
            }
          }}
          className="p-6 bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group h-full min-h-[148px]"
        >
          <div className="h-8 flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#7A6A5A] uppercase tracking-wider flex items-center gap-1 group-hover:text-[#8B5E3C] transition-colors">
              Tax Collected (GST 5%)
              <span
                id="taxTriggerChevron"
                className={`material-symbols-outlined text-[16px] text-[#8B5E3C] transition-transform duration-200 ${
                  taxPopoverOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className="font-ticket-mono font-bold text-[#3B2A1E] leading-tight text-3xl"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {currencyFormatter.format(totalTax)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-[#7A6A5A]" />
          <div className="w-full bg-[#FAF3E6] rounded-full h-1.5 mt-4 overflow-hidden border border-[#E4D8C3]/50">
            <div
              className="bg-[#5C3D26] h-full rounded-full transition-all duration-500"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Tax Breakdown Popover Overlay (Anchored to KPI 4) */}
        {taxPopoverOpen && (
          <div
            ref={taxPopoverRef}
            id="taxPopover"
            role="dialog"
            aria-label="GST Breakdown Ledger"
            className="absolute top-full right-0 mt-2 w-80 md:w-96 p-5 bg-[#FFFDF8] rounded-xl shadow-2xl z-50 flex flex-col gap-3.5 border border-[#E4D8C3]"
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#FAF3E6] border border-[#E4D8C3] text-[#8B5E3C] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#3B2A1E]">
                    GST Breakdown (5%)
                  </span>
                </div>
              </div>
            </div>

            {/* Nested CGST & SGST cards */}
            <div className="flex flex-col gap-2">
              {/* CGST Card */}
              <div className="p-3 bg-[#FAF3E6] border border-[#E4D8C3]/70 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#3B2A1E]">CGST (2.5%)</span>
                  <span className="text-[11px] text-[#7A6A5A]">
                    Central Goods &amp; Service Tax
                  </span>
                </div>
                <span
                  className="font-ticket-mono text-sm font-bold text-[#3B2A1E]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {auditCurrencyFormatter.format(cgst)}
                </span>
              </div>

              {/* SGST Card */}
              <div className="p-3 bg-[#FAF3E6] border border-[#E4D8C3]/70 rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#3B2A1E]">SGST (2.5%)</span>
                  <span className="text-[11px] text-[#7A6A5A]">
                    State Goods &amp; Service Tax
                  </span>
                </div>
                <span
                  className="font-ticket-mono text-sm font-bold text-[#3B2A1E]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {auditCurrencyFormatter.format(sgst)}
                </span>
              </div>

              {/* Aggregated Total Card */}
              <div className="p-3 bg-[#F5EEE0] border border-[#E4D8C3] rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold text-[#3B2A1E]">
                  Total GST Collected
                </span>
                <span
                  className="font-ticket-mono text-base font-bold text-[#8B5E3C]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {auditCurrencyFormatter.format(totalTax)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
