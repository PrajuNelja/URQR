
import { useRef, useState } from "react";
import { useBilling } from "../../Hooks/useBilling";

import { BillingHeader } from "./BillingHeader";
import { BillingSidebar } from "./BillingSidebar";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
import { BillingPayment } from "./BillingPayment";
import { BillingReceiptModal } from "./BillingReceiptModal";
import { PosCheckoutModal } from "./PosCheckoutModal";

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

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [orderNote, setOrderNote] = useState("");

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] =
    useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleCheckoutModalConfirm = () => {
    setIsCheckoutModalOpen(false);
    handleCompletePayment();
  };

  return (
    <main className="urqr-billing-screen flex min-h-dvh w-full min-w-0 flex-col bg-bg font-sans text-text lg:h-dvh lg:overflow-hidden">
      {/* FULL WIDTH HEADER */}
      <BillingHeader
        searchText={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        isMenuOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      {/* COLLAPSIBLE NAVIGATION */}
      <BillingSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 60% CATALOG / 40% ORDER AND PAYMENT */}
      <div className="grid w-full min-w-0 flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-h-[420px] min-w-0 lg:min-h-0 lg:overflow-hidden">
          <BillingCatalog
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredDishes={filteredDishes}
            addToCart={addToCart}
            cart={cart}
          />
        </div>

        {/* Existing order and payment components preserved */}
        <div className="flex min-w-0 flex-col gap-4 border-t border-border bg-surface p-4 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
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
            itemsCount={totals.items.length}
            handleCompletePayment={() =>
              setIsCheckoutModalOpen(true)
            }
          />
        </div>
      </div>

      {/* Existing checkout workflow */}
      <PosCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        subtotal={totals.subtotal}
        tax={totals.tax}
        total={totals.total}
        onConfirmPayment={handleCheckoutModalConfirm}
        initialMode={
          paymentMethod === "Cash"
            ? "Cash"
            : paymentMethod === "UPI"
              ? "UPI"
              : "Card"
        }
      />

      {/* Existing receipt workflow */}
      <BillingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receipt}
      />
    </main>
  );
}
