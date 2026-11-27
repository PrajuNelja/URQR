import {
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";

import { useQuery } from "@tanstack/react-query";

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
  DISHES,
  TAX_RATE,
  CATEGORIES,
} from "../Config/billing.config";

import { POS_CATALOG_QUERY_KEY } from "../../../queryClient";

import { usePosHotkeys } from "./usePosHotkeys";

import { useCartStore } from "../../../lib/cartStore";

// DAY 5 MORNING TASK 3
import { useCheckoutIdempotency } from "./useCheckoutIdempotency";

// DAY 5 MORNING TASK 4
import { useOrderMutation } from "./useOrderMutation";

import type {
  OrderPayload,
} from "../Components/Billing/orderApi";

// ==========================================
// MAIN BILLING HOOK
// ==========================================

export const useBilling = () => {
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

  // Prevent duplicate checkout submissions.
  const checkoutLock = useRef(false);

  // Preserve request payload during checkout retries.
  const pendingPayload =
    useRef<string | null>(null);

  // ==========================================
  // EXISTING BILLING STATES
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
  // EXISTING TANSTACK QUERY CATALOG
  // ==========================================

  const {
    data: dishes = DISHES,
    refetch: refreshCatalog,
    isLoading: isCatalogLoading,
  } = useQuery<Dish[]>({
    queryKey: POS_CATALOG_QUERY_KEY,

    queryFn: async () => {
      try {
        const response =
          await fetch("/api/products");

        if (response.ok) {
          const data: unknown =
            await response.json();

          if (
            Array.isArray(data) &&
            data.length > 0
          ) {
            return data.map(
              (
                item: Record<string, unknown>,
                index: number
              ) => ({
                id:
                  typeof item.id === "number" ||
                  typeof item.id === "string"
                    ? Number(item.id)
                    : index + 1,

                name:
                  typeof item.name === "string"
                    ? item.name
                    : "Dish",

                category:
                  typeof item.category === "string"
                    ? item.category
                    : "Main Course",

                description:
                  typeof item.description === "string"
                    ? item.description
                    : "",

                price:
                  typeof item.price === "number"
                    ? item.price
                    : Number(item.price) || 0,

                stock:
                  typeof item.stock === "number"
                    ? item.stock
                    : undefined,

                lowStockThreshold:
                  typeof item.lowStockThreshold ===
                  "number"
                    ? item.lowStockThreshold
                    : undefined,

                imageUrl:
                  typeof item.imageUrl === "string"
                    ? item.imageUrl
                    : undefined,
              })
            );
          }
        }
      } catch {
        // Retain existing static catalog fallback.
      }

      return DISHES;
    },

    initialData: DISHES,
  });

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
    // Prevent cart clearance during payment
    // or when a previous result is unresolved.
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
  // EXISTING HOLD AND RECALL CART
  // ==========================================

  const heldCarts = useCartStore(
    (state) => state.heldCarts
  );

  // HOLD CURRENT CART

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

  // RECALL HELD CART

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
  // EXISTING CART TOTAL CALCULATIONS
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
  // EXISTING CHANGE DUE CALCULATION
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
  // DAY 5 MORNING TASK 4
  // CHECKOUT BACKEND API INTEGRATION
  // ==========================================

  const handleCompletePayment = useCallback(
    async (
      checkout: CheckoutRequest
    ): Promise<boolean> => {
      // Prevent double submission.
      if (checkoutLock.current) {
        return false;
      }

      // Validate checkout details using
      // existing shared Zod schema.
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

      // Cash-only development API integration.
      if (
        payment.paymentMode !== "Cash"
      ) {
        throw new Error(
          "Only cash checkout is available in this development flow."
        );
      }

      // Convert payment amounts into
      // integer paise.
      const payablePaise = Math.round(
        totals.total * 100
      );

      const receivedPaise = Math.round(
        payment.amountTendered * 100
      );

      // Verify payment amount and change due.
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

      // Validate order quantities.
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

      // Prepare order request payload.
      const payload: OrderPayload = {
        items: totals.items.map(
          ({ dish, quantity }) => ({
            // Numeric IDs are for
            // MSW fixtures only.
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

      // Preserve the same request payload
      // across checkout retries.
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

      checkoutLock.current = true;

      pendingPayload.current = fingerprint;

      try {
        // =====================================
        // SEND POST REQUEST
        // WITH IDEMPOTENCY-KEY
        // =====================================

        const result = await submitOrder({
          payload,

          headers: getCheckoutHeaders(),
        });

        const now = new Date();

        // Generate receipt only after
        // successful mock API confirmation.
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

        // Store receipt data.
        setReceipt(newReceipt);

        // Preserve existing receipt behavior.
        setIsReceiptOpen(true);

        // Reset UUID only after
        // successful order confirmation.
        resetIdempotencyKey();

        // Release checkout lock.
        pendingPayload.current = null;

        checkoutLock.current = false;

        // Clear cart only after confirmation.
        clearCart();

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
    ]
  );

  // ==========================================
  // DAY 5 AFTERNOON TASK 2
  // POS KEYBOARD SHORTCUT FUNCTIONALITY
  // ==========================================

  // Reuse the existing checkout button.
  // Do not create another payment function.

  const openCheckoutFromHotkey =
    useCallback(() => {
      // Prevent checkout during processing
      // or unresolved transactions.
      if (
        checkoutLock.current ||
        isCheckoutSubmitting ||
        pendingPayload.current !== null ||
        isReceiptOpen
      ) {
        return;
      }

      // Prevent checkout with empty cart.
      if (
        totals.items.length === 0 ||
        totals.total <= 0
      ) {
        return;
      }

      // Find existing checkout button.
      const paymentButton =
        document.getElementById(
          "billing-select-payment"
        );

      // Verify that the button is available
      // and enabled.
      if (
        !(paymentButton instanceof HTMLButtonElement) ||
        paymentButton.disabled
      ) {
        return;
      }

      // Select Cash payment method.
      setPaymentMethod("Cash");

      // Open existing checkout modal.
      paymentButton.click();
    }, [
      isCheckoutSubmitting,
      isReceiptOpen,
      totals.items.length,
      totals.total,
    ]);

  // ==========================================
  // REGISTER EXISTING POS KEYBOARD SHORTCUTS
  // ==========================================

  usePosHotkeys({
    // ======================================
    // F2 - FOCUS PRODUCT SEARCH
    // EXISTING WORKING FUNCTIONALITY
    // ======================================

    onSearchFocus: () => {
      const searchInput =
        document.querySelector<HTMLInputElement>(
          "input[type='text']"
        );

      searchInput?.focus();
    },

    // ======================================
    // F3 - NEXT PRODUCT CATEGORY
    // ======================================

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

    // ======================================
    // F4 - QUICK CASH PAY
    // ======================================

    onQuickCashPay:
      openCheckoutFromHotkey,

    // ======================================
    // CLEAR ACTIVE CART
    // ======================================

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

    // ======================================
    // F5 - REFRESH PRODUCT CATALOG
    // ======================================

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

    // ======================================
    // F7 - SELECT CASH
    // ======================================

    onSelectCash: () => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setPaymentMethod("Cash");
    },

    // ======================================
    // F8 - SELECT UPI
    // ======================================

    onSelectUPI: () => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setPaymentMethod("UPI");
    },

    // ======================================
    // F9 - SELECT CARD
    // ======================================

    onSelectCard: () => {
      if (
        checkoutLock.current ||
        pendingPayload.current !== null
      ) {
        return;
      }

      setPaymentMethod("Others");
    },

    // ======================================
    // F10 - OPEN CHECKOUT
    // ======================================

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

    // ======================================
    // ESC - CLEAR ACTIVE CART
    // ======================================

    onEscape: () => {
      // Prevent cart clearance during payment.
      if (
        checkoutLock.current ||
        isCheckoutSubmitting ||
        pendingPayload.current !== null
      ) {
        return;
      }

      // Preserve receipt handling.
      if (isReceiptOpen) {
        setIsReceiptOpen(false);

        return;
      }

      // No action required when cart is empty.
      if (
        Object.keys(cart).length === 0
      ) {
        return;
      }

      // Clear current active cart.
      // Held carts remain unchanged.
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