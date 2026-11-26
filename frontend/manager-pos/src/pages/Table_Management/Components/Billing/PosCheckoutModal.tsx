
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
  type PaymentMode,
} from "@urqr/types";

import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { InputField } from "../../../../components/InputField/InputField";
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
  initialMode?: PaymentMode;
  isSubmitting?: boolean;
  onConfirmPayment: (
    checkout: CheckoutRequest
  ) => void | Promise<void>;
}

// Decorative QR pattern for demo purposes only.
// It is NOT a real payment QR.
const DEMO_QR_DOTS = Array.from(
  { length: 29 * 29 },
  (_, index) => ({
    x: index % 29,
    y: Math.floor(index / 29),
  })
).filter(({ x, y }) => {
  const insideFinder =
    (x < 9 && y < 9) ||
    (x > 19 && y < 9) ||
    (x < 9 && y > 19);

  return (
    !insideFinder &&
    (x * 17 + y * 23 + x * y * 3) % 9 < 4
  );
});

function DemoUpiQR() {
  return (
    <svg
      viewBox="0 0 37 37"
      width="196"
      height="196"
      role="img"
      aria-label="Demo QR illustration. Not valid for payment."
      className="block max-w-full bg-white"
    >
      <rect width="37" height="37" fill="white" />

      <g transform="translate(4 4)">
        {DEMO_QR_DOTS.map(({ x, y }) => (
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
  const [method, setMethod] =
    useState<PaymentMethod>("Cash");

  const [cashReceived, setCashReceived] =
    useState("0.00");

  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const submittingRef = useRef(false);

  // Default to Cash whenever the modal opens.
  useEffect(() => {
    if (!isOpen) return;

    setMethod("Cash");
    setCashReceived("0.00");
    setError("");
    setProcessing(false);
    submittingRef.current = false;
  }, [isOpen]);

  const payablePaise =
    Number.isFinite(total)
      ? Math.max(0, Math.round(total * 100))
      : 0;

  const receivedPaise =
    parseINRToPaise(cashReceived);

  const enoughCash =
    receivedPaise !== null &&
    receivedPaise >= payablePaise;

  const changePaise =
    receivedPaise === null
      ? 0
      : Math.max(
          0,
          receivedPaise - payablePaise
        );

  const busy = processing || isSubmitting;

  const canConfirm =
    method === "Cash" &&
    payablePaise > 0 &&
    enoughCash &&
    !busy;

  const changeMethod = (value: string) => {
    if (
      value !== "Cash" &&
      value !== "UPI" &&
      value !== "Others"
    ) {
      return;
    }

    setMethod(value);
    setError("");
  };

  const confirmCashPayment = async () => {
    if (!canConfirm || submittingRef.current) {
      return;
    }

    const candidate = {
      paymentMode: "Cash" as PaymentMode,
      payableAmount: payablePaise / 100,
      amountTendered:
        (receivedPaise ?? 0) / 100,
      changeDue: changePaise / 100,
    };

    const result =
      CheckoutRequestSchema.safeParse(candidate);

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          "Invalid cash payment."
      );
      return;
    }

    submittingRef.current = true;
    setProcessing(true);
    setError("");

    try {
      // Parent handles demo checkout and
      // reusable payment-success notification.
      await onConfirmPayment(result.data);
    } catch {
      setError("Unable to complete payment.");
    } finally {
      submittingRef.current = false;
      setProcessing(false);
    }
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      title={
        method === "UPI"
          ? `Total Payable ${formatINR(payablePaise)}`
          : "Payment amount"
      }
      size={method === "UPI" ? "lg" : "md"}
      className="!min-w-0"
    >
      <div className="flex w-full min-w-0 flex-col gap-5">

        {/* READ-ONLY TOTAL FOR CASH */}
        {method === "Cash" && (
          <InputField
            label="Enter Total Amount"
            type="text"
            readOnly
            value={formatINR(payablePaise)}
            hint={
              orderId !== undefined
                ? `Order #${orderId} · Same payable total · Read-only`
                : "Same payable total · Read-only"
            }
            fieldSize="lg"
            className="bg-surface-alt font-bold text-lg"
          />
        )}

        {/* REUSABLE PAYMENT METHOD SELECTOR */}
        <section className="w-full space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Payment Method
          </h3>

          <SelectableGroup
            options={PAYMENT_METHODS}
            value={method}
            onChange={changeMethod}
            className="w-full"
          />
        </section>

        {/* CASH PAYMENT */}
        {method === "Cash" && (
          <>
            <section className="space-y-4 rounded-xl border border-border-subtle bg-surface-alt p-4">
              <div className="flex items-center justify-between gap-3">
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

              {/* EXISTING REUSABLE CASH INPUT
                  Includes +50, +100, +200 */}
              <CashAmountInput
                value={cashReceived}
                onChange={(value) => {
                  setCashReceived(value);
                  setError("");
                }}
                disabled={busy}
              />

              {/* EXISTING REUSABLE BALANCE UI */}
              <ChangeSummary
                amountDuePaise={payablePaise}
                amountReceivedPaise={receivedPaise}
              />
            </section>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-primary">
                Amount to pay
              </span>

              <strong className="whitespace-nowrap text-2xl font-bold text-primary">
                {formatINR(payablePaise)}
              </strong>
            </div>

            {!enoughCash && (
              <p
                role="status"
                className="text-xs text-warning-text"
              >
                Amount received is less than the
                amount to pay.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="text-sm text-error-text"
              >
                {error}
              </p>
            )}

            {/* REUSABLE CONFIRM BUTTON */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={busy}
              disabled={!canConfirm}
              onClick={() => {
                void confirmCashPayment();
              }}
            >
              Confirm Cash Payment
            </Button>
          </>
        )}

        {/* UPI DEMO QR */}
        {method === "UPI" && (
          <>
            <section className="flex w-full flex-col items-center gap-4 rounded-xl border border-border-subtle bg-surface-alt p-5">
              <div className="rounded-lg border border-border-subtle bg-white p-3">
                <DemoUpiQR />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "GPay",
                  "PhonePe",
                  "Paytm",
                  "BHIM",
                ].map((provider) => (
                  <span
                    key={provider}
                    className="rounded border border-border-subtle bg-white px-2 py-1 text-xs text-text-muted"
                  >
                    {provider}
                  </span>
                ))}
              </div>
            </section>

            <p
              role="status"
              className="text-center text-xs text-text-muted"
            >
              Demo QR only — no real payment
              can be made using this code.
            </p>

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              disabled
              rightIcon={
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              }
            >
              COMPLETE PAYMENT (
              {formatINR(payablePaise)})
            </Button>

            <div className="flex items-center justify-center gap-2 border-t border-border-subtle pt-4 text-xs text-text-muted">
              <Lock
                size={13}
                aria-hidden="true"
              />
              Payment verification unavailable in demo mode
            </div>
          </>
        )}

        {/* OTHERS:
            No payment functionality added yet. */}

      </div>
    </PopupModal>
  );
}

export default PosCheckoutModal;
