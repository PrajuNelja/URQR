import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, CreditCard, CheckCircle2 } from "lucide-react";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
  type PaymentMode,
} from "@urqr/types";

import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { SelectableGroup } from "../../../../components/Header/SelectableGroup";
import { CashAmountInput } from "../../../../components/Payment/CashAmountInput";
import { ChangeSummary } from "../../../../components/Payment/ChangeSummary";
import { NumericKeypad } from "../../../../components/Keypad/NumericKeypad";
import { useNotification } from "../../../../components/Notification/useNotification"; // <-- ADDED

import {
  formatINR,
  parseINRToPaise,
} from "../../../../lib/money";

import type { PaymentMethod } from "../../Types/billing.types";

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  total: number;
  orderId?: string | number;
  initialMode?: PaymentMethod | PaymentMode;
  isSubmitting?: boolean;
  onConfirmPayment:
    (checkout: CheckoutRequest) => void | Promise<void>;
}

// Demo QR only — not valid for real payment
const DEMO_DOTS = Array.from(
  { length: 29 * 29 },
  (_, index) => ({
    x: index % 29,
    y: Math.floor(index / 29),
  })
).filter(({ x, y }) => {
  const finder =
    (x < 9 && y < 9) ||
    (x > 19 && y < 9) ||
    (x < 9 && y > 19);

  return (
    !finder &&
    (x * 17 + y * 23 + x * y * 3) % 9 < 4
  );
});

