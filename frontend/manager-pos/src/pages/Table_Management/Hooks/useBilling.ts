import { bufferOfflineOrder } from "../../../lib/indexedDB/offlineOrderStorage";
import { useAuthStore } from "../../../lib/authStore";
import { CheckoutError } from "../Components/Billing/checkoutErrors";
import {
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";

import { useCatalogSync } from "./useCatalogSync";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
} from "@urqr/types";

import type {
  CartItem,
  PaymentMethod,
  ReceiptData,
  Dish,
} from "../Types/billing.types";

import {
  TAX_RATE,
  CATEGORIES,
} from "../Config/billing.config";

import {
  usePosHotkeys,
} from "./usePosHotkeys";

import {
  useCartStore,
} from "../../../lib/cartStore";

// DAY 5 MORNING TASK 3

import {
  useCheckoutIdempotency,
} from "./useCheckoutIdempotency";

// DAY 5 MORNING TASK 4

import {
  useOrderMutation,
} from "./useOrderMutation";

// DAY 5 AFTERNOON TASK 1

import {
  useAutoReceiptPrint,
} from "./useAutoReceiptPrint";

import type {
  OrderPayload,
} from "../Components/Billing/orderApi";

// ==========================================
// MAIN BILLING HOOK
// ==========================================

const EMPTY_CATALOG: Dish[] = [];

export type CheckoutResult = boolean | "buffered";

