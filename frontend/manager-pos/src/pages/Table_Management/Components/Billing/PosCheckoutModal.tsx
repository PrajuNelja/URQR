
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
} from "@urqr/types";

import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { SelectableGroup } from "../../../../components/Header/SelectableGroup";
import { CashAmountInput } from "../../../../components/Payment/CashAmountInput";
import { ChangeSummary } from "../../../../components/Payment/ChangeSummary";

import {
  formatINR,
  parseINRToPaise,
} from "../../../../lib/money";

import { PAYMENT_METHODS } from "../../Config/billing.config";
import type { PaymentMethod } from "../../Types/billing.types";

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  total: number;
  orderId?: string | number;
  initialMode?: PaymentMethod;
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

export function PosCheckoutModal({
  isOpen,
  onClose,
  total,
  orderId,
  isSubmitting = false,
  onConfirmPayment,
}: PosCheckoutModalProps) {
  // Cash is the default payment method
  const [method, setMethod] =
    useState<PaymentMethod>("Cash");

  // Initial cash amount is zero
  const [cashReceived, setCashReceived] =
    useState("0.00");

  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const submittingRef = useRef(false);

  // Reset Cash / UPI states when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setMethod("Cash");
    setCashReceived("0.00");
    setError("");
    setProcessing(false);

    submittingRef.current = false;
  }, [isOpen]);

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
    method === "Cash" &&
    payablePaise > 0 &&
    enoughCash &&
    !busy;

  // Confirm Cash demo payment
  const confirmCash = async () => {
    if (!canConfirm || submittingRef.current) {
      return;
    }

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
      // The parent callback handles demo checkout
      // and the reusable success notification.
      await onConfirmPayment(result.data);
    } catch {
      setError("Unable to complete payment.");
    } finally {
      submittingRef.current = false;
      setProcessing(false);
    }
  };

  // Handle payment method selection
  const changePaymentMethod = (value: string) => {
    if (
      value === "Cash" ||
      value === "UPI" ||
      value === "Others"
    ) {
      setMethod(value);
      setError("");
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
      title={
        method === "UPI"
          ? `Total Payable ${formatINR(payablePaise)}`
          : "Payment amount"
      }
      size="md"
      className="
        !min-w-0
        !max-w-md
        !h-[670px]
        !max-h-[calc(100dvh-32px)]
      "
    >
      {/* MAIN CONTENT
          20px bottom padding for Cash and UPI */}
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

        {/* 2. PAYMENT METHOD
            Aligned with other sections */}
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

          {/* REUSABLE SELECTABLE GROUP */}
          <SelectableGroup
            options={PAYMENT_METHODS}
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

              {/* CASH COLLECTED HEADER */}
              <div
                className="
                  mb-2 flex items-center
                  justify-between gap-3
                "
              >
                <h3 className="text-sm font-bold text-primary">
                  Cash Collected
                </h3>

                {/* REUSABLE CLEAR BUTTON */}
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

              {/* REUSABLE CASH INPUT
                  Includes +₹50, +₹100, +₹200 */}
              <CashAmountInput
                value={cashReceived}
                onChange={(value) => {
                  if (!busy) {
                    setCashReceived(value);
                    setError("");
                  }
                }}
              />

              {/* REUSABLE CHANGE SUMMARY */}
              <div className="mt-2">
                <ChangeSummary
                  amountDuePaise={payablePaise}
                  amountReceivedPaise={receivedPaise}
                />
              </div>
            </section>

            {/* AMOUNT TO PAY */}
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

            {/* INSUFFICIENT CASH WARNING */}
            {!enoughCash && (
              <p
                role="status"
                className="
                  shrink-0 text-[11px]
                  text-warning-text
                "
              >
                Amount received is less than
                the amount to pay.
              </p>
            )}

            {/* ERROR MESSAGE */}
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

            {/* REUSABLE CONFIRM BUTTON */}
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
                void confirmCash();
              }}
            >
              Confirm Cash Payment
            </Button>
          </>
        )}

        {/* 4. UPI PAYMENT
            Same modal height and bottom padding */}
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

              {/* DEMO QR */}
              <div className="rounded-md bg-white p-3">
                <DemoUpiQR />
              </div>

              {/* BORDERLESS PROVIDER LABELS */}
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

            {/* UPI BUTTON DISABLED UNTIL
                REAL PAYMENT INTEGRATION */}
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

            {/* UPI FOOTER */}
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

        {/* 5. OTHERS
            No payment functionality */}
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
