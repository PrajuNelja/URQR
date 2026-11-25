import { describe, expect, it } from "vitest";
import { serializeReceiptForBridge } from "./printPayload";

const receipt = {
  orderId: "#DEMO-123",
  date: "25 Nov 2026",
  time: "1:30 pm",
  items: [
    { name: "Coffee", price: 10, quantity: 2 },
    { name: "Cake", price: 5.5, quantity: 1 },
  ],
  subtotal: 25.5,
  taxRate: 5,
  tax: 1.28,
  total: 26.78,
  paymentMethod: "Cash",
  cashCollected: 30,
  change: 3.22,
};

describe("serializeReceiptForBridge", () => {
  it("serializes receipt totals, items, tenant, and split GST for the bridge", () => {
    expect(
      serializeReceiptForBridge(receipt, " tenant-1 ", "  Table 4  "),
    ).toEqual({
      action: "print",
      orderId: "#DEMO-123",
      tenantId: "tenant-1",
      billNumber: "#DEMO-123",
      paymentMode: "Cash",
      timestamp: "25 Nov 2026 1:30 pm",
      notes: "Table 4",
      store: {
        name: "Grand Horizon",
        address: "18 Harbour View Road",
        phone: "+91 98765 43210",
      },
      items: [
        {
          id: "#DEMO-123-1",
          name: "Coffee",
          quantity: 2,
          unitPrice: 10,
          totalPrice: 20,
          taxRate: 5,
        },
        {
          id: "#DEMO-123-2",
          name: "Cake",
          quantity: 1,
          unitPrice: 5.5,
          totalPrice: 5.5,
          taxRate: 5,
        },
      ],
      taxes: {
        cgst: 0.64,
        cgstRate: 2.5,
        sgst: 0.64,
        sgstRate: 2.5,
        totalTax: 1.28,
      },
      totals: { subtotal: 25.5, tax: 1.28, grandTotal: 26.78 },
      rollWidth: 80,
    });
  });

  it("rejects requests without a tenant or receipt items", () => {
    expect(() => serializeReceiptForBridge(receipt, null)).toThrow(
      "authenticated tenant",
    );
    expect(() =>
      serializeReceiptForBridge({ ...receipt, items: [] }, "tenant-1"),
    ).toThrow("without order items");
  });
});
