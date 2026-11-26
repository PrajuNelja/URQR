
import {
  useState,
  useMemo,
  useCallback,
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

export const useBilling = () => {
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

  // Existing TanStack Query catalog
  const {
    data: dishes = DISHES,
    refetch: refreshCatalog,
    isLoading: isCatalogLoading,
  } = useQuery<Dish[]>({
    queryKey: POS_CATALOG_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await fetch("/api/products");

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
        // Keep existing static catalog fallback.
      }

      return DISHES;
    },
    initialData: DISHES,
  });

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory =
        activeTab === "all" ||
        dish.category.toLowerCase() ===
          activeTab.toLowerCase();

      const matchesSearch =
        dish.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [dishes, activeTab, searchQuery]);

  const addToCart = useCallback(
    (dishId: number) => {
      setCart((previous) => ({
        ...previous,
        [dishId]:
          (previous[dishId] || 0) + 1,
      }));

      const dish = dishes.find((d) => d.id === dishId);
      if (dish) {
        useCartStore.getState().addItem({
          id: String(dish.id),
          name: dish.name,
          unitPricePaise: Math.round(dish.price * 100),
          taxable: true,
        });
      }
    },
    [dishes]
  );

  const updateQuantity = useCallback(
    (dishId: number, delta: number) => {
      setCart((previous) => {
        const next = { ...previous };

        const quantity =
          (next[dishId] || 0) + delta;

        if (quantity <= 0) {
          delete next[dishId];
        } else {
          next[dishId] = quantity;
        }

        useCartStore.getState().setQuantity(String(dishId), Math.max(0, quantity));
        return next;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart({});
    setCashCollected("");
    useCartStore.getState().clearCart();
  }, []);

  const heldCarts = useCartStore((state) => state.heldCarts);

  const holdCurrentCart = useCallback(() => {
    if (Object.keys(cart).length === 0) return;
    useCartStore.getState().holdCurrentCart();
    setCart({});
    setCashCollected("");
  }, [cart]);

  const recallCart = useCallback((id: string) => {
    const target = useCartStore.getState().heldCarts.find((c) => c.id === id);
    if (!target) return;
    useCartStore.getState().recallCart(id);
    const restoredCart: Record<number, number> = {};
    for (const item of target.items) {
      restoredCart[Number(item.productId)] = item.quantity;
    }
    setCart(restoredCart);
  }, []);

  const deleteHeldCart = useCallback((id: string) => {
    useCartStore.getState().deleteHeldCart(id);
  }, []);

  const totals = useMemo(() => {
    const items: CartItem[] = Object.keys(cart)
      .map((id) => {
        const dish = dishes.find(
          (product) => product.id === Number(id)
        );

        if (!dish) return null;

        return {
          dish,
          quantity: cart[Number(id)],
        };
      })
      .filter(
        (item): item is CartItem =>
          item !== null
      );

    const subtotal = items.reduce(
      (sum, item) =>
        sum + item.dish.price * item.quantity,
      0
    );

    const tax =
      Math.round(
        subtotal * (TAX_RATE / 100) * 100
      ) / 100;

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

  // Preserve existing derived change state
  // for any other Billing components using it.
  const change = useMemo(() => {
    if (paymentMethod !== "Cash") {
      return 0;
    }

    const cash = parseFloat(cashCollected);

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

  // ========================================
  // DEMO CASH PAYMENT CONFIRMATION
  // ========================================
  const handleCompletePayment = useCallback(
    (
      checkout: CheckoutRequest,
      orderId?: string
    ): boolean => {
      if (totals.items.length === 0) {
        return false;
      }

      const result =
        CheckoutRequestSchema.safeParse(
          checkout
        );

      if (!result.success) {
        return false;
      }

      const payment = result.data;

      // Cash-only demo completion.
      // UPI must be backend-verified.
      if (payment.paymentMode !== "Cash") {
        return false;
      }

      const payablePaise = Math.round(
        totals.total * 100
      );

      const submittedPayablePaise =
        Math.round(
          payment.payableAmount * 100
        );

      const receivedPaise = Math.round(
        payment.amountTendered * 100
      );

      if (
        payablePaise <= 0 ||
        !Number.isSafeInteger(payablePaise) ||
        !Number.isSafeInteger(
          submittedPayablePaise
        ) ||
        !Number.isSafeInteger(receivedPaise) ||
        submittedPayablePaise !== payablePaise ||
        receivedPaise < payablePaise
      ) {
        return false;
      }

      const changePaise =
        receivedPaise - payablePaise;

      const now = new Date();

      // This receipt belongs to local demo checkout.
      const newReceipt: ReceiptData = {
        orderId: orderId
          ? `#${orderId}`
          : `#ORD${Math.floor(
              1000 + Math.random() * 9000
            )}`,

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

        subtotal: totals.subtotal,
        taxRate: TAX_RATE,
        tax: totals.tax,
        total: totals.total,

        paymentMethod: "Cash",
        cashCollected:
          receivedPaise / 100,
        change: changePaise / 100,
      };

      setReceipt(newReceipt);
      setIsReceiptOpen(true);
      clearCart();

      return true;
    },
    [totals, clearCart]
  );

  // Existing keyboard shortcuts
  usePosHotkeys({
    onSearchFocus: () => {
      const searchInput =
        document.querySelector<HTMLInputElement>(
          "input[type='text']"
        );

      searchInput?.focus();
    },

    onNextCategory: () => {
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

    onClearCart: () => clearCart(),

    onRefreshCatalog: () => {
      void refreshCatalog();
    },

    onSelectCash: () =>
      setPaymentMethod("Cash"),

    onSelectUPI: () =>
      setPaymentMethod("UPI"),

    onSelectCard: () =>
      setPaymentMethod("Others"),

    // F10 opens the validated payment flow.
    // It must not directly complete payment.
    onCheckout: () => {
      document
        .getElementById(
          "billing-select-payment"
        )
        ?.click();
    },

    onEscape: () => {
      setIsReceiptOpen(false);
    },
  });

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

    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
  };
};
