
import { create } from "zustand";

// Maximum quantity allowed for one product
export const MAX_CART_QUANTITY = 15;

// 1. Product details received from catalog
export interface CartProduct {
  id: string;
  name: string;
  unitPricePaise: number;
  taxRateBps?: number | null;
  taxable?: boolean | null;
}

// 2. Structure of an item in the cart
export interface CartLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPricePaise: number;
  taxRateBps: number | null;
  taxable: boolean | null;
}

// 2b. Structure of a held / parked cart
export interface HeldCart {
  id: string;
  heldAt: string;
  items: CartLineItem[];
  tableNumber?: string;
  orderNotes?: string;
}

// 3. Cart state and functions
interface CartState {
  items: CartLineItem[];
  heldCarts: HeldCart[];
  addItem: (product: CartProduct) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  holdCurrentCart: () => void;
  recallCart: (id: string) => void;
  deleteHeldCart: (id: string) => void;
}

// Validate price values
const isValidAmount = (amount: number) =>
  Number.isSafeInteger(amount) && amount >= 0;

// 4. Create the Zustand cart store
export const useCartStore = create<CartState>()((set, get) => ({
  // Initially empty cart
  items: [],
  heldCarts: [],

  // PARK / HOLD CURRENT CART
  holdCurrentCart: () =>
    set((state) => {
      if (state.items.length === 0) return state;
      const newHeld: HeldCart = {
        id: "HELD-" + Date.now(),
        heldAt: new Date().toLocaleTimeString(),
        items: [...state.items],
      };
      return {
        heldCarts: [...state.heldCarts, newHeld],
        items: [],
      };
    }),

  // RECALL A PARKED CART
  recallCart: (id: string) =>
    set((state) => {
      const target = get().heldCarts.find((c) => c.id === id);
      if (!target) return state;
      return {
        items: target.items,
        heldCarts: state.heldCarts.filter((c) => c.id !== id),
      };
    }),

  // DELETE A PARKED CART
  deleteHeldCart: (id: string) =>
    set((state) => ({
      heldCarts: state.heldCarts.filter((c) => c.id !== id),
    })),

  // ADD PRODUCT
  addItem: (product) =>
    set((state) => {
      const taxRate = product.taxRateBps ?? null;

      if (
        !product.id.trim() ||
        !product.name.trim() ||
        !isValidAmount(product.unitPricePaise) ||
        (taxRate !== null && !isValidAmount(taxRate))
      ) {
        return state;
      }

      const existing = state.items.find(
        (item) => item.productId === product.id
      );

      // Product exists: increase quantity, but stop at 15
      if (existing) {
        if (existing.quantity >= MAX_CART_QUANTITY) {
          return state;
        }

        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        };
      }

      // New product: add with quantity 1
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPricePaise: product.unitPricePaise,
            taxRateBps: taxRate,
            taxable: product.taxable ?? null,
          },
        ],
      };
    }),

  // UPDATE PRODUCT QUANTITY
  setQuantity: (productId, quantity) =>
    set((state) => {
      // Reject negative, decimal, or invalid quantities
      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 0
      ) {
        return state;
      }

      // Restrict maximum quantity to 15
      const safeQuantity = Math.min(
        quantity,
        MAX_CART_QUANTITY
      );

      // Automatically delete product at zero
      if (safeQuantity === 0) {
        return {
          items: state.items.filter(
            (item) => item.productId !== productId
          ),
        };
      }

      // Otherwise update the product quantity
      return {
        items: state.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: safeQuantity }
            : item
        ),
      };
    }),

  // REMOVE ONE PRODUCT
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter(
        (item) => item.productId !== productId
      ),
    })),

  // CLEAR ENTIRE CART
  clearCart: () =>
    set({
      items: [],
    }),
}));
