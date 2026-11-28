// src/pages/Table_Management/Config/Dashboard.config.ts
import type {
  KPIData,
  TopItem,
  PaymentSplit,
  OrderData,
  OrderDetail,
} from "../Types/Dashboard.types";

export const dashboardConfig = {
  // Page Layouts
  kpiGrid: "grid grid-cols-1 md:grid-cols-3 gap-5 mb-5",
  chartGrid: "grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5",

  // Order Section Header
  orderHeader: "flex flex-col sm:flex-row justify-between items-center gap-4 mb-5",
  
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
  {
    label: "Total Orders",
    value: "897",
    trend: "▲ +11%",
    icon: "ShoppingBag",
  },
  {
    label: "Profit",
    value: "₹25,995",
    trend: "▲ +17%",
    icon: "TrendingUp",
  },
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

export const MOCK_ORDERS_DB: Record<string, OrderDetail> = {
  "#ORD1284": {
    id: "#ORD1284",
    date: "18 Nov 2026, 12:05 PM",
    status: "Completed",
    service: "Dine-In · Table 04",
    cashier: "Rahul M. (Server)",
    terminal: "POS-01 (Main)",
    token: "CHK-8247",
    paymentMode: "Cash (Drawer Reconciled)",
    paymentColor: "#A68B75",
    items: [
      { name: "Veg Burger", qty: 2, rate: "₹220.00", total: "₹440.00", note: "Extra Cheese, No Onion" },
      { name: "Chicken Pizza", qty: 1, rate: "₹380.00", total: "₹380.00", note: "Thin Crust, Spicy" },
    ],
    subtotal: "₹820.00",
    cgst: "₹20.50",
    sgst: "₹20.50",
    serviceCharge: "₹41.00",
    grandTotal: "₹902.00",
  },
  "#ORD1283": {
    id: "#ORD1283",
    date: "17 Nov 2026, 11:26 AM",
    status: "Completed",
    service: "Dine-In · Table 02",
    cashier: "Priya K. (Server)",
    terminal: "POS-02 (Patio)",
    token: "CHK-8246",
    paymentMode: "UPI (QR Direct Pay)",
    paymentColor: "#5C3D26",
    items: [
      { name: "Veg Burger", qty: 1, rate: "₹220.00", total: "₹220.00", note: "Regular Mayo" },
      { name: "French Fries", qty: 1, rate: "₹120.00", total: "₹120.00", note: "Peri Peri Seasoned" },
    ],
    subtotal: "₹340.00",
    cgst: "₹8.50",
    sgst: "₹8.50",
    serviceCharge: "₹17.00",
    grandTotal: "₹374.00",
  },
  "#ORD1282": {
    id: "#ORD1282",
    date: "17 Nov 2026, 10:52 AM",
    status: "Completed",
    service: "Takeaway · Counter #1",
    cashier: "Rahul M. (Server)",
    terminal: "POS-01 (Main)",
    token: "CHK-8245",
    paymentMode: "Card (Credit Chip)",
    paymentColor: "#8B5E3C",
    items: [
      { name: "Chicken Pizza", qty: 1, rate: "₹380.00", total: "₹380.00", note: "Cheese Burst Crust" },
    ],
    subtotal: "₹380.00",
    cgst: "₹9.50",
    sgst: "₹9.50",
    serviceCharge: "₹19.00",
    grandTotal: "₹418.00",
  },
  "#ORD1281": {
    id: "#ORD1281",
    date: "17 Nov 2026, 10:21 AM",
    status: "Completed",
    service: "Dine-In · Table 07",
    cashier: "Vikram S.",
    terminal: "POS-03 (Bar)",
    token: "CHK-8244",
    paymentMode: "Cash (Drawer Reconciled)",
    paymentColor: "#A68B75",
    items: [
      { name: "Cold Coffee", qty: 1, rate: "₹120.00", total: "₹120.00", note: "Extra Ice, Less Sugar" },
      { name: "Brownie", qty: 1, rate: "₹180.00", total: "₹180.00", note: "With Vanilla Scoop" },
    ],
    subtotal: "₹300.00",
    cgst: "₹7.50",
    sgst: "₹7.50",
    serviceCharge: "₹15.00",
    grandTotal: "₹330.00",
  },
  "#ORD1280": {
    id: "#ORD1280",
    date: "16 Nov 2026, 09:47 PM",
    status: "Completed",
    service: "Takeaway · Express Pick",
    cashier: "Rahul M.",
    terminal: "POS-01 (Main)",
    token: "CHK-8243",
    paymentMode: "UPI (QR Direct Pay)",
    paymentColor: "#5C3D26",
    items: [
      { name: "Veg Burger", qty: 1, rate: "₹220.00", total: "₹220.00", note: "Spicy Patty" },
    ],
    subtotal: "₹220.00",
    cgst: "₹5.50",
    sgst: "₹5.50",
    serviceCharge: "₹11.00",
    grandTotal: "₹242.00",
  },
  "#ORD1279": {
    id: "#ORD1279",
    date: "16 Nov 2026, 08:12 PM",
    status: "Cancelled",
    service: "Dine-In · Table 09",
    cashier: "Priya K.",
    terminal: "POS-02 (Patio)",
    token: "CHK-8242",
    paymentMode: "Card (Refunded)",
    paymentColor: "#B91C1C",
    items: [
      { name: "Veg Burger", qty: 1, rate: "₹220.00", total: "₹220.00", note: "Cancelled before prep" },
      { name: "Cold Coffee", qty: 1, rate: "₹140.00", total: "₹140.00", note: "Cancelled before prep" },
    ],
    subtotal: "₹360.00",
    cgst: "₹9.00",
    sgst: "₹9.00",
    serviceCharge: "₹18.00",
    grandTotal: "₹396.00",
  },
};
