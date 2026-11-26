// src/pages/Table_Management/Components/Billing/Billing.tsx
import { useEffect, useRef, useState } from "react";

import { Button } from "../../../../components/Buttons/Button";
import { OrderTotals } from "../../../../components/Cart/OrderTotals";
import { useNotification } from "../../../../components/Notification/useNotification";
import { VirtualKeyboard } from "../../../../components/Keyboard/VirtualKeyboard";

import { TAX_RATE } from "../../Config/billing.config";
import { useBilling } from "../../Hooks/useBilling";

import { BillingHeader } from "./BillingHeader";
import { BillingSidebar } from "./BillingSidebar";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
import { BillingReceiptModal } from "./BillingReceiptModal";
import { PosCheckoutModal } from "./PosCheckoutModal";

const generateOrderId = (): string =>
  String(Math.floor(1000 + Math.random() * 9000));

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
    totals,
    handleCompletePayment,
    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
  } = useBilling();

  const notification = useNotification();

  const [navOpen, setNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // VIRTUAL KEYBOARD STATE
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const [orderId, setOrderId] = useState(generateOrderId);
  const [previewTime, setPreviewTime] = useState(() => new Date());

  const searchRef = useRef<HTMLInputElement>(null);
  const hadItems = useRef(false);

  useEffect(() => {
    if (hadItems.current && totals.items.length === 0) {
      setOrderId(generateOrderId());
    }
    hadItems.current = totals.items.length > 0;
  }, [totals.items.length]);

  const subtotalPaise = Math.round(totals.subtotal * 100);
  const taxPaise = Math.round(totals.tax * 100);
  const grandTotalPaise = Math.round(totals.total * 100);
  const cgstPaise = Math.round(taxPaise / 2);

  const taxLines = [
    { label: `CGST (${TAX_RATE / 2}%)`, amountPaise: cgstPaise },
    { label: `SGST (${TAX_RATE / 2}%)`, amountPaise: taxPaise - cgstPaise },
  ];

  const hasItems = totals.items.length > 0;

  // ======================================
  // VIRTUAL KEYBOARD FUNCTIONS
  // ======================================

  // TOGGLE FUNCTION
  const toggleKeyboard = () => {
    setKeyboardOpen((prev) => !prev);
  };

  const clearProductSearch = () => {
    setSearchQuery("");
    setActiveTab("all");
  };

  const closeKeyboard = () => {
    setKeyboardOpen(false);
  };

  const handleKeyPress = (key: string) => {
    setSearchQuery((prev) => prev + key);
  };

  const handleBackspace = () => {
    setSearchQuery((prev) => prev.slice(0, -1));
  };

  // ======================================
  // RECEIPT PREVIEW & PAYMENT
  // ======================================

  const openPreview = () => {
    setPreviewTime(new Date());
    setPreviewOpen(true);
  };

  const openPaymentModal = () => {
    if (!hasItems) return;
    setKeyboardOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <main className="urqr-billing-screen">
      <BillingHeader
        searchText={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchRef}
        onMenuClick={() => setNavOpen(true)}
        menuOpen={navOpen}
        isKeyboardOpen={keyboardOpen} // Pass state
        onToggleKeyboard={toggleKeyboard} // Pass toggle handler
        onClearSearch={clearProductSearch}
      />

      <BillingSidebar
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="urqr-billing-workspace">
        
        {/* LEFT SECTION (60%) */}
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible">
          
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto max-[900px]:min-h-[420px] pb-4">
            <BillingCatalog
              searchQuery={searchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredDishes={filteredDishes}
              addToCart={addToCart}
              cart={cart}
            />
          </div>

          {/* VIRTUAL KEYBOARD */}
          {keyboardOpen && (
            <div className="shrink-0 w-full pt-2 pb-1">
              <VirtualKeyboard
                isOpen={keyboardOpen}
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onClear={clearProductSearch}
                onEnter={closeKeyboard}
              />
            </div>
          )}
        </div>

        {/* RIGHT SECTION (40%) */}
        <aside className="urqr-billing-summary" aria-label="Order Summary">
          <BillingCart
            orderId={orderId}
            items={totals.items}
            updateQuantity={updateQuantity}
          />

          <div className="urqr-billing-summary-footer">
            <OrderTotals
              subtotalPaise={subtotalPaise}
              grandTotalPaise={grandTotalPaise}
              taxLines={taxLines}
              collapsibleTaxes
            />

            <Button
              variant="outline"
              fullWidth
              className="urqr-billing-preview-button"
              disabled={!hasItems}
              onClick={openPreview}
            >
              Preview
            </Button>

            <Button
              id="billing-select-payment"
              variant="primary"
              fullWidth
              className="urqr-billing-pay-button"
              disabled={!hasItems}
              onClick={openPaymentModal}
            >
              SELECT PAYMENT METHOD
            </Button>

            <p className="urqr-billing-pay-hint">Cash · UPI · Others</p>
          </div>
        </aside>
      </div>

      {/* MODALS... */}
      <BillingReceiptModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        receipt={null}
        previewOrder={{
          orderId: `#${orderId}`,
          date: previewTime.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          time: previewTime.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
          restaurantName: "GRAND HORIZON",
          items: totals.items.map(({ dish, quantity }) => ({ name: dish.name, price: dish.price, quantity })),
          subtotal: totals.subtotal,
          tax: totals.tax,
          taxRate: TAX_RATE,
          total: totals.total,
        }}
      />

      <PosCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        orderId={orderId}
        subtotal={totals.subtotal}
        tax={totals.tax}
        total={totals.total}
        initialMode="Cash"
        onConfirmPayment={(checkout) => {
          const completed = handleCompletePayment(checkout, orderId);
          if (!completed) {
            notification.error("Payment could not be completed. Check the cash amount.");
            return;
          }
          setCheckoutOpen(false);
          notification.success("Payment successful! (Demo only)");
        }}
      />

      <BillingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receipt}
      />
    </main>
  );
}