
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "../../../../components/Buttons/Button";
import { OrderTotals } from "../../../../components/Cart/OrderTotals";
import { useNotification } from "../../../../components/Notification/useNotification";
import { formatINR } from "../../../../lib/money";
import { TAX_RATE } from "../../Config/billing.config";
import { useBilling } from "../../Hooks/useBilling";

import { BillingHeader } from "./BillingHeader";
import { BillingSidebar } from "./BillingSidebar";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
import { BillingReceiptModal } from "./BillingReceiptModal";
import { PosCheckoutModal } from "./PosCheckoutModal";

const generateOrderId = (): string =>
  String(
    Math.floor(1000 + Math.random() * 9000)
  );

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

  // EXISTING REUSABLE NOTIFICATION
  const notification = useNotification();

  const [navOpen, setNavOpen] =
    useState(false);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [orderId, setOrderId] =
    useState(generateOrderId);

  const [previewTime, setPreviewTime] =
    useState(() => new Date());

  const searchRef =
    useRef<HTMLInputElement>(null);

  const hadItems = useRef(false);

  // Create a new demo order ID after
  // the previous order becomes empty.
  useEffect(() => {
    if (
      hadItems.current &&
      totals.items.length === 0
    ) {
      setOrderId(generateOrderId());
    }

    hadItems.current =
      totals.items.length > 0;
  }, [totals.items.length]);

  const subtotalPaise = Math.round(
    totals.subtotal * 100
  );

  const taxPaise = Math.round(
    totals.tax * 100
  );

  const grandTotalPaise = Math.round(
    totals.total * 100
  );

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

  const hasItems =
    totals.items.length > 0;

  // Open existing receipt-style preview.
  const openPreview = () => {
    setPreviewTime(new Date());
    setPreviewOpen(true);
  };

  // =========================================
  // OPEN PAYMENT MODAL
  // =========================================
  const openPaymentModal = () => {
    if (!hasItems) return;

    setCheckoutOpen(true);
  };

  return (
    <main className="urqr-billing-screen">

      {/* HEADER */}
      <BillingHeader
        searchText={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchRef}
        onMenuClick={() => setNavOpen(true)}
        menuOpen={navOpen}
      />

      {/* SIDEBAR */}
      <BillingSidebar
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
      />

      {/* 60% CATALOG / 40% ORDER SUMMARY */}
      <div className="urqr-billing-workspace">

        {/* PRODUCT CATALOG */}
        <BillingCatalog
          searchQuery={searchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredDishes={filteredDishes}
          addToCart={addToCart}
          cart={cart}
        />

        {/* ORDER SUMMARY */}
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

            {/* REUSABLE ORDER TOTALS */}
            <OrderTotals
              subtotalPaise={subtotalPaise}
              grandTotalPaise={grandTotalPaise}
              taxLines={taxLines}
              collapsibleTaxes
            />

            {/* ORDER PREVIEW */}
            <Button
              variant="outline"
              fullWidth
              className="urqr-billing-preview-button"
              disabled={!hasItems}
              onClick={openPreview}
            >
              Preview
            </Button>

            {/* PAYMENT MODAL BUTTON */}
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

            <p className="urqr-billing-pay-hint">
              Cash · UPI · Others
            </p>

          </div>
        </aside>
      </div>

      {/* EXISTING RECEIPT PREVIEW */}
      <BillingReceiptModal
        isOpen={previewOpen}
        onClose={() =>
          setPreviewOpen(false)
        }
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

      {/* =====================================
          PAYMENT AMOUNT MODAL
          CASH DEFAULT / UPI DEMO QR
      ===================================== */}
      <PosCheckoutModal
        isOpen={checkoutOpen}
        onClose={() =>
          setCheckoutOpen(false)
        }
        orderId={orderId}
        subtotal={totals.subtotal}
        tax={totals.tax}
        total={totals.total}
        initialMode="Cash"
        onConfirmPayment={(checkout) => {

          // Existing Billing hook validates
          // and completes the local demo order.
          const completed =
            handleCompletePayment(
              checkout,
              orderId
            );

          if (!completed) {
            notification.error(
              "Payment could not be completed. Check the cash amount."
            );
            return;
          }

          // Close payment dialog.
          setCheckoutOpen(false);

          // EXISTING REUSABLE SUCCESS POPUP
          notification.success(
            "Payment successful! (Demo only)"
          );
        }}
      />

      {/* EXISTING COMPLETED RECEIPT */}
      <BillingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() =>
          setIsReceiptOpen(false)
        }
        receipt={receipt}
      />

    </main>
  );
}
