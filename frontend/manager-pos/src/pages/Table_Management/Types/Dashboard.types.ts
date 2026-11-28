// src/pages/Table_Management/Types/Dashboard.types.ts

export interface KPIData {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

export interface TopItem extends Record<string, unknown> {
  name: string;
  qty: number;
}

export interface PaymentSplit extends Record<string, unknown> {
  name: string;
  value: number;
}

export interface OrderData {
  id: string;
  date: string;
  time: string;
  orderId: string;
  items: string;
  beforeTax: string;
  afterTax: string;
  paymentMode: string;
  status: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface OrderDetailItem {
  name: string;
  qty: number;
  rate: string;
  total: string;
  note?: string;
}

export interface OrderDetail {
  id: string;
  date: string;
  status: "Completed" | "Cancelled";
  service: string;
  cashier: string;
  terminal: string;
  token: string;
  paymentMode: string;
  paymentColor: string;
  items: OrderDetailItem[];
  subtotal: string;
  cgst: string;
  sgst: string;
  serviceCharge: string;
  grandTotal: string;
}


