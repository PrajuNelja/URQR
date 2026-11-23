// src/pages/Table_Management/Config/Dashboard.config.ts
import type {
  KPIData,
  TopItem,
  PaymentSplit,
  OrderData,
} from "../Types/Dashboard.types";

export const dashboardConfig = {
  // Page Layouts
  kpiGrid: "grid grid-cols-1 md:grid-cols-3 gap-5 mb-5",
  chartGrid: "grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5",

  // Order Section Header
  orderHeader:
    "flex flex-col sm:flex-row justify-between items-center gap-4 mb-5",
  searchWrapper: "w-full max-w-sm",
};

// ═══════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════

export const MOCK_KPI_DATA: KPIData[] = [
  {
    label: "Total Revenue",
    value: "₹1,73,332",
    trend: "▲ +14%",
    icon: "IndianRupee",
  },
  { label: "Total Orders", value: "897", trend: "▲ +11%", icon: "ShoppingBag" },
  { label: "Profit", value: "₹25,995", trend: "▲ +17%", icon: "TrendingUp" },
];

export const MOCK_TOP_ITEMS: TopItem[] = [
  { name: "Veg Burger", qty: 142 },
  { name: "Chicken Pizza", qty: 108 },
  { name: "French Fries", qty: 97 },
  { name: "Cold Coffee", qty: 76 },
  { name: "Brownie", qty: 62 },
];

export const MOCK_PAYMENT_SPLIT: PaymentSplit[] = [
  { name: "UPI", value: 62 },
  { name: "Card", value: 24 },
  { name: "Cash", value: 14 },
];

export const MOCK_ORDERS: OrderData[] = [
  {
    id: "1",
    date: "18 Nov 2026",
    time: "12:05 PM",
    orderId: "#ORD1284",
    items: "Veg Burger, Chicken Pizza",
    beforeTax: "₹820.00",
    afterTax: "₹902.00",
    paymentMode: "Cash",
    status: "completed",
  },
  {
    id: "2",
    date: "17 Nov 2026",
    time: "11:26 AM",
    orderId: "#ORD1283",
    items: "Veg Burger, French Fries",
    beforeTax: "₹340.00",
    afterTax: "₹374.00",
    paymentMode: "UPI",
    status: "completed",
  },
  {
    id: "3",
    date: "17 Nov 2026",
    time: "10:52 AM",
    orderId: "#ORD1282",
    items: "Chicken Pizza",
    beforeTax: "₹380.00",
    afterTax: "₹418.00",
    paymentMode: "Card",
    status: "completed",
  },
  {
    id: "4",
    date: "17 Nov 2026",
    time: "10:21 AM",
    orderId: "#ORD1281",
    items: "Cold Coffee, Brownie",
    beforeTax: "₹300.00",
    afterTax: "₹330.00",
    paymentMode: "Cash",
    status: "completed",
  },
  {
    id: "5",
    date: "16 Nov 2026",
    time: "09:47 PM",
    orderId: "#ORD1280",
    items: "Veg Burger",
    beforeTax: "₹220.00",
    afterTax: "₹242.00",
    paymentMode: "UPI",
    status: "completed",
  },
  {
    id: "6",
    date: "16 Nov 2026",
    time: "08:12 PM",
    orderId: "#ORD1279",
    items: "Veg Burger, Cold Coffee",
    beforeTax: "₹360.00",
    afterTax: "₹396.00",
    paymentMode: "Card",
    status: "cancelled",
  },
];
