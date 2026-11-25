
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CheckoutRequest } from "@urqr/types";

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
import { useDebouncedValue } from "./useDebouncedValue";

export const useBilling = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash");
  const [cashCollected, setCashCollected] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(
    null
  );
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Get products from API, falling back to existing demo data.
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
          const data: unknown = await response.json();

          if (Array.isArray(data) && data.length > 0) {
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
                  typeof item.lowStockThreshold === "number"
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
        // Keep existing fallback products if API is offline.
      }

      return DISHES;
    },
    initialData: DISHES,
  });

  // Category filtering + 300ms debounced product search.
  const filteredDishes = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return dishes.filter((dish) => {
      const category = dish.category.toLowerCase();
      const name = dish.name.toLowerCase();

      const matchesCategory =
        activeTab === "all" ||
        (activeTab === "main" &&
          category === "main course") ||
        (activeTab === "beverages" &&
          ["beverages", "drinks"].includes(category)) ||
        (activeTab === "soups" &&
          (category === "soups" || name.includes("soup"))) ||
        (activeTab === "salads" &&
          (category === "salads" || name.includes("salad"))) ||
        category === activeTab;

      return matchesCategory && name.includes(query);
    });
  }, [dishes, activeTab, debouncedSearch]);

  // Add only available products; maximum quantity = 15.
  const addToCart = useCallback(
    (dishId: number) => {
      const dish = dishes.find(
        (item) => item.id === dishId
      );

      if (!dish || dish.stock === 0) return;

      const max = Math.min(15, dish.stock ?? 15);

      setCart((previous) => {
        const current = previous[dishId] ?? 0;

        if (current >= max) return previous;

        return {
          ...previous,
          [dishId]: current + 1,
        };
      });
    },
    [dishes]
  );

  // QuantityStepper uses absolute quantities.
  // Our Billing cart receives quantity changes as a delta.
  const updateQuantity = useCallback(
    (dishId: number, delta: number) => {
      const dish = dishes.find(
        (item) => item.id === dishId
      );

      if (!dish || !Number.isFinite(delta)) return;

      const max = Math.min(15, dish.stock ?? 15);

      setCart((previous) => {
        const next = { ...previous };

        const quantity = Math.min(
          max,
          (previous[dishId] ?? 0) + delta
        );

        if (quantity <= 0) {
          delete next[dishId];
        } else {
          next[dishId] = quantity;
        }

        return next;
      });
    },
    [dishes]
  );

  const clearCart = useCallback(() => {
    setCart({});
    setCashCollected("");
  }, []);

  // Calculate subtotal and tax using integer paise.
  const totals = useMemo(() => {
    const items: CartItem[] = Object.keys(cart).flatMap(
      (key) => {
        const dish = dishes.find(
          (item) => item.id === Number(key)
        );

        return dish
          ? [{ dish, quantity: cart[Number(key)] }]
          : [];
      }
    );

    const subtotalPaise = items.reduce(
      (sum, item) =>
        sum +
        Math.round(item.dish.price * 100) * item.quantity,
      0
    );

    const taxPaise = Math.round(
      (subtotalPaise * TAX_RATE) / 100
    );

    return {
      items,
      subtotal: subtotalPaise / 100,
      tax: taxPaise / 100,
      total: (subtotalPaise + taxPaise) / 100,
    };
  }, [cart, dishes]);

  // This is a frontend demonstration checkout.
  // Real transactions must be confirmed by the backend.
  const handleCompletePayment = useCallback(
    (checkout: CheckoutRequest): boolean => {
      if (
        !totals.items.length ||
        !Number.isFinite(checkout.amountTendered)
      ) {
        return false;
      }

      const duePaise = Math.round(totals.total * 100);

      if (
        Math.round(checkout.payableAmount * 100) !==
        duePaise
      ) {
        return false;
      }

      const receivedPaise = Math.round(
        checkout.amountTendered * 100
      );

      if (
        checkout.paymentMode === "Cash" &&
        receivedPaise < duePaise
      ) {
        return false;
      }

      const method: PaymentMethod =
        checkout.paymentMode === "Card"
          ? "Others"
          : checkout.paymentMode;

      setPaymentMethod(method);

      setCashCollected(
        checkout.paymentMode === "Cash"
          ? String(checkout.amountTendered)
          : ""
      );

      const now = new Date();

      const newReceipt: ReceiptData = {
        orderId: `#DEMO-${now
          .getTime()
          .toString(36)
          .toUpperCase()}`,

        date: now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

        time: now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),

        items: totals.items.map(({ dish, quantity }) => ({
          name: dish.name,
          price: dish.price,
          quantity,
        })),

        subtotal: totals.subtotal,
        taxRate: TAX_RATE,
        tax: totals.tax,
        total: totals.total,
        paymentMethod: checkout.paymentMode,

        cashCollected:
          checkout.paymentMode === "Cash"
            ? checkout.amountTendered
            : undefined,

        change:
          checkout.paymentMode === "Cash"
            ? (receivedPaise - duePaise) / 100
            : undefined,
      };

      setReceipt(newReceipt);
      setIsReceiptOpen(true);
      clearCart();

      return true;
    },
    [totals, clearCart]
  );

  // Existing POS keyboard shortcut system.
  usePosHotkeys({
    onSearchFocus: () =>
      document
        .querySelector<HTMLInputElement>(
          "#billing-search-input"
        )
        ?.focus(),

    onNextCategory: () => {
      const index = CATEGORIES.findIndex(
        (category) => category.key === activeTab
      );

      setActiveTab(
        CATEGORIES[(index + 1) % CATEGORIES.length].key
      );
    },

    onClearCart: clearCart,

    onRefreshCatalog: () => {
      void refreshCatalog();
    },

    onSelectCash: () => setPaymentMethod("Cash"),
    onSelectUPI: () => setPaymentMethod("UPI"),
    onSelectCard: () => setPaymentMethod("Others"),

    onCheckout: () =>
      document
        .getElementById("billing-select-payment")
        ?.click(),

    onEscape: () => setIsReceiptOpen(false),
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
    totals,
    paymentMethod,
    setPaymentMethod,
    cashCollected,
    setCashCollected,
    handleCompletePayment,
    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
  };
};
