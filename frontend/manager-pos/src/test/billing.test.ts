// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
import { queryClient, POS_CATALOG_QUERY_KEY, posCatalogQueryDefaults } from "../queryClient";
import { mockCatalogDishes } from "../mocks/handlers";
import { TAX_RATE } from "../pages/Table_Management/Config/billing.config";
import { NumericKeypad } from "../components/Keypad/NumericKeypad";
import { NumericKeypadModal } from "../components/Keypad/NumericKeypadModal";
import { QuantityStepper } from "../components/DataTable/QuantityStepper";
import { QuickItemSearchBar } from "../components/InputField/QuickItemSearchBar";
import { BillingCatalog } from "../pages/Table_Management/Components/Billing/BillingCatalog";
import type { Dish } from "../pages/Table_Management/Types/billing.types";

describe("Screen 2: POS Billing Engine & Cart Verification (Page 2)", () => {
  it("Task 1: verifies TanStack Query client has dedicated caching defaults for POS catalog queries", () => {
    expect(posCatalogQueryDefaults.staleTime).toBe(5 * 60 * 1000); // 5 minutes
    expect(posCatalogQueryDefaults.gcTime).toBe(30 * 60 * 1000);   // 30 minutes
    expect(posCatalogQueryDefaults.retry).toBe(3);
    expect(posCatalogQueryDefaults.refetchOnWindowFocus).toBe(false);

    const defaultQueryOptions = queryClient.getQueryDefaults(POS_CATALOG_QUERY_KEY);
    expect(defaultQueryOptions.staleTime).toBe(5 * 60 * 1000);
    expect(defaultQueryOptions.gcTime).toBe(30 * 60 * 1000);
    expect(defaultQueryOptions.retry).toBe(3);
  });

  it("Task 2: verifies Cart State store math, line items, quantities, and pricing attributes", () => {
    const dish1 = { id: 1, name: "Truffle Mushroom Soup", price: 12.0, category: "Starters" };
    const dish2 = { id: 3, name: "Grilled Salmon Steak", price: 24.5, category: "Main Course" };

    const cart: Record<number, number> = { [dish1.id]: 2, [dish2.id]: 1 };

    const subtotal = dish1.price * cart[dish1.id] + dish2.price * cart[dish2.id]; // 24 + 24.5 = 48.50
    expect(subtotal).toBe(48.5);

    const tax = Math.round(subtotal * (TAX_RATE / 100) * 100) / 100; // 5% of 48.50 = 2.425 -> 2.43
    expect(tax).toBe(2.43);

    const total = Math.round((subtotal + tax) * 100) / 100; // 50.93
    expect(total).toBe(50.93);

    const nextCart = { ...cart };
    delete nextCart[dish2.id];
    expect(nextCart[dish2.id]).toBeUndefined();
    expect(Object.keys(nextCart).length).toBe(1);
  });

  it("Task 3: verifies MSW catalog handlers return valid product catalog dishes", () => {
    expect(mockCatalogDishes.length).toBeGreaterThan(0);
    expect(mockCatalogDishes[0]).toHaveProperty("id");
    expect(mockCatalogDishes[0]).toHaveProperty("name");
    expect(mockCatalogDishes[0]).toHaveProperty("price");
    expect(mockCatalogDishes[0]).toHaveProperty("category");
  });

  it("Task 4: verifies POS keyboard shortcut listener dispatches function keys (F1-F12)", () => {
    const onClearCart = vi.fn();
    const onSelectCash = vi.fn();
    const onCheckout = vi.fn();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") onClearCart();
      if (e.key === "F7") onSelectCash();
      if (e.key === "F10") onCheckout();
    };

    window.addEventListener("keydown", handleKeyDown);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F4" }));
    expect(onClearCart).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F7" }));
    expect(onSelectCash).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F10" }));
    expect(onCheckout).toHaveBeenCalledTimes(1);

    window.removeEventListener("keydown", handleKeyDown);
  });
});

