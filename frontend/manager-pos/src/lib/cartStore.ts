
import { create } from "zustand";

// 1. Product details received from catalog
export interface CartProduct {
  id: string;
  name: string;
  unitPricePaise: number;
  itemDiscountPaise?: number;
  taxRateBps?: number | null;
  taxable?: boolean | null;
}

// 2. Structure of an item in the cart
export interface CartLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPricePaise: number;
  itemDiscountPaise: number;
  taxRateBps: number | null;
  taxable: boolean | null;
}

// 3. Cart state and functions
interface CartState {
  items: CartLineItem[];

  addItem: (product: CartProduct) => void;

  setQuantity: (
    productId: string,
    quantity: number
  ) => void;

  removeItem: (productId: string) => void;

  clearCart: () => void;
}

// Validate price and discount values
const isValidAmount = (amount: number) =>
  Number.isSafeInteger(amount) && amount >= 0;

// 4. Create the Zustand cart store
export const useCartStore = create<CartState>()(
  (set) => ({
    // Initially empty cart
    items: [],

    // ADD PRODUCT
    addItem: (product) =>
      set((state) => {
        const discount = product.itemDiscountPaise ?? 0;
        const taxRate = product.taxRateBps ?? null;

        if (
          !product.id.trim() ||
          !product.name.trim() ||
          !isValidAmount(product.unitPricePaise) ||
          !isValidAmount(discount) ||
          discount > product.unitPricePaise ||
          (taxRate !== null &&
            !isValidAmount(taxRate))
        ) {
          return state;
        }

        const existing = state.items.find(
          (item) => item.productId === product.id
        );

        // If product exists, increase quantity
        if (existing) {
          if (!Number.isSafeInteger(existing.quantity + 1)) {
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

        // Otherwise add a new product
        return {
          items: [
            ...state.items,
            {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              unitPricePaise: product.unitPricePaise,
              itemDiscountPaise: discount,
              taxRateBps: taxRate,
              taxable: product.taxable ?? null,
            },
          ],
        };
      }),

    // UPDATE PRODUCT QUANTITY
    setQuantity: (productId, quantity) =>
      set((state) => {
        if (
          !Number.isSafeInteger(quantity) ||
          quantity < 0
        ) {
          return state;
        }

        // Quantity zero removes the product
        if (quantity === 0) {
          return {
            items: state.items.filter(
              (item) => item.productId !== productId
            ),
          };
        }

        return {
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
        };
      }),

    // REMOVE PRODUCT
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
  })
);
