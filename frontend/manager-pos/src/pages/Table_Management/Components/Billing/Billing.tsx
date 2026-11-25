
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import {
  LayoutDashboard,
  LogOut,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "../../../../components/Buttons/Button";
import { IconButton } from "../../../../components/Buttons/IconButton";
import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { OrderTotals } from "../../../../components/Cart/OrderTotals";
import { DesktopWindowControls } from "../../../../components/Header/DesktopWindowControls";
import { formatINR } from "../../../../lib/money";

import { TAX_RATE } from "../../Config/billing.config";
import { useBilling } from "../../Hooks/useBilling";

import { BillingHeader } from "./BillingHeader";
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

  // BILLING SCREEN STATE
  const [navOpen, setNavOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // SIDEBAR ESCAPE AND TAB KEY HANDLING
  useEffect(() => {
    if (!navOpen) return;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setNavOpen(false);
      }

      if (event.key !== "Tab") return;

      const elements =
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );

      if (!elements?.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown
      );

      previous?.focus();
    };
  }, [navOpen]);

  // ORDER TOTALS IN PAISE
  const subtotalPaise = Math.round(
    totals.subtotal * 100
  );

  const taxPaise = Math.round(
    totals.tax * 100
  );

  const grandTotalPaise = Math.round(
    totals.total * 100
  );

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

      {/* FULL-WIDTH HEADER */}
      <BillingHeader
        searchText={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchRef}
        onMenuClick={() => setNavOpen(true)}
        menuOpen={navOpen}
      />

      {/* EXPANDABLE NAVIGATION SIDEBAR */}
      {navOpen && (
        <div
          id="urqr-billing-drawer"
          className="urqr-billing-drawer"
        >
          <button
            type="button"
            className="urqr-billing-backdrop"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />

          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="POS navigation"
            className="urqr-billing-drawer-panel"
          >
            <div className="urqr-billing-drawer-head">
              <strong>URQR Manager POS</strong>

              <IconButton
                ref={closeRef}
                label="Close navigation"
                icon={<X size={18} />}
                variant="ghost"
                onClick={() => setNavOpen(false)}
              />
            </div>

            {/* TOP NAVIGATION */}
            <nav
              className="urqr-billing-drawer-links"
              aria-label="Main navigation"
            >
              <Link
                to="/pos/billing"
                aria-current="page"
                onClick={() => setNavOpen(false)}
              >
                <ReceiptText size={19} />
                Billing
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setNavOpen(false)}
              >
                <LayoutDashboard size={19} />
                Dashboard
              </Link>
            </nav>

            {/* BOTTOM PROFILE AND LOGOUT */}
            <div className="urqr-billing-drawer-bottom">
              <div className="urqr-billing-profile">
                <UserRound size={19} />
                Manager profile
              </div>

              <Link
                to="/login"
                onClick={() => setNavOpen(false)}
              >
                <LogOut size={19} />
                Logout
              </Link>

              <DesktopWindowControls />
            </div>
          </aside>
        </div>
      )}

      {/* FULL SCREEN — 60% CATALOG / 40% ORDER */}
      <div className="urqr-billing-workspace">

        {/* LEFT PRODUCT CATALOG */}
        <BillingCatalog
          searchQuery={searchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredDishes={filteredDishes}
          addToCart={addToCart}
          cart={cart}
        />

        {/* RIGHT ORDER SUMMARY */}
        <aside
          className="urqr-billing-summary"
          aria-label="Order Summary"
        >
          <BillingCart
            items={totals.items}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
            note={orderNote}
            setNote={setOrderNote}
          />

          {/* TOTALS AND PAYMENT ACTIONS */}
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

      {/* UNPAID ORDER PREVIEW MODAL */}
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
          <p>
            Unpaid order preview.
            This is not a completed receipt.
          </p>

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
                  Math.round(dish.price * 100) *
                  quantity
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

      {/* EXISTING CHECKOUT MODAL */}
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

      {/* EXISTING RECEIPT MODAL */}
      <BillingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={receipt}
      />
    </main>
  );
}