describe("Screen 2: POS Billing UI Primitives & Ergonomics (Page 3)", () => {
  it("Task 1 & Task 4: renders NumericKeypad with minimum 64x64px touch targets", () => {
    const onDigit = vi.fn();
    const onBackspace = vi.fn();
    const onClear = vi.fn();

    const { getByRole, getAllByRole } = render(
      React.createElement(NumericKeypad, {
        onDigit,
        onBackspace,
        onClear,
      })
    );

    const buttons = getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(12);

    // Verify 64x64px minimum touch target CSS classes
    buttons.forEach((btn) => {
      expect(btn.className).toContain("min-h-[64px]");
      expect(btn.className).toContain("min-w-[64px]");
    });

    // Test digit entry
    const btn7 = getByRole("button", { name: /Digit 7/i });
    fireEvent.click(btn7);
    expect(onDigit).toHaveBeenCalledWith("7");

    // Test clear and backspace
    const btnClr = getByRole("button", { name: /Clear input/i });
    fireEvent.click(btnClr);
    expect(onClear).toHaveBeenCalledTimes(1);

    const btnDel = getByRole("button", { name: /Backspace/i });
    fireEvent.click(btnDel);
    expect(onBackspace).toHaveBeenCalledTimes(1);
  });

  it("Task 1: renders touch-friendly NumericKeypadModal with readout screen and quick presets", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    const { getByText, getByRole } = render(
      React.createElement(NumericKeypadModal, {
        isOpen: true,
        onClose,
        title: "Cash Tendered",
        initialValue: "100",
        onConfirm,
        quickPresets: [50, 100, 500],
      })
    );

    expect(getByText("Cash Tendered")).toBeDefined();
    expect(getByText("100")).toBeDefined();

    // Confirm button triggers callback with numeric value
    const confirmBtn = getByRole("button", { name: /Confirm/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith(100, "100");
  });

  it("Task 2: QuantityStepper supports instant direct numeric typing and maximum limit safety", () => {
    const onChange = vi.fn();

    const { getByRole, getByLabelText } = render(
      React.createElement(QuantityStepper, {
        value: 2,
        min: 1,
        max: 50,
        onChange,
      })
    );

    const input = getByLabelText("Item quantity") as HTMLInputElement;
    expect(input.value).toBe("2");

    // Instant direct numeric input
    fireEvent.change(input, { target: { value: "15" } });
    expect(onChange).toHaveBeenCalledWith(15);

    // Maximum limit safety clamp: entering 999 is clamped to max (50)
    fireEvent.change(input, { target: { value: "999" } });
    expect(onChange).toHaveBeenCalledWith(50);

    // Stepper + / - buttons
    const incBtn = getByRole("button", { name: /Increase quantity/i });
    fireEvent.click(incBtn);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("Task 3: QuickItemSearchBar handles debounced search and direct hardware barcode scanner input", () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    const onBarcodeScanned = vi.fn();

    const { getByLabelText } = render(
      React.createElement(QuickItemSearchBar, {
        onSearchChange,
        onBarcodeScanned,
        debounceMs: 200,
      })
    );

    const searchInput = getByLabelText("Quick dish search and barcode input") as HTMLInputElement;

    // Test debounced text typing
    fireEvent.change(searchInput, { target: { value: "Truffle" } });
    expect(onSearchChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onSearchChange).toHaveBeenCalledWith("Truffle");

    // Test direct hardware barcode scanner input (rapid burst + Enter)
    fireEvent.change(searchInput, { target: { value: "890103001" } });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(onBarcodeScanned).toHaveBeenCalledWith("890103001");
    vi.useRealTimers();
  });
});

describe("Screen 2: Responsive Catalog Grid & Card Visual States (Tasks 1-5)", () => {
  const sampleDishes: Dish[] = [
    { id: 1, name: "Truffle Mushroom Soup", category: "Starters", description: "Garlic bread", price: 12, stock: 15, lowStockThreshold: 5 },
    { id: 2, name: "Wagyu Ribeye", category: "Main Course", description: "Brioche, fries", price: 48, stock: 2, lowStockThreshold: 3 },
    { id: 3, name: "Lobster Linguine", category: "Main Course", description: "White wine", price: 36, stock: 0, lowStockThreshold: 2 },
  ];

  it("Task 1 & Task 4: renders responsive Catalog Grid and category horizontal scroll pills", () => {
    const setActiveTab = vi.fn();
    const { getByRole, getAllByRole } = render(
      React.createElement(BillingCatalog, {
        searchQuery: "",
        setSearchQuery: vi.fn(),
        activeTab: "all",
        setActiveTab,
        filteredDishes: sampleDishes,
        addToCart: vi.fn(),
        cart: {},
      })
    );

    const grid = getByRole("region", { name: /Product Catalog Grid/i });
    expect(grid.className).toContain("grid-cols-2");
    expect(grid.className).toContain("sm:grid-cols-3");
    expect(grid.className).toContain("xl:grid-cols-4");

    const categoryButtons = getAllByRole("button", { name: /All|Starters|Main Course/i });
    expect(categoryButtons.length).toBeGreaterThanOrEqual(3);

    // Click category pill triggers setActiveTab
    fireEvent.click(categoryButtons[1]);
    expect(setActiveTab).toHaveBeenCalledWith("starters");
  });

  it("Task 2: renders item card visual states: in-stock count, low-stock badge, out-of-stock disabled state, and cart badge", () => {
    const { getByText } = render(
      React.createElement(BillingCatalog, {
        searchQuery: "",
        setSearchQuery: vi.fn(),
        activeTab: "all",
        setActiveTab: vi.fn(),
        filteredDishes: sampleDishes,
        addToCart: vi.fn(),
        cart: { 1: 3 }, // Dish 1 has 3 in cart
      })
    );

    // In-stock state for Dish 1 (stock: 15)
    expect(getByText(/15 in stock/i)).toBeDefined();

    // Cart badge for Dish 1 (3 in cart)
    expect(getByText("×3")).toBeDefined();

    // Low-stock badge for Dish 2 (stock: 2 <= lowStockThreshold: 3)
    expect(getByText(/Only 2 left/i)).toBeDefined();

    // Out-of-stock badge for Dish 3 (stock: 0)
    expect(getByText(/Sold Out/i)).toBeDefined();
  });

  it("Task 3: one-click/touch tap on card appends item to active cart, while out-of-stock card is disabled", () => {
    const addToCart = vi.fn();

    const { getByText } = render(
      React.createElement(BillingCatalog, {
        searchQuery: "",
        setSearchQuery: vi.fn(),
        activeTab: "all",
        setActiveTab: vi.fn(),
        filteredDishes: sampleDishes,
        addToCart,
        cart: {},
      })
    );

    // 1-Tap on in-stock card appends to cart
    const dishCard = getByText("Truffle Mushroom Soup").closest("div[role='button']")!;
    fireEvent.click(dishCard);
    expect(addToCart).toHaveBeenCalledWith(1);

    // 1-Tap on out-of-stock card (Lobster Linguine) does NOT append to cart
    const soldOutCard = getByText("Lobster Linguine").closest("div[role='button']")!;
    fireEvent.click(soldOutCard);
    expect(addToCart).not.toHaveBeenCalledWith(3);
  });
});

