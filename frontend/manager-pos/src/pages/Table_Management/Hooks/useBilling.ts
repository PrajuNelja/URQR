import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, PaymentMethod, ReceiptData, Dish } from "../Types/billing.types";
import { DISHES, TAX_RATE, CATEGORIES } from "../Config/billing.config";
import { POS_CATALOG_QUERY_KEY } from "../../../queryClient";
import { usePosHotkeys } from "./usePosHotkeys";

export const useBilling = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [cashCollected, setCashCollected] = useState<string>("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // TanStack Query for POS Catalog with dedicated caching defaults
  const { data: dishes = DISHES, refetch: refreshCatalog, isLoading: isCatalogLoading } = useQuery<Dish[]>({
    queryKey: POS_CATALOG_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.map((item: Record<string, unknown>, idx: number) => ({
              id: typeof item.id === "number" || typeof item.id === "string" ? Number(item.id) : idx + 1,
              name: typeof item.name === "string" ? item.name : "Dish",
              category: typeof item.category === "string" ? item.category : "Main Course",
              description: typeof item.description === "string" ? item.description : "",
              price: typeof item.price === "number" ? item.price : Number(item.price) || 0,
            }));
          }
        }
      } catch {
        // Fallback to static catalog configuration
      }
      return DISHES;
    },
    initialData: DISHES,
  });

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory = activeTab === "all" || dish.category.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dishes, activeTab, searchQuery]);

  const addToCart = useCallback((dishId: number) => {
    setCart((prev) => ({ ...prev, [dishId]: (prev[dishId] || 0) + 1 }));
  }, []);

  const updateQuantity = useCallback((dishId: number, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const newQty = (next[dishId] || 0) + delta;
      if (newQty <= 0) delete next[dishId];
      else next[dishId] = newQty;
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
    setCashCollected("");
  }, []);

  const totals = useMemo(() => {
    const items: CartItem[] = Object.keys(cart)
      .map((id) => {
        const dish = dishes.find((d) => d.id === Number(id));
        if (!dish) return null;
        return { dish, quantity: cart[Number(id)] };
      })
      .filter((item): item is CartItem => item !== null);

    const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
    const tax = Math.round(subtotal * (TAX_RATE / 100) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { items, subtotal, tax, total };
  }, [cart, dishes]);

  const change = useMemo(() => {
    if (paymentMethod !== "Cash") return 0;
    const cash = parseFloat(cashCollected);
    if (isNaN(cash)) return NaN;
    return Math.round((cash - totals.total) * 100) / 100;
  }, [paymentMethod, cashCollected, totals.total]);

  const handleCompletePayment = useCallback(() => {
    if (totals.items.length === 0) return;
    if (paymentMethod === "Cash") {
      const cash = parseFloat(cashCollected);
      if (isNaN(cash) || cash < totals.total) return;
    }

    const now = new Date();
    const newReceipt: ReceiptData = {
      orderId: `#ORD${Math.floor(1000 + Math.random() * 9000)}`,
      date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      items: totals.items.map((i) => ({ name: i.dish.name, price: i.dish.price, quantity: i.quantity })),
      subtotal: totals.subtotal,
      taxRate: TAX_RATE,
      tax: totals.tax,
      total: totals.total,
      paymentMethod,
      cashCollected: paymentMethod === "Cash" ? parseFloat(cashCollected) : undefined,
      change: paymentMethod === "Cash" ? change : undefined,
    };

    setReceipt(newReceipt);
    setIsReceiptOpen(true);
    clearCart();
  }, [totals, paymentMethod, cashCollected, change, clearCart]);

  // POS Keyboard Hotkeys (F1 - F12)
  usePosHotkeys({
    onSearchFocus: () => {
      const searchInput = document.querySelector<HTMLInputElement>("input[type='text']");
      searchInput?.focus();
    },
    onNextCategory: () => {
      const currentIndex = CATEGORIES.findIndex((c) => c.key.toLowerCase() === activeTab.toLowerCase());
      const nextIndex = (currentIndex + 1) % CATEGORIES.length;
      setActiveTab(CATEGORIES[nextIndex].key);
    },
    onClearCart: () => clearCart(),
    onRefreshCatalog: () => {
      refreshCatalog();
    },
    onSelectCash: () => setPaymentMethod("Cash"),
    onSelectUPI: () => setPaymentMethod("UPI"),
    onSelectCard: () => setPaymentMethod("Others"),
    onCheckout: () => handleCompletePayment(),
    onEscape: () => {
      setIsReceiptOpen(false);
    },
  });

  return {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    filteredDishes,
    dishes,
    isCatalogLoading,
    refreshCatalog,
    cart, addToCart, updateQuantity, clearCart,
    totals,
    paymentMethod, setPaymentMethod,
    cashCollected, setCashCollected,
    change,
    handleCompletePayment,
    receipt, isReceiptOpen, setIsReceiptOpen
  };
};
