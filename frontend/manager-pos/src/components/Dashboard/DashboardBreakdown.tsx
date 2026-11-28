import { useMemo, useState } from "react";

type ItemCategory = "all" | "mains" | "sides" | "beverages" | "desserts";
type ItemMetric = "units" | "revenue";

interface CatalogItem {
  name: string;
  category: string;
  color: string;
  units: number;
  revenue: number;
}

const catalogData: Record<ItemCategory, CatalogItem[]> = {
  all: [
    { name: "Veg Burger", category: "mains", color: "#5C3D26", units: 142, revenue: 21300 },
    { name: "Chicken Pizza", category: "mains", color: "#8B5E3C", units: 108, revenue: 27000 },
    { name: "French Fries", category: "sides", color: "#A68B75", units: 97, revenue: 11640 },
    { name: "Cold Coffee", category: "beverages", color: "#7A6A5A", units: 76, revenue: 9120 },
    { name: "Brownie", category: "desserts", color: "#D9CDB8", units: 62, revenue: 6820 },
  ],
  mains: [
    { name: "Veg Burger", category: "mains", color: "#5C3D26", units: 142, revenue: 21300 },
    { name: "Chicken Pizza", category: "mains", color: "#8B5E3C", units: 108, revenue: 27000 },
    { name: "Ribeye Beef Burger", category: "mains", color: "#6E492E", units: 74, revenue: 18500 },
    { name: "Wagyu Ribeye", category: "mains", color: "#5C3D26", units: 50, revenue: 24000 },
    { name: "Lobster Linguine", category: "mains", color: "#8B5E3C", units: 50, revenue: 18000 },
  ],
  sides: [
    { name: "French Fries", category: "sides", color: "#A68B75", units: 97, revenue: 11640 },
    { name: "Truffle Mushroom Soup", category: "sides", color: "#8B5E3C", units: 45, revenue: 5400 },
    { name: "Classic Caesar Salad", category: "sides", color: "#5C3D26", units: 35, revenue: 4900 },
    { name: "Garlic Bread", category: "sides", color: "#B59982", units: 32, revenue: 3840 },
    { name: "Onion Rings", category: "sides", color: "#7A6A5A", units: 27, revenue: 2700 },
  ],
  beverages: [
    { name: "Cold Coffee", category: "beverages", color: "#7A6A5A", units: 76, revenue: 9120 },
    { name: "Artisanal Espresso", category: "beverages", color: "#5C3D26", units: 90, revenue: 4500 },
    { name: "Fresh Lime Soda", category: "beverages", color: "#8B5E3C", units: 52, revenue: 3120 },
    { name: "Iced Peach Tea", category: "beverages", color: "#A68B75", units: 48, revenue: 2880 },
    { name: "Mango Smoothie", category: "beverages", color: "#6E492E", units: 30, revenue: 2400 },
  ],
  desserts: [
    { name: "Brownie", category: "desserts", color: "#D9CDB8", units: 62, revenue: 6820 },
    { name: "Belgian Choc Lava Cake", category: "desserts", color: "#5C3D26", units: 50, revenue: 5500 },
    { name: "Tiramisu", category: "desserts", color: "#8B5E3C", units: 35, revenue: 4200 },
    { name: "Berry Cheesecake", category: "desserts", color: "#A68B75", units: 33, revenue: 3960 },
    { name: "Vanilla Bean Gelato", category: "desserts", color: "#7A6A5A", units: 28, revenue: 2800 },
  ],
};

const categoryPillsMeta: Array<{
  id: ItemCategory;
  label: string;
  dotColor?: string;
  icon?: string;
}> = [
  { id: "all", label: "All", icon: "done_all" },
  { id: "mains", label: "Mains", dotColor: "#5C3D26" },
  { id: "sides", label: "Sides", dotColor: "#8B5E3C" },
  { id: "beverages", label: "Beverages", dotColor: "#7A6A5A" },
  { id: "desserts", label: "Desserts", dotColor: "#D9CDB8" },
];

const paymentMethodsList = [
  {
    mode: "upi",
    name: "UPI (QR / Direct Pay)",
    orders: "885 orders",
    amount: "₹1,14,483",
    pct: "62%",
    color: "#5C3D26",
  },
  {
    mode: "card",
    name: "Card (Credit / Debit Chip)",
    orders: "343 orders",
    amount: "₹44,316",
    pct: "24%",
    color: "#8B5E3C",
  },
  {
    mode: "cash",
    name: "Cash (Drawer Reconciled)",
    orders: "200 orders",
    amount: "₹25,851",
    pct: "14%",
    color: "#A68B75",
  },
];

