
import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { useCartStore } from "../lib/cartStore";

// Sample product
const coffee = {
  id: "1",
  name: "Coffee",
  unitPricePaise: 8000,
  itemDiscountPaise: 0,
  taxRateBps: null,
  taxable: null,
};

describe("POS Cart Store", () => {

  // Start every test with an empty cart
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  // TEST 1
  it("starts with an empty cart", () => {
    expect(
      useCartStore.getState().items
    ).toEqual([]);
  });

  // TEST 2
  it("adds a product to the cart", () => {
    useCartStore.getState().addItem(coffee);

    const items = useCartStore.getState().items;

    expect(items).toHaveLength(1);
    expect(items[0].productName).toBe("Coffee");
    expect(items[0].quantity).toBe(1);
    expect(items[0].unitPricePaise).toBe(8000);
  });

  // TEST 3
  it("increases quantity for the same product", () => {
    useCartStore.getState().addItem(coffee);
    useCartStore.getState().addItem(coffee);

    const items = useCartStore.getState().items;

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  // TEST 4
  it("updates product quantity", () => {
    useCartStore.getState().addItem(coffee);

    useCartStore.getState().setQuantity("1", 5);

    expect(
      useCartStore.getState().items[0].quantity
    ).toBe(5);
  });

  // TEST 5
  it("removes a product", () => {
    useCartStore.getState().addItem(coffee);

    useCartStore.getState().removeItem("1");

    expect(
      useCartStore.getState().items
    ).toHaveLength(0);
  });

  // TEST 6
  it("clears the cart", () => {
    useCartStore.getState().addItem(coffee);

    useCartStore.getState().clearCart();

    expect(
      useCartStore.getState().items
    ).toEqual([]);
  });

});
