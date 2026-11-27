import { useMemo, useState } from "react";
import { Download, Eye, Filter, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MOCK_ORDERS } from "../../pages/Table_Management/Config/Dashboard.config";
import type { OrderData } from "../../pages/Table_Management/Types/Dashboard.types";
import { downloadDashboardOrdersCsv } from "./DashboardOrdersExport";

type PaymentFilter = "All" | "Cash" | "UPI" | "Card";

function OrderDetailDialog({
  order,
  onClose,
}: {
  order: OrderData;
  onClose: () => void;
}) {
  return (
    <div
      className="dashboard-order-dialog-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="dashboard-order-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-order-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dashboard-order-dialog-header">
          <div>
            <p>ORDER DETAILS</p>
            <h2 id="dashboard-order-dialog-title">{order.orderId}</h2>
          </div>
          <button
            type="button"
            aria-label="Close order details"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <dl className="dashboard-order-detail-list">
          <div>
            <dt>Date</dt>
            <dd>
              {order.date} · {order.time}
            </dd>
          </div>
          <div>
            <dt>Items</dt>
            <dd>{order.items}</dd>
          </div>
          <div>
            <dt>Before tax</dt>
            <dd>{order.beforeTax}</dd>
          </div>
          <div>
            <dt>After tax</dt>
            <dd>{order.afterTax}</dd>
          </div>
          <div>
            <dt>Payment mode</dt>
            <dd>{order.paymentMode}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{order.status}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export function DashboardOrdersTable() {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("All");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_ORDERS.filter((order) => {
      const matchesQuery =
        !query ||
        order.orderId.toLowerCase().includes(query) ||
        order.items.toLowerCase().includes(query);
      const matchesPayment =
        paymentFilter === "All" || order.paymentMode === paymentFilter;
      return matchesQuery && matchesPayment;
    });
  }, [paymentFilter, search]);

  return (
    <section
      className="dashboard-panel dashboard-orders-panel"
      aria-label="Order details"
    >
      <div className="dashboard-orders-heading">
        <div className="dashboard-orders-title">
          <h2>Order Details</h2>
          <span className="dashboard-total-badge">128 Orders</span>
        </div>
        <div className="dashboard-orders-actions">
          <label className="dashboard-orders-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Order ID, Items..."
              aria-label="Search orders by order ID or items"
            />
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`Filter payment mode: ${paymentFilter}`}
                >
                  <Filter size={17} aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="dashboard-payment-filter" align="end">
                {(["All", "Cash", "UPI", "Card"] as PaymentFilter[]).map(
                  (filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={paymentFilter === filter ? "is-active" : ""}
                      aria-pressed={paymentFilter === filter}
                      onClick={() => setPaymentFilter(filter)}
                    >
                      {filter}
                    </button>
                  ),
                )}
              </PopoverContent>
            </Popover>
          </label>
          <button
            type="button"
            className="dashboard-export-csv"
            onClick={() => downloadDashboardOrdersCsv(filteredOrders)}
          >
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="dashboard-table-scroll">
        <table className="dashboard-orders-table">
          <thead>
            <tr>
              <th scope="col">DATE</th>
              <th scope="col">TIME</th>
              <th scope="col">ORDER ID</th>
              <th scope="col">ITEMS</th>
              <th scope="col" className="is-numeric">
                BEFORE TAX
              </th>
              <th scope="col" className="is-numeric">
                AFTER TAX
              </th>
              <th scope="col">PAYMENT MODE</th>
              <th scope="col">STATUS</th>
              <th scope="col">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.date}</td>
                <td className="is-muted">{order.time}</td>
                <td className="dashboard-order-id">{order.orderId}</td>
                <td>{order.items}</td>
                <td className="is-numeric is-muted">{order.beforeTax}</td>
                <td className="is-numeric is-emphasized">{order.afterTax}</td>
                <td>
                  <span className="dashboard-payment-badge">
                    <i />
                    {order.paymentMode}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      order.status === "completed"
                        ? "dashboard-order-status dashboard-order-status--complete"
                        : "dashboard-order-status dashboard-order-status--cancelled"
                    }
                  >
                    <i />
                    {order.status === "completed" ? "Completed" : "Cancelled"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="dashboard-view-order"
                    aria-label={`View ${order.orderId}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye size={18} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td className="dashboard-empty-orders" colSpan={9}>
                  No orders match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dashboard-orders-footer" aria-live="polite">
        <span>
          {filteredOrders.length === MOCK_ORDERS.length
            ? "Showing 1–6 of 128 recorded transactions"
            : `Showing ${filteredOrders.length} matching sample transactions`}
        </span>
        <div className="dashboard-pagination" aria-label="Order pages">
          <button type="button" disabled>
            Previous
          </button>
          <button type="button" className="is-active" aria-current="page">
            1
          </button>
          <button type="button" disabled>
            2
          </button>
          <button type="button" disabled>
            3
          </button>
          <button type="button" disabled>
            Next
          </button>
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}
