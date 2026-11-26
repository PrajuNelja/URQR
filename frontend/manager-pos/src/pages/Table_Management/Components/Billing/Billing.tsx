
import { useEffect, useRef, useState } from "react";
import type { PaymentMode } from "@urqr/types";

import { Button } from "../../../../components/Buttons/Button";
import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { OrderTotals } from "../../../../components/Cart/OrderTotals";

import { TAX_RATE } from "../../Config/billing.config";
import { useBilling } from "../../Hooks/useBilling";

import { BillingHeader } from "./BillingHeader";
import { BillingSidebar } from "./BillingSidebar";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
import { BillingReceiptModal } from "./BillingReceiptModal";
import { PosCheckoutModal } from "./PosCheckoutModal";

import { formatINR } from "../../../../lib/money";

const generateOrderId = () =>
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

  const [navOpen, setNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paymentPopupOpen, setPaymentPopupOpen] =
    useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMode>("Cash");

  const [orderId, setOrderId] =
    useState(generateOrderId);

  const [previewTime, setPreviewTime] =
    useState(() => new Date());

  const searchRef = useRef<HTMLInputElement>(null);
  const hadItems = useRef(false);

  useEffect(() => {
    if (
      hadItems.current &&
      totals.items.length === 0
    ) {
      setOrderId(generateOrderId());
    }

    hadItems.current = totals.items.length > 0;
  }, [totals.items.length]);

  const subtotalPaise =
    Math.round(totals.subtotal * 100);

  const taxPaise =
    Math.round(totals.tax * 100);

  const grandTotalPaise =
    Math.round(totals.total * 100);

  const cgstPaise =
    Math.round(taxPaise / 2);

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

  // Open receipt-style preview
  const openPreview = () => {
    setPreviewTime(new Date());
    setPreviewOpen(true);
  };

  const choosePaymentMethod = (
    method: PaymentMode
  ) => {
    setSelectedMethod(method);
    setPaymentPopupOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <main className="urqr-billing-screen">

      {/* EXISTING HEADER */}
      <BillingHeader
        searchText={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchRef}
        onMenuClick={() => setNavOpen(true)}
        menuOpen={navOpen}
      />

      {/* EXISTING SIDEBAR */}
      <BillingSidebar
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
      />

      {/* MAIN BILLING SCREEN */}
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
            orderId={orderId}
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

            {/* RECEIPT PREVIEW */}
            <Button
              variant="outline"
              fullWidth
              className="urqr-billing-preview-button"
              disabled={!hasItems}
              onClick={openPreview}
            >
              Preview
            </Button>

            {/* PAYMENT SELECTION */}
            <Button
              id="billing-select-payment"
              fullWidth
              className="urqr-billing-pay-button"
              disabled={!hasItems}
              onClick={() =>
                setPaymentPopupOpen(true)
              }
            >
              SELECT PAYMENT METHOD
            </Button>

            <p className="urqr-billing-pay-hint">
              UPI · Cash · Others
            </p>
          </div>
        </aside>
      </div>

      {/* NEW RECEIPT-STYLE PREVIEW */}
      <BillingReceiptModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        receipt={null}
        previewOrder={{
          orderId: `#${orderId}`,
          date: previewTime.toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          ),
          time: previewTime.toLocaleTimeString(
            "en-IN",
            {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }
          ),
          restaurantName: "GRAND HORIZON",
          items: totals.items.map(
            ({ dish, quantity }) => ({
              name: dish.name,
              price: dish.price,
              quantity,
            })
          ),
          subtotal: totals.subtotal,
          tax: totals.tax,
          taxRate: TAX_RATE,
          total: totals.total,
        }}
      />

      {/* EXISTING SELECT PAYMENT POPUP */}
      <PopupModal
        isOpen={paymentPopupOpen}
        onClose={() => setPaymentPopupOpen(false)}
        title="Select Payment Method"
        size="md"
        className="urqr-payment-reference-modal"
      >
        <div className="urqr-payment-reference-content">

          <div className="urqr-payment-reference-amount">
            <span>
              Amount Payable (Order #{orderId})
            </span>

            <strong>
              {formatINR(grandTotalPaise)}
            </strong>
          </div>

          <div className="urqr-payment-reference-options">

            <Button
              variant="outline"
              size="md"
              fullWidth
              className="urqr-payment-reference-option"
              onClick={() =>
                choosePaymentMethod("UPI")
              }
            >
              UPI
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              className="urqr-payment-reference-option"
              onClick={() =>
                choosePaymentMethod("Cash")
              }
            >
              Cash
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              className="urqr-payment-reference-option"
              onClick={() =>
                choosePaymentMethod("Card")
              }
            >
              Others
            </Button>
          </div>
        </div>
      </PopupModal>

      {/* EXISTING CHECKOUT */}
      <PosCheckoutModal
        key={selectedMethod}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        subtotal={totals.subtotal}
        tax={totals.tax}
        total={totals.total}
        initialMode={selectedMethod}
        onConfirmPayment={(checkout) => {
          if (handleCompletePayment(checkout)) {
            setCheckoutOpen(false);
          }
        }}
      />

      {/* EXISTING COMPLETED RECEIPT */}
     
<BillingReceiptModal
  isOpen={previewOpen}
  onClose={() => setPreviewOpen(false)}
  receipt={null}
  previewOrder={{
    orderId: `#${orderId}`,
    date: previewTime.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: previewTime.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    restaurantName: "GRAND HORIZON",
    items: totals.items.map(({ dish, quantity }) => ({
      name: dish.name,
      price: dish.price,
      quantity,
    })),
    subtotal: totals.subtotal,
    tax: totals.tax,
    taxRate: TAX_RATE,
    total: totals.total,
  }}
/>

    </main>
  );
}
