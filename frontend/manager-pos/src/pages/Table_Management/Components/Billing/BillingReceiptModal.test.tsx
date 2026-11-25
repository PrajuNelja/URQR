// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationProvider } from "../../../../components/Notification/NotificationProvider";
import { BillingReceiptModal } from "./BillingReceiptModal";

const { printReceiptMock } = vi.hoisted(() => ({
  printReceiptMock: vi.fn(),
}));

vi.mock("../../Hooks/useBridgeHeartbeat", () => ({
  useBridgeHeartbeat: () => ({ printReceipt: printReceiptMock }),
}));

const receipt = {
  orderId: "#DEMO-123",
  date: "25 Nov 2026",
  time: "1:30 pm",
  items: [{ name: "Coffee", price: 10, quantity: 1 }],
  subtotal: 10,
  taxRate: 5,
  tax: 0.5,
  total: 10.5,
  paymentMethod: "Cash",
  cashCollected: 15,
  change: 4.5,
};

function renderReceiptModal() {
  return render(
    <NotificationProvider>
      <BillingReceiptModal
        isOpen
        onClose={vi.fn()}
        receipt={receipt}
      />
    </NotificationProvider>,
  );
}

describe("BillingReceiptModal reprint", () => {
  beforeEach(() => {
    localStorage.setItem("tenant_id", "tenant-1");
    printReceiptMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("dispatches a reprint and marks the displayed receipt after success", async () => {
    printReceiptMock.mockResolvedValue({
      success: true,
      orderId: receipt.orderId,
      status: "PRINTER_READY",
    });
    renderReceiptModal();

    fireEvent.click(screen.getByRole("button", { name: "Reprint receipt" }));

    await waitFor(() => {
      expect(printReceiptMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "reprint",
          orderId: receipt.orderId,
          tenantId: "tenant-1",
        }),
        expect.any(Number),
      );
    });
    expect(await screen.findByText("Receipt reprinted successfully.")).toBeTruthy();
    expect(screen.getByText("Receipt reprint")).toBeTruthy();
  });

  it("shows queued feedback for a spooled reprint without claiming it printed", async () => {
    printReceiptMock.mockResolvedValue({
      success: true,
      orderId: receipt.orderId,
      status: "SPOOLED",
    });
    renderReceiptModal();

    fireEvent.click(screen.getByRole("button", { name: "Reprint receipt" }));

    expect(await screen.findByText("Receipt reprint queued.")).toBeTruthy();
    expect(screen.queryByText("Receipt reprint")).toBeNull();
  });

  it("shows bridge failure feedback for an unsuccessful reprint", async () => {
    printReceiptMock.mockResolvedValue({
      success: false,
      orderId: receipt.orderId,
      status: "PRINTER_OFFLINE",
      message: "Printer offline",
    });
    renderReceiptModal();

    fireEvent.click(screen.getByRole("button", { name: "Reprint receipt" }));

    expect(
      await screen.findByText("Receipt reprint failed: Printer offline"),
    ).toBeTruthy();
  });

  it("does not dispatch without an authenticated tenant", async () => {
    localStorage.removeItem("tenant_id");
    renderReceiptModal();

    fireEvent.click(screen.getByRole("button", { name: "Reprint receipt" }));

    expect(
      await screen.findByText(
        /without an authenticated tenant/,
      ),
    ).toBeTruthy();
    expect(printReceiptMock).not.toHaveBeenCalled();
  });
});
