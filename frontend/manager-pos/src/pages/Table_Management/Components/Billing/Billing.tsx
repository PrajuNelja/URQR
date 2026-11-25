
import { useRef, useState } from "react";

import { Button } from "../../../../components/Buttons/Button";
import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { OrderTotals } from "../../../../components/Cart/OrderTotals";
import { formatINR } from "../../../../lib/money";

import { TAX_RATE } from "../../Config/billing.config";
import { useBilling } from "../../Hooks/useBilling";

import { BillingHeader } from "./BillingHeader";
import { BillingSidebar } from "./BillingSidebar";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
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
    handleCompletePayment,
    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
  } = useBilling();

  const [navOpen, setNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);

  // Order totals
  const subtotalPaise = Math.round(totals.subtotal * 100);
  const taxPaise = Math.round(totals.tax * 100);
  const grandTotalPaise = Math.round(totals.total * 100);

  const cgstPaise = Math.round(taxPaise / 2);

  const taxLines = [
    {
      label: `CGST (${TAX_RATE / 2}%)`,
      amountPaise: cgstPaise,
    },
    {
      label: `SGST (${TAX_RATE / 2}%)`,
      amountPaise: taxPaise - cgstPaise,
    },
  ];

  const hasItems = totals.items.length > 0;

  return (
    <main className="urqr-billing-screen">
      {/* FULL-WIDTH BILLING HEADER */}
      <BillingHeader
        searchText={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchRef}
        onMenuClick={() => setNavOpen(true)}
        menuOpen={navOpen}
      />

      {/* THE ONE ACTIVE SIDEBAR */}
      <BillingSidebar
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
      />

      {/* 60% CATALOG / 40% ORDER SUMMARY */}
      <div className="urqr-billing-workspace">
        <BillingCatalog
          searchQuery={searchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredDishes={filteredDishes}
          addToCart={addToCart}
          cart={cart}
        />

        <aside
          className="urqr-billing-summary"
          aria-label="Order Summary"
        >
          <BillingCart
            items={totals.items}
            updateQuantity={updateQuantity}
          />

          <div className="urqr-billing-summary-footer">
            <OrderTotals
              subtotalPaise={subtotalPaise}
              taxLines={taxLines}
              grandTotalPaise={grandTotalPaise}
              collapsibleTaxes
            />

            <Button
              variant="outline"
              fullWidth
              className="urqr-billing-preview-button"
              disabled={!hasItems}
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>

            <Button
              id="billing-select-payment"
              fullWidth
              className="urqr-billing-pay-button"
              disabled={!hasItems}
              onClick={() => setCheckoutOpen(true)}
            >
              SELECT PAYMENT METHOD
            </Button>

            <p className="urqr-billing-pay-hint">
              UPI · Cash · Others
            </p>
          </div>
        </aside>
      </div>

      {/* DRAFT ORDER PREVIEW */}
      <PopupModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Draft order preview — unpaid"
        size="lg"
        footer={
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(false)}
          >
            Close
          </Button>
        }
      >
        <div className="urqr-billing-order-preview">
          <p>This is an unpaid order preview.</p>

          {totals.items.map(({ dish, quantity }) => (
            <div
              className="urqr-billing-preview-line"
              key={dish.id}
            >
              <span>
                {dish.name} × {quantity}
              </span>

              <strong>
                {formatINR(
                  Math.round(dish.price * 100) * quantity
                )}
              </strong>
            </div>
          ))}

          <OrderTotals
            subtotalPaise={subtotalPaise}
            taxLines={taxLines}
            grandTotalPaise={grandTotalPaise}
            collapsibleTaxes
          />
        </div>
      </PopupModal>

      {/* REUSE EXISTING CHECKOUT MODAL */}
      <PosCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        subtotal={totals.subtotal}
        tax={totals.tax}
        total={totals.total}
        initialMode={
          paymentMethod === "Others"
            ? "Card"
            : paymentMethod
        }
        onConfirmPayment={(checkout) => {
          if (handleCompletePayment(checkout)) {
            setCheckoutOpen(false);
          }
        }}
      />

      {/* REUSE EXISTING RECEIPT MODAL */}
      <BillingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receipt}
      />
    </main>
  );
}