export function DashboardBreakdown() {
  const [currentCategory, setCurrentCategory] = useState<ItemCategory>("mains");
  const [currentMetric, setCurrentMetric] = useState<ItemMetric>("units");

  const items = catalogData[currentCategory] || catalogData.all;

  const totalUnits = useMemo(
    () => items.reduce((acc, curr) => acc + curr.units, 0),
    [items],
  );
  const totalRevenue = useMemo(
    () => items.reduce((acc, curr) => acc + curr.revenue, 0),
    [items],
  );

  const maxValue = useMemo(() => {
    let max = 0;
    items.forEach((it) => {
      const val = currentMetric === "units" ? it.units : it.revenue;
      if (val > max) max = val;
    });
    return max;
  }, [items, currentMetric]);

  const axisInfo = useMemo(() => {
    if (currentMetric === "units") {
      const axisMax = maxValue > 100 ? 150 : 100;
      return {
        tick1: Math.round(axisMax / 3).toString(),
        tick2: Math.round((axisMax * 2) / 3).toString(),
        tickMax: `${axisMax} units`,
        axisMax,
      };
    } else {
      const axisMax = maxValue > 20000 ? 30000 : maxValue > 10000 ? 15000 : 8000;
      return {
        tick1: `₹${Math.round(axisMax / 3).toLocaleString("en-IN")}`,
        tick2: `₹${Math.round((axisMax * 2) / 3).toLocaleString("en-IN")}`,
        tickMax: `₹${axisMax.toLocaleString("en-IN")}`,
        axisMax,
      };
    }
  }, [currentMetric, maxValue]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Left Card: Top 5 Selling Items (Horizontal Bar Graph) */}
      <div
        id="topItemsCard"
        className="bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl p-6 shadow-sm flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                className="text-2xl font-bold text-[#3B2A1E] tracking-tight"
                style={{ fontFamily: "Newsreader, Georgia, serif" }}
              >
                Top 5 Selling Items
              </h3>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center p-1 rounded-xl bg-[#FAF3E6] border border-[#E4D8C3]">
                  <button
                    type="button"
                    id="topMetricUnitsBtn"
                    onClick={() => setCurrentMetric("units")}
                    className={`px-3 py-1 rounded-lg font-ticket-mono text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer ${
                      currentMetric === "units"
                        ? "bg-[#5C3D26] text-[#FFFFFF]"
                        : "text-[#5C3D26] hover:text-[#3B2A1E]"
                    }`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <span className="text-[11px]">#</span> Units
                  </button>
                  <button
                    type="button"
                    id="topMetricRevenueBtn"
                    onClick={() => setCurrentMetric("revenue")}
                    className={`px-3 py-1 rounded-lg font-ticket-mono text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      currentMetric === "revenue"
                        ? "bg-[#5C3D26] text-[#FFFFFF]"
                        : "text-[#5C3D26] hover:text-[#3B2A1E]"
                    }`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <span className="text-[11px]">₹</span> Revenue
                  </button>
                </div>
                <span
                  id="topItemsTotalBadge"
                  className="px-3 py-1 rounded-full bg-[#FAF3E6] border border-[#E4D8C3] font-ticket-mono text-xs font-bold text-[#3B2A1E] shadow-sm transition-all"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <span id="topItemsUnitsLabel">
                    {currentMetric === "units"
                      ? `${totalUnits.toLocaleString("en-IN")} Units Sold`
                      : `₹${totalRevenue.toLocaleString("en-IN")} Revenue`}
                  </span>
                </span>
              </div>
            </div>

            {/* Dynamic Category Filter Pills */}
            <div
              id="topCategoryPillsContainer"
              role="tablist"
              aria-label="Catalog Categories"
              className="p-1.5 rounded-xl bg-[#FAF3E6] border border-[#E4D8C3] flex items-center gap-1.5 overflow-x-auto"
            >
              {categoryPillsMeta.map((pill) => {
                const isSelected = currentCategory === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    data-category={pill.id}
                    onClick={() => setCurrentCategory(pill.id)}
                    className={`category-pill-btn px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-[#5C3D26] text-[#FFFFFF] font-bold"
                        : "bg-[#FFFDF8] border border-[#E4D8C3] text-[#5C3D26] hover:bg-[#FAF3E6] font-medium"
                    }`}
                  >
                    {pill.id === "all" ? (
                      <span
                        className={`material-symbols-outlined text-[15px] check-icon ${
                          isSelected ? "text-white" : "hidden text-[#7A6A5A]"
                        }`}
                      >
                        done_all
                      </span>
                    ) : (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: pill.dotColor }}
                      />
                    )}
                    <span>{pill.label}</span>
                    {pill.id !== "all" && (
                      <span
                        className={`material-symbols-outlined text-[14px] check-icon ${
                          isSelected ? "text-white" : "hidden text-[#7A6A5A]"
                        }`}
                      >
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Bars List */}
          <div className="flex flex-col gap-4" id="topItemsBarsContainer">
            {items.map((item, idx) => {
              const metricVal =
                currentMetric === "units" ? item.units : item.revenue;
              const pct = Math.min(
                100,
                Math.max(8, (metricVal / axisInfo.axisMax) * 100),
              );

              return (
                <div
                  key={item.name}
                  className="flex flex-col gap-1.5 transition-all duration-300"
                  style={{
                    animation: `fadeInRow 0.25s ease ${idx * 40}ms forwards`,
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3B2A1E] flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <div
                      className="flex items-center gap-3 font-ticket-mono"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <span
                        className={
                          currentMetric === "units"
                            ? "text-[#7A6A5A] text-[11px]"
                            : "font-bold text-[#3B2A1E] text-sm"
                        }
                      >
                        ₹{item.revenue.toLocaleString("en-IN")}
                      </span>
                      <span
                        className={
                          currentMetric === "units"
                            ? "font-bold text-[#3B2A1E] text-sm"
                            : "text-[#7A6A5A] text-[11px]"
                        }
                      >
                        {item.units}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#FAF3E6] border border-[#E4D8C3]/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: item.color,
                        width: `${pct.toFixed(1)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graph axis ticks */}
        <div
          id="topItemsAxisTicks"
          className="flex justify-between items-center text-[11px] font-ticket-mono text-[#7A6A5A] pt-6 border-t border-[#E4D8C3] mt-4"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>0</span>
          <span id="axisTick1">{axisInfo.tick1}</span>
          <span id="axisTick2">{axisInfo.tick2}</span>
          <span id="axisTickMax">{axisInfo.tickMax}</span>
        </div>
      </div>

      {/* Right Card: Payment Method Distribution */}
      <div
        id="paymentMethodsCard"
        className="bg-[#FFFDF8] border border-[#E4D8C3] rounded-xl p-6 shadow-sm flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3
                className="text-xl font-bold text-[#3B2A1E]"
                style={{ fontFamily: "Newsreader, Georgia, serif" }}
              >
                Payment Methods
              </h3>
            </div>
            <span
              id="paymentTotalBadge"
              className="px-2.5 py-0.5 rounded-full bg-[#FAF3E6] border border-[#E4D8C3] font-ticket-mono text-xs font-bold text-[#3B2A1E] transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span id="paymentTotalSettledLabel">₹1,84,650</span> Total Settled
            </span>
          </div>
          <p className="text-xs text-[#7A6A5A] mb-3">
            Tender type allocation across all active POS terminals and tableside tablets
          </p>

          {/* Payment Bars List */}
          <div className="flex flex-col gap-4" id="paymentBarsContainer">
            {paymentMethodsList.map((pay) => (
              <div
                key={pay.mode}
                data-mode={pay.mode}
                className="flex flex-col gap-1.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded shrink-0"
                      style={{ backgroundColor: pay.color }}
                    />
                    <span className="font-bold text-[#3B2A1E]">{pay.name}</span>
                    <span
                      className="font-ticket-mono text-[11px] text-[#7A6A5A]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {pay.orders}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 font-ticket-mono"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <span className="text-[#7A6A5A] text-[11px]">{pay.amount}</span>
                    <span className="font-bold text-[#3B2A1E] text-sm mode-pct">
                      {pay.pct}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#FAF3E6] border border-[#E4D8C3]/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: pay.color,
                      width: pay.pct,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary Footer aligning with Top Items axis ticks */}
        <div
          className="flex justify-between items-center text-[11px] font-ticket-mono text-[#7A6A5A] pt-6 border-t border-[#E4D8C3] mt-4"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span>3 payment modes</span>
          <span>1,428 orders settled</span>
        </div>
      </div>
    </div>
  );
}