function DemoUpiQR() {
  return (
    <svg
      viewBox="0 0 37 37"
      width="172"
      height="172"
      role="img"
      aria-label="Demo QR illustration, not valid for payment"
      className="block max-w-full bg-white"
    >
      <rect
        width="37"
        height="37"
        fill="white"
      />

      <g transform="translate(4 4)">
        {DEMO_DOTS.map(({ x, y }) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="1"
            height="1"
            fill="#111B2E"
          />
        ))}

        {[
          [0, 0],
          [22, 0],
          [0, 22],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect
              x={x}
              y={y}
              width="7"
              height="7"
              fill="#111B2E"
            />

            <rect
              x={x + 1}
              y={y + 1}
              width="5"
              height="5"
              fill="white"
            />

            <rect
              x={x + 2}
              y={y + 2}
              width="3"
              height="3"
              fill="#111B2E"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

type LocalPaymentMode = PaymentMode | "Others";

export function PosCheckoutModal({
  isOpen,
  onClose,
  total,
  orderId,
  initialMode = "Cash",
  isSubmitting = false,
  onConfirmPayment,
}: PosCheckoutModalProps) {
  // ADDED TOAST HOOK
  const { error: toastError } = useNotification(); 

  // Payment mode state
  const [method, setMethod] =
    useState<LocalPaymentMode>((initialMode as LocalPaymentMode) || "Cash");

  // Initial cash amount is zero
  const [cashReceived, setCashReceived] =
    useState(initialMode === "Cash" ? "0.00" : String(total));

  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const submittingRef = useRef(false);

  // Reset Cash / UPI states when modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMethod((initialMode as PaymentMode) || "Cash");
      setCashReceived(initialMode === "Cash" ? "0.00" : String(total));
      setError("");
      setProcessing(false);
    }
  }

  // Work in integer paise
  const payablePaise = Number.isFinite(total)
    ? Math.max(0, Math.round(total * 100))
    : 0;

  const receivedPaise =
    parseINRToPaise(cashReceived);

  const enoughCash =
    receivedPaise !== null &&
    receivedPaise >= payablePaise;

  const busy = processing || isSubmitting;

  const canConfirm =
    method === "Cash"
      ? payablePaise > 0 && enoughCash && !busy
      : !busy;

  // Confirm demo payment
  const confirmPayment = useCallback(async () => {
    if (submittingRef.current || busy) {
      return;
    }

    if (method === "Cash") {
      if (!canConfirm) return;
      const amountTendered = receivedPaise ?? 0;

      const result = CheckoutRequestSchema.safeParse({
        paymentMode: "Cash",
        payableAmount: payablePaise / 100,
        amountTendered: amountTendered / 100,
        changeDue:
          Math.max(
            0,
            amountTendered - payablePaise
          ) / 100,
      });

      if (!result.success) {
        setError("Invalid cash payment details.");
        return;
      }

      submittingRef.current = true;
      setProcessing(true);
      setError("");

      try {
        await onConfirmPayment(result.data);
      } catch {
        setError("Unable to complete payment.");
        // ADDED TOAST TRIGGER HERE
        toastError("Payment gateway timeout. Please try again or check network.");
      } finally {
        submittingRef.current = false;
        setProcessing(false);
      }
    } else {
      const mode = method === "Card" ? "Card" : method === "UPI" ? "UPI" : "Others";
      const result = CheckoutRequestSchema.safeParse({
        paymentMode: mode,
        payableAmount: payablePaise / 100,
        amountTendered: payablePaise / 100,
        changeDue: 0,
      });

      if (!result.success) return;

      submittingRef.current = true;
      setProcessing(true);
      setError("");

      try {
        await onConfirmPayment(result.data);
      } catch {
        setError("Unable to complete payment.");
        // ADDED TOAST TRIGGER HERE
        toastError("Payment gateway rejected the transaction.");
      } finally {
        submittingRef.current = false;
        setProcessing(false);
      }
    }
  }, [busy, canConfirm, method, onConfirmPayment, payablePaise, receivedPaise, toastError]); // <-- Added toastError to deps

  // Keyboard shortcut listener: Enter to confirm
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void confirmPayment();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, confirmPayment]);

  // Handle payment method selection
  const changePaymentMethod = (value: string) => {
    if (
      value === "Cash" ||
      value === "Card" ||
      value === "UPI" ||
      value === "Others"
    ) {
      setMethod(value as LocalPaymentMode);
      setError("");
      if (value !== "Cash") {
        setCashReceived(total.toFixed(2));
      }
    }
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={() => {
        if (!busy) onClose();
      }}
      closeOnEscape={!busy}
      closeOnBackdrop={!busy}
      title="POS Checkout & Tender"
      size="md"
      className="
        !min-w-0
        !max-w-md
        !h-[670px]
        !max-h-[calc(100dvh-32px)]
      "
    >
      <div
        className="
          flex h-full min-h-0
          w-full min-w-0
          flex-col gap-3
          pb-5
        "
      >
        {/* 1. ENTER TOTAL AMOUNT */}
        {method === "Cash" && (
          <section className="w-full min-w-0 shrink-0 space-y-1">
            <label
              className="
                block text-xs font-bold
                uppercase tracking-wide
                text-primary
              "
            >
              Enter Total Amount
            </label>

            <div
              className="
                flex min-h-10 w-full
                items-center rounded-md
                border border-border-subtle
                bg-surface-alt px-3
                font-bold text-primary
              "
              aria-label="Total payable, read only"
            >
              {formatINR(payablePaise)}
            </div>

            <p className="text-[11px] text-text-muted">
              {orderId !== undefined
                ? `Order #${orderId} · `
                : ""}
              Same payable total · Read-only
            </p>
          </section>
        )}

        {/* 2. PAYMENT METHOD */}
        <section
          className="
            w-full min-w-0 shrink-0
            pt-3 pb-3
          "
        >
          <h3
            className="
              mb-2 text-xs font-bold
              uppercase tracking-wide
              text-primary
            "
          >
            Payment Method
          </h3>

          <SelectableGroup
            options={[
              { value: "Cash", label: "Cash" },
              { value: "Card", label: "Card" },
              { value: "UPI", label: "UPI" },
              { value: "Others", label: "Others" },
            ]}
            value={method}
            onChange={changePaymentMethod}
            className="
              !my-0 w-full
              [&>button]:!min-h-9
              [&>button]:!py-2
            "
          />
        </section>

        {/* 3. CASH PAYMENT */}
        {method === "Cash" && (
          <>
            <section
              className="
                w-full min-w-0 shrink-0
                rounded-lg border
                border-border-subtle
                bg-surface-alt p-3

                [&_.pos-cash-input__field]:!h-10
                [&_.pos-cash-input__quick]:!mt-2
                [&_.pos-cash-input__quick]:!gap-2
                [&_.pos-cash-input__button]:!min-h-9
                [&_.pos-change-summary]:!min-h-[54px]
                [&_.pos-change-summary]:!p-2
                [&_.pos-change-summary_strong]:!text-xl
              "
            >
              <div
                className="
                  mb-2 flex items-center
                  justify-between gap-3
                "
              >
                <h3 className="text-sm font-bold text-primary">
                  Cash Collected
                </h3>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    setCashReceived("0.00");
                    setError("");
                  }}
                >
                  Clear
                </Button>
              </div>

              <CashAmountInput
                value={cashReceived}
                onChange={(value) => {
                  if (!busy) {
                    setCashReceived(value);
                    setError("");
                  }
                }}
              />

              <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-2">
                <button
                  type="button"
                  onClick={() => setCashReceived((payablePaise / 100).toFixed(2))}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2d241b] bg-[#2d241b] text-white text-xs font-bold hover:bg-[#433628]"
                >
                  Exact (₹{(payablePaise / 100).toFixed(2)})
                </button>
                {[50, 100, 200, 500, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashReceived(amt.toFixed(2))}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg border border-[#e4d5bd] bg-white text-[#705e4b] text-xs font-bold hover:bg-[#f5efe6]"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="mt-2 scale-90 origin-top">
                <NumericKeypad
                  onDigit={(d) => {
                    setCashReceived((prev) => {
                      if (prev === "0.00" || prev === "0") return d;
                      return prev + d;
                    });
                  }}
                  onBackspace={() => {
                    setCashReceived((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
                  }}
                  onClear={() => setCashReceived("0.00")}
                />
              </div>

              <div className="mt-2">
                <div className="text-xs font-bold text-primary mb-1">
                  Change Due
                </div>
                <ChangeSummary
                  amountDuePaise={payablePaise}
                  amountReceivedPaise={receivedPaise}
                />
              </div>
            </section>

            <div
              className="
                flex w-full shrink-0
                items-center justify-between gap-3
              "
            >
              <span
                className="
                  text-sm font-semibold text-primary
                "
              >
                Amount to pay
              </span>

              <strong
                className="
                  whitespace-nowrap
                  text-xl font-bold text-primary
                "
              >
                {formatINR(payablePaise)}
              </strong>
            </div>

            {!enoughCash && (
              <p
                role="status"
                className="
                  shrink-0 text-[11px]
                  text-warning-text
                "
              >
                Insufficient cash tendered. Negative balance submission prevented.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="
                  shrink-0 text-xs text-error-text
                "
              >
                {error}
              </p>
            )}

            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              isLoading={busy}
              disabled={!canConfirm}
              className="
                mt-auto !min-h-10
                shrink-0
              "
              onClick={() => {
                void confirmPayment();
              }}
            >
              Confirm & Print Receipt (Enter)
            </Button>
          </>
        )}

        {/* 4. CARD PAYMENT */}
        {method === "Card" && (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-border-subtle bg-surface-alt flex-1 gap-3">
            <CreditCard size={48} className="text-primary mb-2" />
            <h4 className="font-sans text-base font-bold text-primary">Card Payment EDC Terminal</h4>
            <p className="text-xs text-text-muted max-w-xs">
              Swipe, tap, or insert customer card on external terminal.
            </p>
            <div className="rounded-lg bg-surface border border-border-subtle px-6 py-2 mt-2">
              <span className="text-xs font-bold text-primary">{formatINR(payablePaise)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#2f7a45] font-semibold mt-2">
              <CheckCircle2 size={16} />
              <span>Ready for 1-Tap instant authorization</span>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              isLoading={busy}
              className="mt-auto !min-h-10 shrink-0"
              onClick={() => void confirmPayment()}
            >
              Confirm & Print Receipt (Enter)
            </Button>
          </div>
        )}

        {/* 5. UPI PAYMENT */}
        {method === "UPI" && (
          <>
            <section
              className="
                flex w-full min-h-0 flex-1
                flex-col items-center
                justify-center gap-3
                rounded-lg border
                border-border-subtle
                bg-surface-alt p-3
              "
            >
              <div className="rounded-md bg-white p-3">
                <DemoUpiQR />
              </div>

              <div
                className="
                  flex flex-wrap items-center
                  justify-center gap-x-4 gap-y-1
                "
              >
                {[
                  "GPay",
                  "PhonePe",
                  "Paytm",
                  "BHIM",
                ].map((provider) => (
                  <span
                    key={provider}
                    className="
                      text-[11px] font-medium
                      text-text-muted
                    "
                  >
                    {provider}
                  </span>
                ))}
              </div>

              <p
                className="
                  text-center text-[11px]
                  text-text-muted
                "
              >
                Demo QR only — not valid for payment.
              </p>
            </section>

            <Button
              type="button"
              variant="primary"
              fullWidth
              disabled
              rightIcon={
                <ArrowRight size={15} />
              }
              className="
                !min-h-10 shrink-0
              "
            >
              COMPLETE PAYMENT (
              {formatINR(payablePaise)})
            </Button>

            <div
              className="
                flex shrink-0 items-center
                justify-center gap-1.5
                border-t border-border-subtle
                pt-2 text-center
                text-[10px] text-text-muted
              "
            >
              <Lock size={12} />

              <span>
                Demo mode · Payment verification unavailable
              </span>
            </div>
          </>
        )}

        {/* 5. OTHERS */}
        {method === "Others" && (
          <div
            className="
              flex w-full flex-1
              items-center justify-center
            "
          >
            <p className="text-sm text-text-muted">
              Others payment is not configured yet.
            </p>
          </div>
        )}
      </div>
    </PopupModal>
  );
}

export default PosCheckoutModal;