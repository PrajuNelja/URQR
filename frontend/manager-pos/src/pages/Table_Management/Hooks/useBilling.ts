import { useState, useMemo } from "react";
import type { CartItem, PaymentMethod, ReceiptData } from "../Types/billing.types";
import { DISHES, TAX_RATE } from "../Config/billing.config";

export const useBilling = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [cashCollected, setCashCollected] = useState<string>("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const filteredDishes = useMemo(() => {
    return DISHES.filter((dish) => {
      const matchesCategory = activeTab === "all" || dish.category.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery]);

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
    setCashCollected("");
  };

  const totals = useMemo(() => {
    const items: CartItem[] = Object.keys(cart).map((id) => {
      const dish = DISHES.find((d) => d.id === Number(id))!;
      return { dish, quantity: cart[Number(id)] };
    });
    const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
    const tax = subtotal * (TAX_RATE / 100);
    const total = subtotal + tax;
    return { items, subtotal, tax, total };
  }, [cart]);

  const change = useMemo(() => {
    if (paymentMethod !== "Cash") return 0;
    const cash = parseFloat(cashCollected);
    if (isNaN(cash)) return NaN;
    return cash - totals.total;
  }, [paymentMethod, cashCollected, totals.total]);

  const handleCompletePayment = () => {
    if (totals.items.length === 0) return;
    if (paymentMethod === "Cash") {
      const cash = parseFloat(cashCollected);
      if (isNaN(cash) || cash < totals.total) return;
    }

    const now = new Date();
    const newReceipt: ReceiptData = {
      orderId: `#ORD${Math.floor(Math.random() * 10000)}`,
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
  };

  return {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    filteredDishes,
    cart, addToCart, updateQuantity, clearCart,
    totals,
    paymentMethod, setPaymentMethod,
    cashCollected, setCashCollected,
    change,
    handleCompletePayment,
    receipt, isReceiptOpen, setIsReceiptOpen
  };
};