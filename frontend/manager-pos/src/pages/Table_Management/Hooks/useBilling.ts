import { useState, useMemo } from "react";
import type { CartItem, Dish, PaymentMethod, ReceiptData } from "../Types/billing.types";
import { DISHES, TAX_RATE } from "../Config/billing.config";
import { apiClient } from "../../../lib/apiClient";

export const useBilling = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [dishes] = useState<Dish[]>(DISHES);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [orderNote, setOrderNote] = useState<string>("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory =
        activeTab === "all" ||
        dish.category.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = dish.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dishes, activeTab, searchQuery]);

  const addToCart = (dishId: number) => {
    setCart((prev) => ({ ...prev, [dishId]: (prev[dishId] || 0) + 1 }));
  };

  const updateQuantity = (dishId: number, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const newQty = (next[dishId] || 0) + delta;
      if (newQty <= 0) delete next[dishId];
      else next[dishId] = newQty;
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setOrderNote("");
    setErrorMessage(null);
  };

  const totals = useMemo(() => {
    const items: CartItem[] = Object.keys(cart)
      .map((id) => {
        const dish = dishes.find((d) => d.id === Number(id));
        if (!dish) return null;
        return { dish, quantity: cart[Number(id)] };
      })
      .filter((item): item is CartItem => item !== null);

    const subtotal = items.reduce(
      (sum, item) => sum + item.dish.price * item.quantity,
      0
    );
    const tax = Math.round(subtotal * (TAX_RATE / 100) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return { items, subtotal, tax, total };
  }, [cart, dishes]);

  // Direct 1-Tap Checkout (Zero Cash Tendering / Change Calculation)
  const handleCompletePayment = async () => {
    if (totals.items.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const now = new Date();
    const orderPayload = {
      items: totals.items.map((i) => ({
        menuItemId: i.dish.id,
        quantity: i.quantity,
        unitPrice: i.dish.price,
      })),
      subtotal: totals.subtotal,
      taxAmount: totals.tax,
      totalAmount: totals.total,
      paymentMethod,
      orderNote,
    };

    try {
      // Post to Spring Boot POS Order Service
      let orderId = `#ORD${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        const response = await apiClient.post("/orders", orderPayload);
        if (response.data?.id) {
          orderId = `#ORD${response.data.id}`;
        }
      } catch (apiErr) {
        // Graceful fallback to client generation if offline or mock backend
        console.warn("Backend /orders offline, proceeding in local POS mode:", apiErr);
      }

      const newReceipt: ReceiptData = {
        orderId,
        date: now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: totals.items.map((i) => ({
          name: i.dish.name,
          price: i.dish.price,
          quantity: i.quantity,
        })),
        subtotal: totals.subtotal,
        taxRate: TAX_RATE,
        tax: totals.tax,
        total: totals.total,
        paymentMethod,
      };

      setReceipt(newReceipt);
      setIsReceiptOpen(true);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    setPaymentMethod,
    orderNote,
    setOrderNote,
    handleCompletePayment,
    receipt,
    isReceiptOpen,
    setIsReceiptOpen,
    isSubmitting,
    errorMessage,
  };
};
