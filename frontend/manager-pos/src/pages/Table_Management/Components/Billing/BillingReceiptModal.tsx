import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PosIcon } from "../../../../components/Icons/PosIcon";
import { IconButton } from "../../../../components/Buttons/IconButton";

import { Receipt } from "../../../../components/PopupModal/Receipt";
import { Button } from "../../../../components/Buttons/Button";
import { useNotification } from "../../../../components/Notification/useNotification";
import { useBridgeHeartbeat } from "../../Hooks/useBridgeHeartbeat";
import { bridgeClient, isTauriRuntime } from "../../../../lib/bridge/bridgeClient";
import {
  RECEIPT_BUSINESS,
  serializeReceiptForBridge,
} from "../../../../lib/bridge/printPayload";

import type { ReceiptData } from "../../Types/billing.types";

interface PreviewItem {
  name: string;
  price: number;
  quantity: number;
}

export interface PreviewOrderData {
  orderId: string;
  date: string;
  time: string;
  items: PreviewItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  restaurantName: string;
  addressLine?: string;
  contactLine?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
  previewOrder?: PreviewOrderData;
}

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function BillingReceiptModal({
  isOpen,
  onClose,
  receipt,
  previewOrder,
}: Props) {
  const bottomCloseRef = useRef<HTMLButtonElement>(null);

  const isPreview = Boolean(previewOrder);

  const { printReceipt } = useBridgeHeartbeat(false);
  const { success, error, info } = useNotification();
  const [isPrinting, setIsPrinting] = useState(false);
  const [reprintState, setReprintState] = useState<{ orderId: string; printedAt: string } | null>(null);
  
  const currentReprint =
    reprintState?.orderId === receipt?.orderId ? reprintState : null;

  const handlePrintAction = async () => {
    if (!receipt || isPrinting) return;

    setIsPrinting(true);
    try {
      if (isTauriRuntime()) {
        await bridgeClient.connect();
      }

      const request = serializeReceiptForBridge(
        receipt,
        localStorage.getItem("tenant_id"),
      );
      
      const response = await printReceipt(
        { ...request, action: "reprint" },
        performance.now(),
      );

      if (!response.success) {
        error(`Receipt reprint failed: ${response.message ?? response.status}`);
        return;
      }

      if (["SPOOLED", "PRINTING"].includes(response.status.toUpperCase())) {
        info("Receipt reprint queued.");
        return;
      }

      const printedAt = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setReprintState({ orderId: receipt.orderId, printedAt });
      success("Receipt reprinted successfully.");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unknown bridge error";
      error(`Receipt reprint failed: ${message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  // Keyboard focus and background scroll lock
  useEffect(() => {
    if (!isOpen || !isPreview) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";
    bottomCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, isPreview]);

  if (!isOpen) return null;

  // =================================================
  // PREVIEW — SAME VISUAL LAYOUT AS HTML REFERENCE
  // =================================================
  if (previewOrder) {
    const handleKeys = (
      event: React.KeyboardEvent<HTMLDivElement>
    ) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const btn = bottomCloseRef.current;
        if (!btn) return;
        event.preventDefault();
        btn.focus();
      }
    };

    return createPortal(
      <div
        role="presentation"
        onKeyDown={handleKeys}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-[#120D09]/60 backdrop-blur-xs"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Order bill preview"
          className="relative w-full max-w-[420px] mx-auto my-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)]"
        >
          {/* AUTHENTIC THERMAL BILL PAPER */}
          <article className="relative w-full max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)] flex flex-col rounded-2xl border border-[#E3D9CB] dark:border-[#43352A] bg-[#FFFDF8] dark:bg-[#251D17] text-[#3B2A1E] dark:text-[#F5EEE0] shadow-2xl font-sans overflow-hidden">
            {/* CLOSE BUTTON AT TOP-RIGHT OF PREVIEW */}
            <IconButton
              label="Close preview"
              variant="outline"
              size="sm"
              onClick={onClose}
              icon={<PosIcon name="close" size={20} strokeWidth={2} className="!h-5 !w-5 shrink-0" />}
              className="!absolute top-3 right-3 z-20 !h-9 !w-9 !rounded-full !border-[#D8C7B0] !bg-[#FAF6F0] !text-[#4A382A] hover:!bg-[#EFE5D5] dark:!bg-[#251D17] dark:!border-[#4A3728] dark:!text-[#E8DEC8] dark:hover:!bg-[#32271F] focus-visible:!outline-2 focus-visible:!outline-[#8B5E3C] focus-visible:outline-offset-2"
            />
            
            {/* SCROLLABLE PREVIEW CONTENT */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* RESTAURANT HEADER */}
              <header className="text-center pb-4 border-b border-dashed border-[#E3D9CB] dark:border-[#43352A]">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#8B5E3C] dark:text-[#B07C54] mb-1">
                  Order Bill Preview
                </span>
                <h2 className="text-xl font-bold tracking-tight text-[#3B2A1E] dark:text-[#F5EEE0]">
                  {previewOrder.restaurantName}
                </h2>
                {previewOrder.addressLine && (
                  <p className="mt-1 text-xs text-[#7A6A5A] dark:text-[#BFAEA0]">
                    {previewOrder.addressLine}
                  </p>
                )}
                {previewOrder.contactLine && (
                  <p className="text-xs text-[#7A6A5A] dark:text-[#BFAEA0]">
                    {previewOrder.contactLine}
                  </p>
                )}
              </header>

              {/* ORDER META INFO */}
              <div className="flex items-center justify-between py-3 border-b border-[#EFE8DE] dark:border-[#3A2F27] text-xs">
                <div>
                  <span className="block text-[10px] font-semibold text-[#82766D] dark:text-[#BFAEA0] uppercase tracking-wider">
                    Order ID
                  </span>
                  <span className="font-mono font-bold text-sm text-[#3B2A1E] dark:text-[#F5EEE0]">
                    #{previewOrder.orderId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-semibold text-[#82766D] dark:text-[#BFAEA0] uppercase tracking-wider">
                    Date & Time
                  </span>
                  <span className="font-medium text-xs text-[#3B2A1E] dark:text-[#F5EEE0]">
                    {previewOrder.date} · {previewOrder.time}
                  </span>
                </div>
              </div>

              {/* ITEMS LIST */}
              <div className="py-2">
                <div className="flex items-center justify-between py-2 text-[11px] font-bold uppercase tracking-wider text-[#82766D] dark:text-[#BFAEA0] border-b border-[#EFE8DE] dark:border-[#3A2F27]">
                  <span>Item & Qty</span>
                  <span>Amount</span>
                </div>

                <div className="divide-y divide-[#F5EFE6] dark:divide-[#2E241C]">
                  {previewOrder.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="font-medium text-[#3B2A1E] dark:text-[#F5EEE0] line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#7A6A5A] dark:text-[#BFAEA0]">
                          {money(item.price)} × {item.quantity}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#3B2A1E] dark:text-[#F5EEE0] shrink-0">
                        {money(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTALS SUMMARY */}
              <div className="mt-2 pt-3 border-t border-dashed border-[#E3D9CB] dark:border-[#43352A] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#7A6A5A] dark:text-[#BFAEA0]">
                  <span>Subtotal</span>
                  <span className="font-mono">{money(previewOrder.subtotal)}</span>
                </div>

                <div className="flex justify-between text-[#7A6A5A] dark:text-[#BFAEA0]">
                  <span>Tax ({previewOrder.taxRate}%)</span>
                  <span className="font-mono">{money(previewOrder.tax)}</span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#EFE8DE] dark:border-[#3A2F27] text-base font-bold text-[#3B2A1E] dark:text-[#F5EEE0]">
                  <span>Total Payable</span>
                  <span className="font-mono text-lg text-[#8B5E3C] dark:text-[#B07C54]">
                    {money(previewOrder.total)}
                  </span>
                </div>
              </div>

              {/* FOOTER NOTE */}
              <p className="mt-4 text-center text-xs italic text-[#82766D] dark:text-[#BFAEA0]">
                ✦ Thank you for dining with us ✦
              </p>
            </div>

            {/* CLEAN EMBEDDED DISMISS BUTTON */}
            <div className="shrink-0 p-4 sm:px-6 sm:py-3.5 border-t border-[#EFE8DE] dark:border-[#3A2F27] bg-[#FFFDF8] dark:bg-[#251D17]">
              <Button
                ref={bottomCloseRef}
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={onClose}
                className="h-10 rounded-xl bg-[#8B5E3C] dark:bg-[#B07C54] hover:bg-[#5C3D26] dark:hover:bg-[#8B5E3C] text-white font-semibold text-sm transition-all cursor-pointer shadow-sm active:scale-98"
              >
                Close Preview
              </Button>
            </div>
          </article>
        </div>
      </div>,
      document.body
    );
  }

  // =================================================
  // COMPLETED RECEIPT — SINGLE AUTHENTIC BILL SHOWCASE
  // =================================================
  return createPortal(
    <div
      role="presentation"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#120D09]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order receipt"
        className="w-full max-w-[420px] mx-auto my-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)]"
      >
        {/* AUTHENTIC THERMAL BILL PAPER — NO NESTED OUTER CARD */}
        <article className="relative w-full max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)] flex flex-col rounded-2xl border border-[#E3D9CB] dark:border-[#43352A] bg-white dark:bg-[#1E1712] text-[#111827] dark:text-[#F5EEE0] shadow-2xl overflow-hidden font-mono">
          {/* CLOSE BUTTON AT TOP-RIGHT INSIDE BILL HEADER */}
          <IconButton
              label="Close receipt"
              variant="outline"
              size="sm"
              onClick={onClose}
              icon={<PosIcon name="close" size={20} strokeWidth={2} className="!h-5 !w-5 shrink-0" />}
              className="!absolute top-3 right-3 z-20 !h-9 !w-9 !rounded-full !border-[#D8C7B0] !bg-[#FAF6F0] !text-[#4A382A] hover:!bg-[#EFE5D5] dark:!bg-[#251D17] dark:!border-[#4A3728] dark:!text-[#E8DEC8] dark:hover:!bg-[#32271F] focus-visible:!outline-2 focus-visible:!outline-[#8B5E3C] focus-visible:outline-offset-2"
            />

          {/* SCROLLABLE BILL CONTENT — FITS LAPTOP AND DESKTOP SCREENS WITHOUT CUTTING OFF */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {receipt && (
              <Receipt
                business={RECEIPT_BUSINESS}
                orderId={receipt.orderId}
                date={receipt.date}
                time={receipt.time}
                items={receipt.items}
                subtotal={receipt.subtotal}
                taxRate={receipt.taxRate}
                tax={receipt.tax}
                total={receipt.total}
                paymentMethod={receipt.paymentMethod}
                cashCollected={receipt.cashCollected}
                change={receipt.change}
                isReprint={Boolean(currentReprint)}
                reprintedAt={currentReprint?.printedAt}
                className="!p-0 !max-w-none [&>div]:!p-0 [&>div]:!max-w-none [&>div]:!bg-transparent dark:[&>div]:!text-[#F5EEE0]"
              />
            )}
          </div>

          {/* ACTION BUTTONS DIRECTLY AT BOTTOM OF BILL */}
          <div className="shrink-0 p-4 sm:px-6 sm:py-3.5 border-t border-dashed border-[#9ca3af] dark:border-[#43352A] flex items-center gap-2.5 bg-white dark:bg-[#1E1712]">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => void handlePrintAction()}
              disabled={!receipt || isPrinting}
              aria-label="Reprint receipt"
            >
              {isPrinting ? "Printing..." : "Print receipt"}
            </Button>
          </div>
        </article>
      </div>
    </div>,
    document.body
  );
}

export default BillingReceiptModal;