import type { ProductItem } from "@urqr/types";

export type Dish = ProductItem;

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export type PaymentMethod = "Cash" | "UPI" | "Others";

export interface ReceiptData {
  orderId: string;
  date: string;
  time: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashCollected?: number;
  change?: number;
}
