import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Receipt } from "../../../../components/PopupModal/Receipt";
import { Button } from "../../../../components/Buttons/Button";
import { IconButton } from "../../../../components/Buttons/IconButton";
import { useBridgeHeartbeat } from "../../Hooks/useBridgeHeartbeat";
import {
  RECEIPT_BUSINESS,
  serializeReceiptForBridge,
} from "../../../../lib/bridge/printPayload";

import type { ReceiptData } from "../../Types/billing.types";

// Existing project colors
const COLOR = {
  paper: "#FFFDF8",
  text: "#3B2A1E",
  muted: "#82766D",
  border: "#E4D8C3",
  line: "#EDE5D9",
};

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
  const crossRef = useRef<HTMLButtonElement>(null);
  const bottomCloseRef = useRef<HTMLButtonElement>(null);

  const isPreview = Boolean(previewOrder);

  const { printReceipt } = useBridgeHeartbeat(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Track whether the receipt has been printed at least once
  const [hasPrinted, setHasPrinted] = useState(false);
  const [reprintState, setReprintState] = useState<{ orderId: string; printedAt: string } | null>(null);
  
  const currentReprint =
    reprintState?.orderId === receipt?.orderId ? reprintState : null;

  // Reset the printed state if the modal is closed or the order changes
  useEffect(() => {
    if (!isOpen) {
      setHasPrinted(false);
      setReprintState(null);
    }
  }, [isOpen]);

  const handlePrintAction = async () => {
    if (!receipt || isPrinting) return;

    setIsPrinting(true);
    try {
      const request = serializeReceiptForBridge(
        receipt,
        localStorage.getItem("tenant_id"),
      );
      
      // Use "print" for the first time, "reprint" for subsequent clicks
      const action = hasPrinted ? "reprint" : "print";
      
      const response = await printReceipt(
        { ...request, action },
        performance.now(),
      );

      if (!response.success) {
        // Silent fail or handle differently since notifications are removed
        console.error(`Receipt print failed: ${response.message ?? response.status}`);
        return;
      }

      // If the print request was successful, update the UI state
      if (["SPOOLED", "PRINTING", "SUCCESS"].includes(response.status.toUpperCase())) {
        setHasPrinted(true);
        const printedAt = new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setReprintState({ orderId: receipt.orderId, printedAt });
      }
    } catch (cause) {
      console.error("Bridge error:", cause);
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
    crossRef.current?.focus();

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
    const rowStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      width: "100%",
    } as const;

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
        const first = crossRef.current;
        const last = bottomCloseRef.current;

        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
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
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          padding: "38px 20px 28px",
          boxSizing: "border-box",
          background: "rgba(25, 20, 17, 0.64)",
          backdropFilter: "blur(3px)",
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Unpaid order receipt preview"
          style={{
            width: "min(558px, 100%)",
            maxWidth: "100%",
            margin: "auto",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
          }}
        >
          {/* RECEIPT PAPER */}
          <article
            style={{
              position: "relative",
              width: "100%",
              boxSizing: "border-box",
              padding: "32px clamp(20px, 6vw, 40px) 32px",
              background: COLOR.paper,
              color: COLOR.text,
              borderRadius: "24px",
              boxShadow: "0 18px 55px rgba(0,0,0,0.22)",
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            {/* FLOATING CLOSE ICON — REUSABLE */}
            <IconButton
              ref={crossRef}
              label="Close order preview"
              icon={<X size={17} strokeWidth={2} />}
              variant="ghost"
              size="sm"
              onClick={onClose}
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                zIndex: 2,
                width: "30px",
                height: "30px",
                minWidth: "30px",
                padding: 0,
                border: "none",
                borderRadius: "50%",
                background: "#49382E",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />

            {/* HOTEL HEADER */}
            <header style={{ textAlign: "center" }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(24px, 5vw, 29px)",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: COLOR.text,
                  textTransform: "uppercase",
                }}
              >
                {previewOrder.restaurantName}
              </h2>

              <p
                style={{
                  minHeight: "17px",
                  margin: "8px 0 0",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: COLOR.muted,
                }}
              >
                {previewOrder.addressLine || "\u00A0"}
              </p>

              <p
                style={{
                  minHeight: "17px",
                  margin: "3px 0 0",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: COLOR.muted,
                }}
              >
                {previewOrder.contactLine || "\u00A0"}
              </p>
            </header>

            {/* RECEIPT TITLE */}
            <div
              style={{
                marginTop: "24px",
                paddingBottom: "14px",
                borderBottom: `1px dashed ${COLOR.border}`,
                textAlign: "center",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.18em",
              }}
            >
              ORDER PREVIEW — UNPAID
            </div>

            {/* ORDER INFORMATION */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                columnGap: "20px",
                padding: "27px 0 37px",
                borderBottom: `1px solid ${COLOR.border}`,
              }}
            >
              <div>
                <div style={{ color: COLOR.muted, fontSize: "10px", fontWeight: 700, marginBottom: "5px" }}>
                  ORDER NUMBER
                </div>
                <strong style={{ fontSize: "15px", fontWeight: 700 }}>
                  {previewOrder.orderId}
                </strong>
              </div>

              <div>
                <div style={{ color: COLOR.muted, fontSize: "10px", fontWeight: 700, marginBottom: "5px" }}>
                  DATE / TIME
                </div>
                <strong style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.5 }}>
                  {previewOrder.date}, {previewOrder.time}
                </strong>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div style={{ width: "100%" }}>
              <div
                style={{
                  ...rowStyle,
                  padding: "16px 0 10px",
                  borderBottom: `1px solid ${COLOR.line}`,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                <span>ITEM / QUANTITY</span>
                <span>AMOUNT</span>
              </div>

              {previewOrder.items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  style={{
                    ...rowStyle,
                    padding: "15px 0",
                    minHeight: "46px",
                    boxSizing: "border-box",
                    borderBottom: `1px solid ${COLOR.line}`,
                    fontSize: "13px",
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    {item.name} × {item.quantity}
                  </span>
                  <strong style={{ whiteSpace: "nowrap", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {money(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div style={{ width: "min(230px, 100%)", margin: "9px 0 0 auto", fontSize: "13px" }}>
              <div style={{ ...rowStyle, padding: "5px 0" }}>
                <span style={{ color: COLOR.muted }}>Subtotal</span>
                <strong>{money(previewOrder.subtotal)}</strong>
              </div>

              <div style={{ ...rowStyle, padding: "5px 0 9px", borderBottom: `1px solid ${COLOR.border}` }}>
                <span style={{ color: COLOR.muted }}>Tax ({previewOrder.taxRate}%)</span>
                <strong>{money(previewOrder.tax)}</strong>
              </div>

              <div
                style={{
                  ...rowStyle,
                  paddingTop: "12px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(16px, 3.5vw, 21px)",
                  fontWeight: 700,
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>Final payable</span>
                <strong style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {money(previewOrder.total)}
                </strong>
              </div>
            </div>

            <p
              style={{
                margin: "29px 0 0",
                paddingTop: "17px",
                borderTop: `1px dashed ${COLOR.border}`,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: "14px",
                textAlign: "center",
                color: COLOR.muted,
              }}
            >
              Thank you for dining with us. Visit again!
            </p>
          </article>

          <Button
            ref={bottomCloseRef}
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            style={{
              width: "80px",
              height: "44px",
              minHeight: "44px",
              flexShrink: 0,
              margin: 0,
              padding: "0 14px",
              border: "1px solid rgba(255,255,255,0.45)",
              borderRadius: "11px",
              background: "rgba(255,255,255,0.08)",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </div>
      </div>,
      document.body
    );
  }

  // =================================================
  // EXISTING COMPLETED RECEIPT — PRESERVED
  // =================================================
  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt"
      size="lg"
      footer={
        <>
          {/* Show Close button ONLY after it's been printed */}
          {hasPrinted && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => void handlePrintAction()}
            disabled={!receipt || isPrinting}
          >
            {isPrinting 
              ? "Sending to printer..." 
              : hasPrinted 
                ? "Reprint receipt" 
                : "Print receipt"}
          </Button>
        </>
      }
    >
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
        />
      )}
    </PopupModal>
  );
}

export default BillingReceiptModal;