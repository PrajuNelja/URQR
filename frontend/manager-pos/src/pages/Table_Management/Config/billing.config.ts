
import type { Category } from "@urqr/types";
import type { Dish } from "../Types/billing.types";

export const TAX_RATE = 5;

// Keys match existing product data.
// Labels follow the Billing HTML.
export const CATEGORIES: Category[] = [
  { key: "all", label: "All" },
  { key: "starters", label: "Starters" },
  { key: "main", label: "Main Course" },
  { key: "desserts", label: "Desserts" },
  { key: "beverages", label: "Drinks" },
  { key: "soups", label: "Soups" },
  { key: "salads", label: "Salads" },
];

export const PAYMENT_METHODS = [
  { value: "Cash", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "Others", label: "Others" },
];

// Existing fallback catalog is preserved.
// The API replaces it when available.
export const DISHES: Dish[] = [
  { id: 1, name: "Truffle Mushroom Soup", category: "Starters", description: "Served with garlic bread", price: 12, stock: 18, lowStockThreshold: 5 },
  { id: 2, name: "Classic Caesar Salad", category: "Starters", description: "Romaine, parmesan, croutons", price: 14, stock: 4, lowStockThreshold: 5 },
  { id: 3, name: "Grilled Salmon Steak", category: "Main Course", description: "Fresh herbs & lemon butter", price: 24.50, stock: 12, lowStockThreshold: 4 },
  { id: 4, name: "Wagyu Ribeye", category: "Main Course", description: "Cheddar, brioche, fries", price: 48, stock: 2, lowStockThreshold: 3 },
  { id: 5, name: "Lobster Linguine", category: "Main Course", description: "Chili, garlic, white wine", price: 36, stock: 0, lowStockThreshold: 2 },
  { id: 6, name: "Ribeye Beef Burger", category: "Main Course", description: "With cheddar & fries", price: 18.50, stock: 15, lowStockThreshold: 4 },
  { id: 7, name: "Belgian Chocolate Lava Cake", category: "Desserts", description: "Vanilla bean ice cream", price: 11, stock: 8, lowStockThreshold: 3 },
  { id: 8, name: "Artisanal Espresso", category: "Beverages", description: "Single-origin, double shot", price: 5, stock: 45, lowStockThreshold: 10 },
  { id: 9, name: "Fresh Lime Soda", category: "Beverages", description: "Sweet or salted", price: 6, stock: 50, lowStockThreshold: 10 },
];
