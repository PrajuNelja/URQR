import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useBilling } from "../../Hooks/useBilling";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
import { BillingPayment } from "./BillingPayment";
import { BillingReceiptModal } from "./BillingReceiptModal";
import { PosCheckoutModal } from "./PosCheckoutModal";

// --------------------------------------------------
// HEADER - Grand Horizon POS Branding
// --------------------------------------------------

function Header() {
  return (
    <header className="flex w-full shrink-0 flex-wrap items-center justify-between gap-4 bg-[#f5efe6] px-4 py-4 text-[#30261d] border-b border-[#e4d5bd] lg:px-7">
      {/* Logo and Branding */}
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

      {/* Navigation */}
      <nav aria-label="POS navigation" className="flex flex-wrap items-center gap-3">
        <Link
          to="/pos/billing"
          aria-current="page"
          className="rounded-md bg-[#2d241b] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          Billing POS
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
          Logout
        </Link>
      </nav>
    </header>
  );
}

// --------------------------------------------------
// MAIN BILLING PAGE
// --------------------------------------------------

export default function Billing() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredDishes,
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    totals,
    paymentMethod,
    setPaymentMethod,
    cashCollected,
    setCashCollected,
    change,
    handleCompletePayment,
    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
  } = useBilling();

  const [orderNote, setOrderNote] = useState<string>("");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);

  const handleCheckoutModalConfirm = () => {
    setIsCheckoutModalOpen(false);
    handleCompletePayment();
  };

  return (
    <main className="flex min-h-dvh w-full flex-col bg-[#f5efe6] lg:h-dvh lg:overflow-hidden text-[#30261d]">
      <Header />
      <div className="grid w-full flex-1 grid-cols-1 gap-4 p-4 lg:min-h-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-7 pb-6">
        {/* Left Panel: Catalog Grid */}
        <BillingCatalog
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredDishes={filteredDishes}
          addToCart={addToCart}
          cart={cart}
        />

        {/* Right Panel: Order Cart & Payment */}
        <div className="flex flex-col gap-4 overflow-y-auto min-h-0">
          <BillingCart
            items={totals.items}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
            note={orderNote}
            setNote={setOrderNote}
          />

          <BillingPayment
            subtotal={totals.subtotal}
            tax={totals.tax}
            total={totals.total}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cashCollected={cashCollected}
            setCashCollected={setCashCollected}
            change={change}
            handleCompletePayment={() => setIsCheckoutModalOpen(true)}
            itemsCount={totals.items.length}
          />
        </div>
      </div>

      <PosCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        subtotal={totals.subtotal}
        tax={totals.tax}
        total={totals.total}
        onConfirmPayment={handleCheckoutModalConfirm}
        initialMode={paymentMethod === "Cash" ? "Cash" : paymentMethod === "UPI" ? "UPI" : "Card"}
      />

      <BillingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receipt}
      />
    </main>
  );
}
