
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
  taxRateBps: null,
  taxable: null,
};

describe("POS Cart Store", () => {

  // Start every test with an empty cart
  beforeEach(() => {
    useCartStore.setState({ items: [], heldCarts: [] });
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

  // TEST 7: Hold / Park current cart
  it("parks/holds the current cart and resets active items", () => {
    useCartStore.getState().addItem(coffee);
    expect(useCartStore.getState().items).toHaveLength(1);

    useCartStore.getState().holdCurrentCart();

    // Active items reset
    expect(useCartStore.getState().items).toHaveLength(0);

    // Parked in heldCarts
    const held = useCartStore.getState().heldCarts;
    expect(held).toHaveLength(1);
    expect(held[0].items).toHaveLength(1);
    expect(held[0].items[0].productName).toBe("Coffee");
  });

  // TEST 8: Recall parked cart
  it("recalls a parked cart and restores items to active cart", () => {
    useCartStore.getState().addItem(coffee);
    useCartStore.getState().holdCurrentCart();

    const heldId = useCartStore.getState().heldCarts[0].id;
    useCartStore.getState().recallCart(heldId);

    // Items restored
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productName).toBe("Coffee");

    // Removed from heldCarts
    expect(useCartStore.getState().heldCarts).toHaveLength(0);
  });

  // TEST 9: Delete parked cart
  it("deletes a parked cart without restoring", () => {
    useCartStore.getState().addItem(coffee);
    useCartStore.getState().holdCurrentCart();

    const heldId = useCartStore.getState().heldCarts[0].id;
    useCartStore.getState().deleteHeldCart(heldId);

    expect(useCartStore.getState().heldCarts).toHaveLength(0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  // TEST 10: Does not hold when cart is empty
  it("does not hold when cart is empty", () => {
    useCartStore.getState().clearCart();
    useCartStore.getState().holdCurrentCart();

    expect(useCartStore.getState().heldCarts).toHaveLength(0);
  });
});
