import type { ReceiptData } from "../../pages/Table_Management/Types/billing.types";
import type { BridgePrintRequest } from "./bridgeClient";

export const RECEIPT_BUSINESS = {
  name: "Grand Horizon",
  address: "18 Harbour View Road",
  phone: "+91 98765 43210",
};

export function serializeReceiptForBridge(
  receipt: ReceiptData,
  tenantId: string | null,
  notes?: string,
): BridgePrintRequest {
  if (!tenantId?.trim()) {
    throw new Error("Cannot print a receipt without an authenticated tenant.");
  }
  if (receipt.items.length === 0) {
    throw new Error("Cannot print a receipt without order items.");
  }

  const totalTaxPaise = Math.round(receipt.tax * 100);
  const cgstPaise = Math.floor(totalTaxPaise / 2);
  const sgstPaise = totalTaxPaise - cgstPaise;

  return {
    action: "print",
    orderId: receipt.orderId,
    tenantId: tenantId.trim(),
    billNumber: receipt.orderId,
    paymentMode: receipt.paymentMethod,
    timestamp: `${receipt.date} ${receipt.time}`,
    notes: notes?.trim() || undefined,
    store: RECEIPT_BUSINESS,
    items: receipt.items.map((item, index) => ({
      id: `${receipt.orderId}-${index + 1}`,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: Math.round(item.price * item.quantity * 100) / 100,
      taxRate: receipt.taxRate,
    })),
    taxes: {
      cgst: cgstPaise / 100,
      cgstRate: receipt.taxRate / 2,
      sgst: sgstPaise / 100,
      sgstRate: receipt.taxRate / 2,
      totalTax: receipt.tax,
    },
    totals: {
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      grandTotal: receipt.total,
    },
    rollWidth: 80,
  };
}