export const useBilling = () => {
  const tenantId = useAuthStore((state) => state.tenantId);
  const token = useAuthStore((state) => state.accessToken);
  const storeId = tenantId ? `${import.meta.env.DEV ? "dev" : "prod"}:${tenantId}` : null;
  // ==========================================
  // CHECKOUT IDEMPOTENCY
  // ==========================================

  const {
    getCheckoutHeaders,
    resetIdempotencyKey,
  } = useCheckoutIdempotency();

  // ==========================================
  // TANSTACK QUERY ORDER MUTATION
  // ==========================================

  const {
    mutateAsync: submitOrder,
    isPending: isCheckoutSubmitting,
  } = useOrderMutation();

  // ==========================================
  // AUTOMATIC RECEIPT PRINTING
  // ==========================================

  const {
    printConfirmedReceipt,
  } = useAutoReceiptPrint();

  // Prevent duplicate checkout submission.

  const checkoutLock = useRef(false);

  // Preserve payload during checkout retries.

  const pendingPayload =
    useRef<string | null>(null);

  // ==========================================
  // BILLING STATES
  // ==========================================

  const [activeTab, setActiveTab] =
    useState("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [cart, setCart] =
    useState<Record<number, number>>({});

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash");

  const [cashCollected, setCashCollected] =
    useState("");

  const [receipt, setReceipt] =
    useState<ReceiptData | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] =
    useState(false);

  // ==========================================
  // TANSTACK QUERY CATALOG
  // ==========================================

  const {
    data: dishes = EMPTY_CATALOG,
    refetch: refreshCatalog,
    isLoading: isCatalogLoading,
  } = useCatalogSync();

  // ==========================================
  // PRODUCT SEARCH AND CATEGORY FILTER
  // ==========================================

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory =
        activeTab === "all" ||
        dish.category.toLowerCase() ===
          activeTab.toLowerCase();

      const matchesSearch =
        dish.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      return matchesCategory && matchesSearch;
    });
  }, [
    dishes,
    activeTab,
    searchQuery,
  ]);

  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================

  const addToCart = useCallback(
    (dishId: number) => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setCart((previous) => ({
        ...previous,

        [dishId]:
          (previous[dishId] || 0) + 1,
      }));

      const dish = dishes.find(
        (d) => d.id === dishId
      );

      if (dish) {
        useCartStore.getState().addItem({
          id: String(dish.id),

          name: dish.name,

          unitPricePaise: Math.round(
            dish.price * 100
          ),

          taxable: true,
        });
      }
    },
    [dishes]
  );

  // ==========================================
  // UPDATE PRODUCT QUANTITY
  // ==========================================

  const updateQuantity = useCallback(
    (dishId: number, delta: number) => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setCart((previous) => {
        const next = { ...previous };

        const quantity =
          (next[dishId] || 0) + delta;

        if (quantity <= 0) {
          delete next[dishId];
        } else {
          next[dishId] = quantity;
        }

        useCartStore
          .getState()
          .setQuantity(
            String(dishId),
            Math.max(0, quantity)
          );

        return next;
      });
    },
    []
  );

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = useCallback(() => {
    if (
      checkoutLock.current ||
      pendingPayload.current !== null
    ) {
      return;
    }

    setCart({});

    setCashCollected("");

    useCartStore
      .getState()
      .clearCart();
  }, []);

  // ==========================================
  // HOLD AND RECALL CART
  // ==========================================

  const heldCarts = useCartStore(
    (state) => state.heldCarts
  );

  // HOLD CART

  const holdCurrentCart = useCallback(() => {
    if (
      checkoutLock.current ||
      pendingPayload.current !== null
    ) {
      return;
    }

    if (
      Object.keys(cart).length === 0
    ) {
      return;
    }

    useCartStore
      .getState()
      .holdCurrentCart();

    setCart({});

    setCashCollected("");
  }, [cart]);

  // RECALL CART

  const recallCart = useCallback(
    (id: string) => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      const target = useCartStore
        .getState()
        .heldCarts.find(
          (c) => c.id === id
        );

      if (!target) return;

      useCartStore
        .getState()
        .recallCart(id);

      const restoredCart:
        Record<number, number> = {};

      for (const item of target.items) {
        restoredCart[
          Number(item.productId)
        ] = item.quantity;
      }

      setCart(restoredCart);
    },
    []
  );

  // DELETE HELD CART

  const deleteHeldCart = useCallback(
    (id: string) => {
      useCartStore
        .getState()
        .deleteHeldCart(id);
    },
    []
  );

  // ==========================================
  // CART TOTAL CALCULATIONS
  // ==========================================

  const totals = useMemo(() => {
    const items: CartItem[] =
      Object.keys(cart)
        .map((id) => {
          const dish = dishes.find(
            (product) =>
              product.id === Number(id)
          );

          if (!dish) return null;

          return {
            dish,

            quantity:
              cart[Number(id)],
          };
        })
        .filter(
          (item): item is CartItem =>
            item !== null
        );

    // SUBTOTAL

    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        item.dish.price *
          item.quantity,
      0
    );

    // TAX

    const tax =
      Math.round(
        subtotal *
          (TAX_RATE / 100) *
          100
      ) / 100;

    // GRAND TOTAL

    const total =
      Math.round(
        (subtotal + tax) * 100
      ) / 100;

    return {
      items,
      subtotal,
      tax,
      total,
    };
  }, [cart, dishes]);

  // ==========================================
  // CHANGE DUE CALCULATION
  // ==========================================

  const change = useMemo(() => {
    if (paymentMethod !== "Cash") {
      return 0;
    }

    const cash =
      parseFloat(cashCollected);

    if (Number.isNaN(cash)) {
      return NaN;
    }

    return (
      Math.round(
        (cash - totals.total) * 100
      ) / 100
    );
  }, [
    paymentMethod,
    cashCollected,
    totals.total,
  ]);

  // ==========================================
  // CHECKOUT BACKEND API INTEGRATION
  // ==========================================

  const handleCompletePayment = useCallback(
    async (
      checkout: CheckoutRequest
    ): Promise<CheckoutResult> => {
      // Prevent double submission.

      if (checkoutLock.current) {
        return false;
      }

      // ======================================
      // VALIDATE CHECKOUT
      // ======================================

      const parsed =
        CheckoutRequestSchema.safeParse(
          checkout
        );

      if (
        !parsed.success ||
        !totals.items.length
      ) {
        throw new Error(
          "Invalid checkout details or empty cart."
        );
      }

      const payment = parsed.data;

      // Existing Cash-only development flow.

      if (
        payment.paymentMode !== "Cash"
      ) {
        throw new Error(
          "Only cash checkout is available in this development flow."
        );
      }

      // ======================================
      // INTEGER PAISE VALIDATION
      // ======================================

      const payablePaise = Math.round(
        totals.total * 100
      );

      const receivedPaise = Math.round(
        payment.amountTendered * 100
      );

      if (
        !Number.isSafeInteger(
          payablePaise
        ) ||
        payablePaise <= 0 ||
        !Number.isSafeInteger(
          receivedPaise
        ) ||
        receivedPaise < payablePaise ||
        Math.round(
          payment.payableAmount * 100
        ) !== payablePaise ||
        Math.round(
          payment.changeDue * 100
        ) !==
          receivedPaise - payablePaise
      ) {
        throw new Error(
          "Invalid cash amount or cart total."
        );
      }

      // ======================================
      // VALIDATE ORDER QUANTITIES
      // ======================================

      if (
        totals.items.length > 100 ||
        totals.items.some(
          ({ quantity }) =>
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 15
        )
      ) {
        throw new Error(
          "Invalid order quantities."
        );
      }

      // ======================================
      // PREPARE ORDER PAYLOAD
      // ======================================

      const payload: OrderPayload = {
        items: totals.items.map(
          ({ dish, quantity }) => ({
            // Numeric IDs are currently
            // used for MSW fixtures.

            menuItemId: String(dish.id),

            quantity,
          })
        ),

        payments: [
          {
            method: "CASH",

            amount:
              payablePaise / 100,
          },
        ],
      };

      // ======================================
      // PRESERVE PAYLOAD FOR SAFE RETRY
      // ======================================

      const fingerprint = JSON.stringify({
        payload,

        receivedPaise,
      });

      if (
        pendingPayload.current !== null &&
        pendingPayload.current !== fingerprint
      ) {
        throw new Error(
          "Retry the unchanged checkout; the previous result is unresolved."
        );
      }

      const offline = !navigator.onLine;
      if (offline && pendingPayload.current !== null) {
        throw new CheckoutError({
          title: "Previous Order Pending",
          message: "Reconnect and verify the original checkout before retrying.",
          requiresVerification: true,
        });
      }
      if (offline && (!storeId || !token)) {
        throw new Error("Offline checkout requires an authenticated tenant.");
      }
      checkoutLock.current = true;

      pendingPayload.current = fingerprint;

      try {
        if (offline && storeId) {
          try {
            await bufferOfflineOrder({
              storeId,
              idempotencyKey: getCheckoutHeaders()["Idempotency-Key"],
              payload,
              payablePaise,
              tenderedPaise: receivedPaise,
              changeDuePaise: receivedPaise - payablePaise,
            });
          } catch {
            pendingPayload.current = null;
            throw new CheckoutError({
              title: "Offline Order Not Saved",
              message: "Local storage failed. Keep the cart and retry after checking storage.",
              requiresVerification: false,
            });
          }
          setReceipt(null);
          setIsReceiptOpen(false);
          resetIdempotencyKey();
          pendingPayload.current = null;
          checkoutLock.current = false;
          clearCart();
          return "buffered";
        }
        // ====================================
        // RECORD CHECKOUT START TIME
        // ====================================

        const checkoutStartedAt =
          performance.now();

        if (import.meta.env.DEV) {
          console.log(
            "[CHECKOUT] Submitting order"
          );
        }

        // ====================================
        // POST ORDER REQUEST
        // ====================================

        const result = await submitOrder({
          payload,

          headers: getCheckoutHeaders(),
        });

        // ====================================
        // CHECKOUT SUCCESS DEBUGGING
        // ====================================

        if (import.meta.env.DEV) {
          console.log(
            "[CHECKOUT] Order confirmed:",
            result.orderNumber
          );

          console.log(
            "[CHECKOUT] Is demo order:",
            result.demo
          );
        }

        const now = new Date();

        // ====================================
        // GENERATE CONFIRMED RECEIPT
        // ====================================

        const newReceipt: ReceiptData = {
          orderId:
            `#${result.orderNumber}`,

          date: now.toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",

              month: "short",

              year: "numeric",
            }
          ),

          time: now.toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",

              minute: "2-digit",
            }
          ),

          items: totals.items.map(
            ({ dish, quantity }) => ({
              name: dish.name,

              price: dish.price,

              quantity,
            })
          ),

          subtotal:
            totals.subtotal,

          taxRate:
            TAX_RATE,

          tax:
            totals.tax,

          total:
            totals.total,

          paymentMethod:
            "Cash",

          cashCollected:
            receivedPaise / 100,

          change:
            (receivedPaise - payablePaise) /
            100,
        };

        // ====================================
        // STORE RECEIPT DATA
        // ====================================

        setReceipt(newReceipt);

        // Receipt opens when the cashier
        // clicks the View Receipt button.

        setIsReceiptOpen(false);

        if (import.meta.env.DEV) {
          console.log(
            "[PRINT] Receipt generated:",
            newReceipt.orderId
          );
        }

        // ====================================
        // RESET CHECKOUT STATE
        // ====================================

        resetIdempotencyKey();

        pendingPayload.current = null;

        checkoutLock.current = false;

        // Clear cart only after confirmation.

        clearCart();

        // ====================================
        // DAY 5 AFTERNOON TASK 1
        // AUTOMATIC RECEIPT PRINTING
        // ====================================

        // Physical printing is allowed only
        // for explicitly confirmed non-demo orders.

        if (result.demo === false) {
          if (import.meta.env.DEV) {
            console.log(
              "[PRINT] Automatic printing triggered"
            );
          }

          // CORRECTED:
          // Only two arguments are passed.

          void printConfirmedReceipt(
            newReceipt,
            checkoutStartedAt
          ).catch((cause: unknown) => {
            console.error(
              "[PRINT] Receipt printing failed:",
              cause
            );
          });

        } else {
          if (import.meta.env.DEV) {
            console.log(
              "[PRINT] Demo or unverified order - physical printing skipped"
            );
          }
        }

        // Printing failure does not change
        // successful checkout confirmation.

        return true;

      } finally {
        checkoutLock.current = false;
      }
    },
    [
      totals,
      submitOrder,
      getCheckoutHeaders,
      resetIdempotencyKey,
      clearCart,
      printConfirmedReceipt,
      storeId,
      token,
    ]
  );

  // ==========================================
  // DAY 5 AFTERNOON TASK 2
  // F4 QUICK CASH PAYMENT
  // ==========================================

  const openCheckoutFromHotkey =
    useCallback(() => {
      if (
        checkoutLock.current ||
        isCheckoutSubmitting ||
        pendingPayload.current !== null ||
        isReceiptOpen
      ) {
        return;
      }

      if (
        totals.items.length === 0 ||
        totals.total <= 0
      ) {
        return;
      }

      const paymentButton =
        document.getElementById(
          "billing-select-payment"
        );

      if (
        !(paymentButton instanceof HTMLButtonElement) ||
        paymentButton.disabled
      ) {
        return;
      }

      setPaymentMethod("Cash");

      paymentButton.click();
    }, [
      isCheckoutSubmitting,
      isReceiptOpen,
      totals.items.length,
      totals.total,
    ]);

  // ==========================================
  // POS KEYBOARD SHORTCUTS
  // ==========================================

  usePosHotkeys({
    // F2 - Focus Search

    onSearchFocus: () => {
      const searchInput =
        document.querySelector<HTMLInputElement>(
          "input[type='text']"
        );

      searchInput?.focus();
    },

    // F3 - Next Category

    onNextCategory: () => {
      if (CATEGORIES.length === 0) {
        return;
      }

      const currentIndex =
        CATEGORIES.findIndex(
          (category) =>
            category.key.toLowerCase() ===
            activeTab.toLowerCase()
        );

      const nextIndex =
        (currentIndex + 1) %
        CATEGORIES.length;

      setActiveTab(
        CATEGORIES[nextIndex].key
      );
    },

    // F4 - Quick Cash Pay

    onQuickCashPay:
      openCheckoutFromHotkey,

    // Clear active cart

    onClearCart: () => {
      if (
        checkoutLock.current ||
        isCheckoutSubmitting ||
        pendingPayload.current !== null
      ) {
        return;
      }

      clearCart();
    },

    // F5 - Refresh Catalog

    onRefreshCatalog: () => {
      if (
        checkoutLock.current ||
        isCheckoutSubmitting ||
        pendingPayload.current !== null
      ) {
        return;
      }

      void refreshCatalog();
    },

    // F7 - Cash

    onSelectCash: () => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setPaymentMethod("Cash");
    },

    // F8 - UPI

    onSelectUPI: () => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setPaymentMethod("UPI");
    },

    // F9 - Card

    onSelectCard: () => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setPaymentMethod("Others");
    },

    // F10 - Checkout

    onCheckout: () => {
      if (
        checkoutLock.current ||
        isCheckoutSubmitting ||
        isReceiptOpen ||
        totals.items.length === 0
      ) {
        return;
      }

      const paymentButton =
        document.getElementById(
          "billing-select-payment"
        );

      if (
        paymentButton instanceof HTMLButtonElement &&
        !paymentButton.disabled
      ) {
        paymentButton.click();
      }
    },

    // ESC - Clear active cart

    onEscape: () => {
      if (
        checkoutLock.current ||
        isCheckoutSubmitting ||
        pendingPayload.current !== null
      ) {
        return;
      }

      if (isReceiptOpen) {
        setIsReceiptOpen(false);

        return;
      }

      if (
        Object.keys(cart).length === 0
      ) {
        return;
      }

      clearCart();
    },
  });

  // ==========================================
  // RETURN BILLING FUNCTIONALITY
  // ==========================================

  return {
    activeTab,
    setActiveTab,

    searchQuery,
    setSearchQuery,

    filteredDishes,
    dishes,

    isCatalogLoading,
    refreshCatalog,

    cart,
    addToCart,
    updateQuantity,
    clearCart,

    heldCarts,
    holdCurrentCart,
    recallCart,
    deleteHeldCart,

    totals,

    paymentMethod,
    setPaymentMethod,

    cashCollected,
    setCashCollected,
    change,

    handleCompletePayment,
    isCheckoutSubmitting,

    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
  };
};