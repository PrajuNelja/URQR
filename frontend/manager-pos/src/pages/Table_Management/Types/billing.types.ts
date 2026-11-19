export interface Dish {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
}

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