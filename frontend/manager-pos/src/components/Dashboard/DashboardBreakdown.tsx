import { useMemo, useState } from "react";

type ItemCategory = "Mains" | "Sides" | "Beverages" | "Desserts";
type ItemMetric = "units" | "revenue";

const topItems: Array<{
  name: string;
  category: ItemCategory;
  units: number;
  revenue: number;
  color: string;
}> = [
  {
    name: "Veg Burger",
    category: "Mains",
    units: 142,
    revenue: 21300,
    color: "#5c3d26",
  },
  {
    name: "Chicken Pizza",
    category: "Mains",
    units: 108,
    revenue: 27000,
    color: "#8b5e3c",
  },
  {
    name: "French Fries",
    category: "Sides",
    units: 97,
    revenue: 11640,
    color: "#aa8f7a",
  },
  {
    name: "Cold Coffee",
    category: "Beverages",
    units: 76,
    revenue: 9120,
    color: "#7a6a5a",
  },
  {
    name: "Brownie",
    category: "Desserts",
    units: 62,
    revenue: 6820,
    color: "#d9cdb8",
  },
];

const payments = [
  {
    name: "UPI (QR / Direct Pay)",
    orders: 885,
    revenue: 114483,
    share: 62,
    color: "#3b2a1e",
  },
  {
    name: "Card (Credit / Debit Chip)",
    orders: 343,
    revenue: 44316,
    share: 24,
    color: "#8b5e3c",
  },
  {
    name: "Cash (Drawer Reconciled)",
    orders: 200,
    revenue: 25851,
    share: 14,
    color: "#a39587",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function DashboardBreakdown() {
  const [category, setCategory] = useState<ItemCategory | "All">("All");
  const [metric, setMetric] = useState<ItemMetric>("units");
  const visibleItems = useMemo(
    () =>
      topItems.filter(
        (item) => category === "All" || item.category === category,
      ),
    [category],
  );
  const totalUnits = visibleItems.reduce((sum, item) => sum + item.units, 0);

  return (
    <section className="dashboard-breakdown-grid" aria-label="Sales breakdown">
      <article className="dashboard-panel dashboard-top-items">
        <div className="dashboard-panel-header">
          <h2>Top 5 Selling Items</h2>
          <span className="dashboard-total-badge">{totalUnits} Units Sold</span>
        </div>
        <div className="dashboard-item-controls">
          <div className="dashboard-metric-toggle" aria-label="Item metric">
            <button
              type="button"
              aria-pressed={metric === "units"}
              className={metric === "units" ? "is-active" : ""}
              onClick={() => setMetric("units")}
            >
              # Units
            </button>
            <button
              type="button"
              aria-pressed={metric === "revenue"}
              className={metric === "revenue" ? "is-active" : ""}
              onClick={() => setMetric("revenue")}
            >
              ₹ Revenue
            </button>
          </div>
        </div>
        <div
          className="dashboard-category-filters"
          aria-label="Item categories"
        >
          {(["All", "Mains", "Sides", "Beverages", "Desserts"] as const).map(
            (itemCategory) => (
              <button
                type="button"
                key={itemCategory}
                aria-pressed={category === itemCategory}
                className={
                  category === itemCategory
                    ? "dashboard-category-pill is-active"
                    : "dashboard-category-pill"
                }
                onClick={() => setCategory(itemCategory)}
              >
                {itemCategory === "All" ? "✓ " : "• "}
                {itemCategory}
              </button>
            ),
          )}
        </div>
        <div className="dashboard-item-list">
          {visibleItems.map((item) => {
            const metricValue = metric === "units" ? item.units : item.revenue;
            const maximum = metric === "units" ? 150 : 30000;
            const percent = Math.min((metricValue / maximum) * 100, 100);
            return (
              <div className="dashboard-item-row" key={item.name}>
                <div className="dashboard-item-label-row">
                  <span className="dashboard-item-name">
                    <i style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="dashboard-item-figures">
                    <span>{currencyFormatter.format(item.revenue)}</span>
                    <strong>{item.units}</strong>
                  </span>
                </div>
                <div
                  className="dashboard-item-track"
                  role="progressbar"
                  aria-label={`${item.name} ${metric}`}
                  aria-valuemin={0}
                  aria-valuemax={maximum}
                  aria-valuenow={metricValue}
                >
                  <span
                    style={{
                      width: `${percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="dashboard-item-axis" aria-hidden="true">
          {metric === "units" ? (
            <>
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150 units</span>
            </>
          ) : (
            <>
              <span>₹0</span>
              <span>₹10k</span>
              <span>₹20k</span>
              <span>₹30k revenue</span>
            </>
          )}
        </div>
      </article>

      <article className="dashboard-panel dashboard-payment-panel">
        <div className="dashboard-panel-header">
          <h2>Payment Methods</h2>
          <span className="dashboard-total-badge">₹1,84,650 Total Settled</span>
        </div>
        <p className="dashboard-panel-description">
          Tender type allocation across all active POS terminals and tableside
          tablets
        </p>
        <div className="dashboard-payment-list">
          {payments.map((payment) => (
            <div className="dashboard-payment-row" key={payment.name}>
              <div className="dashboard-payment-label-row">
                <span className="dashboard-payment-name">
                  <i style={{ backgroundColor: payment.color }} />
                  {payment.name}
                  <small>{payment.orders} orders</small>
                </span>
                <span className="dashboard-payment-figures">
                  {currencyFormatter.format(payment.revenue)}{" "}
                  <strong>{payment.share}%</strong>
                </span>
              </div>
              <div
                className="dashboard-payment-track"
                role="progressbar"
                aria-label={`${payment.name} share`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={payment.share}
              >
                <span
                  style={{
                    width: `${payment.share}%`,
                    backgroundColor: payment.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="dashboard-payment-footer">
          <span>Total Transactions: 1,428</span>
          <strong>100% Reconciled</strong>
        </div>
      </article>
    </section>
  );
}
