import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";


import { PosIcon } from "../../../../components/Icons/PosIcon";
import { Button } from "../../../../components/Buttons/Button";
import { OrderTotals } from "../../../../components/Cart/OrderTotals";
import { useNotification } from "../../../../components/Notification/useNotification";
import { VirtualKeyboard } from "../../../../components/Keyboard/VirtualKeyboard";

import { TAX_RATE } from "../../Config/billing.config";
import { useBilling } from "../../Hooks/useBilling";

import { usePosPageHeader } from "../../../../components/Layout/PosLayoutContext";
import { BillingCatalog } from "./BillingCatalog";
import { BillingCart } from "./BillingCart";
import { OrderSummarySkeleton } from "./BillingSkeleton";
import { BillingReceiptModal } from "./BillingReceiptModal";
import { PosCheckoutModal } from "./PosCheckoutModal";

// Temporary preview order reference.
const generateOrderId = (): string =>
  String(
    Math.floor(1000 + Math.random() * 9000)
  );
  

export default function Billing() {
  // ==========================================
  // BILLING HOOK
  // ==========================================

  const {
    activeTab,
    setActiveTab,

    searchQuery,
    setSearchQuery,

    filteredDishes,
    isCatalogLoading,

    cart,
    addToCart,
    updateQuantity,
    clearCart,

    heldCarts,
    holdCurrentCart,
    recallCart,

    totals,

    handleCompletePayment,
    isCheckoutSubmitting,

    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
  } = useBilling();

  const notification = useNotification();

  // ==========================================
  // MODAL STATES
  // ==========================================

  const [showSkeleton] =
    useState(false);

  const [isDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [keyboardOpen, setKeyboardOpen] =
    useState(false);

  const [orderId, setOrderId] =
    useState(generateOrderId);

  const [previewTime, setPreviewTime] =
    useState(() => new Date());

  const searchRef =
    useRef<HTMLInputElement>(null);

  const hadItems = useRef(false);

  // ==========================================
  // GENERATE NEW ORDER REFERENCE
  // ==========================================

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

  // ==========================================
  // ORDER TOTALS
  // ==========================================

  const subtotalPaise = Math.round(
    totals.subtotal * 100
  );

  const taxPaise = Math.round(
    totals.tax * 100
  );

  const grandTotalPaise = Math.round(
    totals.total * 100
  );

  const cgstPaise = Math.round(
    taxPaise / 2
  );

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

  // Prevent other billing actions during checkout.
  const billingLocked =
    checkoutOpen || isCheckoutSubmitting;

  // ==========================================
  // VIRTUAL KEYBOARD
  // ==========================================

  const toggleKeyboard = useCallback(() => {
    if (billingLocked) return;

    setKeyboardOpen(
      (previous) => !previous
    );
  }, [billingLocked]);

  const clearProductSearch = useCallback(() => {
    setSearchQuery("");
    setActiveTab("all");
  }, [setSearchQuery, setActiveTab]);

  const pageHeader = useMemo(() => ({
    searchText: searchQuery,
    onSearchChange: setSearchQuery,
    searchInputRef: searchRef,
    isKeyboardOpen: keyboardOpen,
    onToggleKeyboard: toggleKeyboard,
    onClearSearch: clearProductSearch,
    navigationLocked: billingLocked,
  }), [searchQuery, setSearchQuery, keyboardOpen, toggleKeyboard, clearProductSearch, billingLocked]);

  usePosPageHeader(pageHeader);

  const closeKeyboard = () => {
    setKeyboardOpen(false);
  };

  const handleKeyPress = (
    key: string
  ) => {
    setSearchQuery(
      (previous) => previous + key
    );
  };

  const handleBackspace = () => {
    setSearchQuery(
      (previous) =>
        previous.slice(0, -1)
    );
  };

  // ==========================================
  // OPEN RECEIPT PREVIEW
  // ==========================================

  const openPreview = () => {
    if (!hasItems || billingLocked) {
      return;
    }

    setPreviewTime(new Date());
    setPreviewOpen(true);
  };

  // ==========================================
  // OPEN PAYMENT MODAL
  // ==========================================

  const openPaymentModal = () => {
    if (
      !hasItems ||
      billingLocked
    ) {
      return;
    }

    setKeyboardOpen(false);
    setPreviewOpen(false);

    setCheckoutOpen(true);
  };

  // ==========================================
  // CLOSE CHECKOUT MODAL
  // ==========================================

  const closePaymentModal = () => {
    if (isCheckoutSubmitting) {
      return;
    }

    setCheckoutOpen(false);
  };

  // ==========================================
  // TASK 5 - VIEW CONFIRMED RECEIPT
  // ==========================================

  const handleViewReceipt = () => {
    if (
      isCheckoutSubmitting ||
      !receipt
    ) {
      return;
    }

    // Close the success popup.
    setCheckoutOpen(false);

    // Open the existing receipt modal.
    setIsReceiptOpen(true);
  };

  // ==========================================
  // BILLING PAGE UI
  // ==========================================

  return (
    <>
      <div
        className="urqr-billing-workspace"
      >

        {/* =================================
            LEFT SECTION - PRODUCT CATALOG
            ================================= */}

        <div
          className="
            flex h-full min-h-0
            min-w-0 flex-col
            overflow-hidden
            max-[900px]:h-auto
            max-[900px]:overflow-visible
          "
        >
          <div
            className="
              min-h-0 min-w-0
              flex-1 overflow-y-auto
              pb-4
              max-[900px]:min-h-[420px]
            "
          >
            <BillingCatalog
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}

              activeTab={activeTab}

              setActiveTab={setActiveTab}

              filteredDishes={filteredDishes}

              addToCart={(dishId) => {
                if (!billingLocked) {
                  addToCart(dishId);
                }
              }}

              cart={cart}
              isLoading={isCatalogLoading || showSkeleton}
            />
          </div>

          {/* REUSABLE VIRTUAL KEYBOARD */}

          {keyboardOpen && (
            <div
              className="
                w-full shrink-0
                pt-2 pb-1
              "
            >
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

        {/* =================================
            RIGHT SECTION - ORDER CART
            ================================= */}

        {showSkeleton ? (
          <OrderSummarySkeleton itemCount={totals.items.length || 3} />
        ) : (
          <aside
            className="urqr-billing-summary"
            aria-label="Order Summary"
          >
          <BillingCart
            orderId={orderId}

            items={totals.items}

            updateQuantity={(
              dishId,
              quantity
            ) => {
              if (!billingLocked) {
                updateQuantity(
                  dishId,
                  quantity
                );
              }
            }}
          />

          <div className="urqr-billing-summary-footer">

            {/* REUSABLE ORDER TOTALS */}

            <OrderTotals
              subtotalPaise={subtotalPaise}

              grandTotalPaise={grandTotalPaise}

              taxLines={taxLines}

              collapsibleTaxes
            />

            {/* =================================
                HOLD AND CLEAR BUTTONS
                ================================= */}

            <div className="flex gap-2">

              {/* HOLD CART */}

              <Button
                leftIcon={<PosIcon name="cart" size={20} aria-hidden="true" />}
                variant="outline"

                className="
                  flex-1 text-xs py-2
                  text-amber-800 dark:text-[#E08A2E]
                  bg-amber-50/80 dark:bg-[#332414]
                  hover:bg-amber-100 dark:hover:bg-[#422E1A]
                  border-amber-200 dark:border-[#5C3D26]
                  transition-colors
                "

                disabled={
                  !hasItems ||
                  billingLocked
                }

                onClick={() => {
                  if (billingLocked) return;

                  holdCurrentCart();

                  notification.info(
                    "Order parked on hold."
                  );
                }}
              >
                Hold Cart{" "}

                {heldCarts.length > 0 &&
                  `(${heldCarts.length})`}
              </Button>

              {/* CLEAR CART */}

              <Button
                variant="outline"

                className="
                  text-xs py-2
                  text-rose-700 dark:text-[#E55353]
                  bg-rose-50/80 dark:bg-[#361A1A]
                  hover:bg-rose-100 dark:hover:bg-[#4A2020]
                  border-rose-200 dark:border-[#5C2626]
                  transition-colors
                "

                disabled={
                  !hasItems ||
                  billingLocked
                }

                onClick={() => {
                  if (billingLocked) return;

                  clearCart();

                  notification.info(
                    "Cart cleared."
                  );
                }}
              >
                Clear
              </Button>
            </div>

            {/* =================================
                PARKED ORDERS
                ================================= */}

            {heldCarts.length > 0 && (
              <div
                className="
                  rounded-xl border
                  border-amber-200 dark:border-[#5C3D26]
                  bg-amber-50/60 dark:bg-[#2A1E14]
                  p-2.5 text-xs
                "
              >
                <span
                  className="
                    font-semibold
                    text-amber-900 dark:text-[#E08A2E]
                  "
                >
                  Parked Orders (
                  {heldCarts.length}):
                </span>

                <div
                  className="
                    mt-1.5 flex flex-col
                    gap-1.5 max-h-28
                    overflow-y-auto
                  "
                >
                  {heldCarts.map((held) => (
                    <div
                      key={held.id}

                      className="
                        flex items-center
                        justify-between
                        rounded-lg bg-white dark:bg-[#1F1813]
                        border border-amber-100 dark:border-[#43352A]
                        px-2.5 py-1.5
                        shadow-2xs
                      "
                    >
                      <span
                        className="
                          text-[#7A6A5A] dark:text-[#BFAEA0] font-medium
                        "
                      >
                        {held.heldAt} •{" "}
                        {held.items.length} items
                      </span>

                      <button
                        type="button"

                        disabled={billingLocked}

                        onClick={() => {
                          if (billingLocked) {
                            return;
                          }

                          recallCart(held.id);

                          notification.success(
                            "Parked order recalled!"
                          );
                        }}

                        className="
                          font-semibold
                          text-[#8B5E3C] dark:text-[#B07C54]
                          hover:underline
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          cursor-pointer
                        "
                      >
                        Recall
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================
                PREVIEW BUTTON
                ================================= */}

            <Button
              variant="outline"

              fullWidth

              className="urqr-billing-preview-button"

              disabled={
                !hasItems ||
                billingLocked
              }

              onClick={openPreview}
            >
              Preview
            </Button>

            {/* =================================
                Proceed to Pay
                ================================= */}

            <Button
              id="billing-select-payment"

              variant="primary"

              fullWidth

              className="urqr-billing-pay-button"

              disabled={
                !hasItems ||
                billingLocked
              }

              isLoading={isCheckoutSubmitting}

              onClick={openPaymentModal}
            >
              {isCheckoutSubmitting
                ? "PROCESSING PAYMENT..."
                : "Proceed to Pay"}
            </Button>

          </div>
        </aside>
        )}
      </div>

      {/* =====================================
          RECEIPT PREVIEW MODAL
          ===================================== */}

      <BillingReceiptModal
        isOpen={
          previewOpen &&
          !checkoutOpen
        }

        onClose={() => {
          setPreviewOpen(false);
        }}

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

          restaurantName:
            "GRAND HORIZON",

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
          CHECKOUT MODAL
          DAY 5 TASK 5
          ===================================== */}

      <PosCheckoutModal
        isOpen={checkoutOpen}

        onClose={closePaymentModal}

        orderId={orderId}

        subtotal={totals.subtotal}

        tax={totals.tax}

        total={totals.total}

        initialMode="Cash"

        isSubmitting={isCheckoutSubmitting}

        // =================================
        // TYPESCRIPT ERROR FIX
        // Return backend confirmation or buffered status.
        // =================================

        onConfirmPayment={async (
          checkout
        ): Promise<boolean | "buffered"> => {
          const completed =
            await handleCompletePayment(
              checkout
            );

          // Return actual checkout outcome.
          // Do not close checkout here.
          return completed;
        }}

        // Open receipt after success popup.
        onViewReceipt={handleViewReceipt}
      />

      {/* =====================================
          FINAL CONFIRMED RECEIPT MODAL
          ===================================== */}

      <BillingReceiptModal
        isOpen={
          isReceiptOpen &&
          !checkoutOpen &&
          receipt !== null
        }

        onClose={() => {
          setIsReceiptOpen(false);
        }}

        receipt={receipt}
      />
    </>
  );
}