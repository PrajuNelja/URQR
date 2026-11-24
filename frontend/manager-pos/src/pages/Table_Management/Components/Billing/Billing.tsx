import { Link } from "@tanstack/react-router";
import { Package, Search, ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { useBilling } from "../../Hooks/useBilling";
import { CATEGORIES } from "../../Config/billing.config";
import { BillingReceiptModal } from "./BillingReceiptModal";
import type { PaymentMethod } from "../../Types/billing.types";

export default function Billing() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredDishes,
    addToCart,
    updateQuantity,
    clearCart,
    totals,
    paymentMethod,
    setPaymentMethod,
    orderNote,
    setOrderNote,
    handleCompletePayment,
    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
    isSubmitting,
    errorMessage,
  } = useBilling();

  return (
    <main className="flex min-h-dvh w-full flex-col bg-[#f5efe6] lg:h-dvh lg:overflow-hidden text-[#30261d]">
      {/* -------------------------------------------------- */}
      {/* 1. TOP HEADER NAVIGATION */}
      {/* -------------------------------------------------- */}
      <header className="flex w-full shrink-0 flex-wrap items-center justify-between gap-4 bg-[#f5efe6] px-4 py-4 border-b border-[#e4d5bd] lg:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#2d241b] text-xl font-bold text-white shadow-sm">
            ✦
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold leading-tight text-[#30261d] lg:text-2xl">
              GRAND HORIZON
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#91816c]">
              Phase 1 Standalone POS Terminal
            </p>
          </div>
        </div>

        <nav aria-label="POS navigation" className="flex items-center gap-3">
          <Link
            to="/pos/billing"
            className="rounded-md bg-[#2d241b] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Billing Register
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md px-4 py-2 text-sm font-semibold text-[#30261d] transition-colors hover:bg-[#e9ddcc]"
          >
            Operations
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-[#dfcdb4] px-4 py-2 text-sm font-semibold text-[#30261d] transition-colors hover:bg-[#e9ddcc]"
          >
            Lock POS
          </Link>
        </nav>
      </header>

      {/* -------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN POS LAYOUT */}
      {/* -------------------------------------------------- */}
      <div className="grid w-full flex-1 grid-cols-1 gap-4 p-4 lg:min-h-0 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)] lg:px-7 pb-6">
        {/* LEFT PANEL: PRODUCT CATALOG */}
        <section className="flex min-w-0 flex-col rounded-xl border border-[#e4d5bd] bg-[#fffaf2] p-5 shadow-sm lg:min-h-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#30261d]">
              1. Menu & Dish Catalog
            </h2>
            <span className="text-xs font-medium text-[#91816c]">
              {filteredDishes.length} items available
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91816c]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, drinks, appetizers..."
              className="w-full rounded-lg border border-[#e4d5bd] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#2d241b] focus:ring-1 focus:ring-[#2d241b]"
            />
          </div>

          {/* Category Tabs */}
          <div className="mb-4 flex shrink-0 gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const isSelected = activeTab.toLowerCase() === cat.key.toLowerCase();
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveTab(cat.key)}
                  className={`shrink-0 rounded-lg border px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "border-[#2d241b] bg-[#2d241b] text-white shadow-sm"
                      : "border-[#e4d5bd] bg-white text-[#705e4b] hover:bg-[#f5efe6]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-3">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="flex flex-col justify-between rounded-xl border border-[#e4d5bd] bg-white p-3.5 shadow-sm transition hover:border-[#2d241b] hover:shadow-md"
              >
                <div>
                  <div className="mb-2 flex h-14 w-full items-center justify-center rounded-lg bg-[#f5efe6]">
                    <Package size={24} className="text-[#91816c]" />
                  </div>
                  <h3 className="line-clamp-1 text-sm font-bold text-[#30261d]">
                    {dish.name}
                  </h3>
                  <p className="line-clamp-1 text-xs text-[#91816c] mt-0.5">
                    {dish.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#f5efe6]">
                  <span className="text-base font-extrabold text-[#30261d]">
                    ₹{dish.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(dish.id)}
                    className="flex items-center gap-1 rounded-md bg-[#2d241b] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#433628] active:scale-95"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT PANEL: CART & 1-TAP CHECKOUT */}
        <aside className="flex min-w-0 flex-col rounded-xl border border-[#e4d5bd] bg-[#fffaf2] p-5 shadow-sm lg:min-h-0">
          <div className="flex items-center justify-between border-b border-[#e4d5bd] pb-3 mb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#30261d]">
                2. Order & 1-Tap Checkout
              </h2>
              <p className="text-xs text-[#91816c]">
                {totals.items.length} unique items in order
              </p>
            </div>
            {totals.items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
              >
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 mb-3">
            {totals.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center text-[#91816c]">
                <ShoppingCart size={40} className="mb-2 opacity-40" />
                <p className="font-semibold text-sm">Cart is currently empty</p>
                <p className="text-xs mt-1">Tap +Add on any menu item to start order</p>
              </div>
            ) : (
              totals.items.map((item) => (
                <div
                  key={item.dish.id}
                  className="flex items-center justify-between rounded-lg border border-[#e4d5bd] bg-white p-3 shadow-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-sm font-bold text-[#30261d]">
                      {item.dish.name}
                    </p>
                    <p className="text-xs text-[#91816c]">
                      ₹{item.dish.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-[#e4d5bd] bg-[#f5efe6]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.dish.id, -1)}
                        className="p-1 text-[#30261d] hover:bg-[#e9ddcc] rounded-l-lg"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.dish.id, 1)}
                        className="p-1 text-[#30261d] hover:bg-[#e9ddcc] rounded-r-lg"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="w-16 text-right text-sm font-bold text-[#30261d]">
                      ₹{(item.dish.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Note */}
          <div className="mb-3">
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Order Note (e.g., Table 4, less spicy)..."
              className="w-full rounded-lg border border-[#e4d5bd] bg-white px-3 py-2 text-xs outline-none focus:border-[#2d241b]"
            />
          </div>

          {/* Direct 1-Tap Checkout & Totals */}
          <div className="shrink-0 rounded-xl border border-[#e4d5bd] bg-white p-4 shadow-sm">
            <div className="space-y-1.5 text-xs text-[#705e4b] mb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#30261d]">
                  ₹{totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST ({5}%)</span>
                <span className="font-semibold text-[#30261d]">
                  ₹{totals.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-[#e4d5bd] pt-2 text-base font-extrabold text-[#30261d]">
                <span>Payable Total</span>
                <span className="text-[#a46714]">₹{totals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Direct Payment Method Selector (1-Tap, No Cash Tendering) */}
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#91816c] mb-1.5">
                Payment Method (Direct 1-Tap)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["Cash", "UPI", "Card"] as PaymentMethod[]).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg text-xs font-bold border transition ${
                        isSelected
                          ? "bg-[#2d241b] text-white border-[#2d241b] shadow-xs"
                          : "bg-[#fffaf2] text-[#705e4b] border-[#e4d5bd] hover:bg-[#f5efe6]"
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <p className="mb-2 text-xs text-red-600 font-medium">
                {errorMessage}
              </p>
            )}

            {/* Checkout Button */}
            <button
              type="button"
              disabled={totals.items.length === 0 || isSubmitting}
              onClick={handleCompletePayment}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2d241b] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#433628] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard size={16} />
              {isSubmitting
                ? "Processing..."
                : `1-TAP CHECKOUT: ${paymentMethod.toUpperCase()} (₹${totals.total.toFixed(2)})`}
            </button>
          </div>
        </aside>
      </div>

      {/* -------------------------------------------------- */}
      {/* 3. RECEIPT MODAL */}
      {/* -------------------------------------------------- */}
      <BillingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receipt}
      />
    </main>
  );
}
