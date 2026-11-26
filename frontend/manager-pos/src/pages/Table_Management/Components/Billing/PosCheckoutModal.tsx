
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
  type PaymentMode,
} from "@urqr/types";

import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { InputField } from "../../../../components/InputField/InputField";
import { SelectableGroup } from "../../../../components/Header/SelectableGroup";

import { PAYMENT_METHODS } from "../../Config/billing.config";
import { formatINR } from "../../../../lib/money";

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;

  subtotal: number;
  tax: number;
  total: number;

  initialMode?: PaymentMode;
  isSubmitting?: boolean;

  onConfirmPayment: (
    checkout: CheckoutRequest
  ) => void;
}

export function PosCheckoutModal({
  isOpen,
  onClose,
  total,
  initialMode = "Cash",
  isSubmitting = false,
  onConfirmPayment,
}: PosCheckoutModalProps) {
  const [paymentMode, setPaymentMode] =
    useState<PaymentMode>(initialMode);

  const [cashCollected, setCashCollected] =
    useState("");

  const [error, setError] = useState("");

  const cashInputRef = useRef<HTMLInputElement>(null);

  // Reset the payment form each time it opens.
  useEffect(() => {
    if (!isOpen) return;

    setPaymentMode(initialMode);
    setCashCollected("");
    setError("");
  }, [isOpen, initialMode]);

  // Focus Cash Collected when Cash is selected.
  useEffect(() => {
    if (isOpen && paymentMode === "Cash") {
      cashInputRef.current?.focus();
    }
  }, [isOpen, paymentMode]);

  // Use integer paise for accurate calculations.
  const payablePaise = Number.isFinite(total)
    ? Math.max(0, Math.round(total * 100))
    : 0;

  const validAmount =
    /^\d{1,9}(?:\.\d{1,2})?$/.test(cashCollected);

  // Empty input represents ₹0 received.
  const receivedPaise = validAmount
    ? Math.round(Number(cashCollected) * 100)
    : 0;

  const sufficientCash =
    validAmount && receivedPaise >= payablePaise;

  const changePaise = Math.max(
    0,
    receivedPaise - payablePaise
  );

  const isCash = paymentMode === "Cash";

  const canComplete =
    !isSubmitting &&
    payablePaise > 0 &&
    (!isCash || sufficientCash);

  // Keep the shared checkout schema's Card value
  // while displaying "Others" in the UI.
  const handleMethodChange = (value: string) => {
    if (value === "Cash") {
      setPaymentMode("Cash");
    } else if (value === "UPI") {
      setPaymentMode("UPI");
    } else if (value === "Others") {
      setPaymentMode("Card");
    }

    setError("");
  };

  const handleCashChange = (
    value: string
  ) => {
    // Accept positive numbers with up to 2 decimals.
    if (
      value === "" ||
      /^\d{0,9}(?:\.\d{0,2})?$/.test(value)
    ) {
      setCashCollected(value);
      setError("");
    }
  };

  const handleCompletePayment = () => {
    if (!canComplete) {
      setError(
        "Enter the full cash amount before completing payment."
      );
      return;
    }

    const checkoutData = {
      paymentMode,
      payableAmount: payablePaise / 100,
      amountTendered: isCash
        ? receivedPaise / 100
        : payablePaise / 100,
      changeDue: isCash
        ? changePaise / 100
        : 0,
      notes: undefined,
    };

    // Validate through existing shared Zod schema.
    const result =
      CheckoutRequestSchema.safeParse(checkoutData);

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          "Invalid payment details."
      );
      return;
    }

    setError("");
    onConfirmPayment(result.data);
  };

  if (!isOpen) return null;

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment & Checkout"
      size="lg"
    >
      <form
        className="w-full min-w-0 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          handleCompletePayment();
        }}
      >
        {/* ================================
            1. SELECT PAYMENT METHOD
        ================================ */}

        <section className="w-full space-y-3">
          <h3
            className="
              text-xs font-bold
              uppercase tracking-widest
              text-text-secondary
            "
          >
            Select Payment Method
          </h3>

          {/* EXISTING REUSABLE SELECTABLE GROUP */}
          <SelectableGroup
            options={PAYMENT_METHODS}
            value={
              paymentMode === "Card"
                ? "Others"
                : paymentMode
            }
            onChange={handleMethodChange}
            className="w-full"
          />
        </section>

        {/* ================================
            2. CASH COLLECTED
        ================================ */}

        {isCash && (
          <section className="w-full space-y-3">
            <h3
              className="
                text-xs font-bold
                uppercase tracking-widest
                text-text-secondary px-4
              "
            >
              Cash Collected
            </h3>

            {/* EXISTING REUSABLE INPUT FIELD */}
            <InputField
              ref={cashInputRef}
              id="billing-cash-collected"
              type="text"
              inputMode="decimal"
              fieldSize="lg"
              value={cashCollected}
              onChange={(event) =>
                handleCashChange(
                  event.target.value
                )
              }
              placeholder="Amount received from customer"
              aria-label="Cash received from customer"
              autoComplete="off"
              fullWidth
            />

            {/* CHANGE TO RETURN */}
            <div
              className="
                flex w-full items-center
                justify-between gap-3
                pt-1 text-sm
              "
            >
              <span className="text-text-secondary">
                Change to return
              </span>

              <strong
                className={
                  sufficientCash
                    ? "font-semibold text-success-text"
                    : "font-semibold text-text-secondary"
                }
                aria-live="polite"
              >
                {sufficientCash
                  ? formatINR(changePaise)
                  : "—"}
              </strong>
            </div>

            {validAmount &&
              receivedPaise < payablePaise && (
                <p
                  className="text-xs text-error-text"
                  role="status"
                >
                  Remaining amount:{" "}
                  {formatINR(
                    payablePaise - receivedPaise
                  )}
                </p>
              )}
          </section>
        )}

        {/* ================================
            3. UPI / OTHER INFORMATION
        ================================ */}

        {!isCash && (
          <section
            className="
              rounded-lg border
              border-border-subtle
              bg-surface-alt p-4
              text-sm text-text-secondary
            "
          >
            <p>
              {paymentMode === "UPI"
                ? "UPI payment selected."
                : "Other payment selected."}
            </p>

            <p className="mt-2 font-semibold text-text">
              Amount payable:{" "}
              {formatINR(payablePaise)}
            </p>
          </section>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <p
            className="text-sm text-error-text"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* ================================
            4. COMPLETE PAYMENT
        ================================ */}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={!canComplete}
          className="w-full min-h-12 mb-6"
        >
          COMPLETE PAYMENT (
          {formatINR(payablePaise)})
        </Button>
      </form>
    </PopupModal>
  );
}

export default PosCheckoutModal;
