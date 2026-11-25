
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Banknote,
  CreditCard,
  MoreHorizontal,
  QrCode,
} from "lucide-react";

import {
  CheckoutRequestSchema,
  type CheckoutRequest,
  type PaymentMode,
} from "@urqr/types";

import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { NumericKeypad } from "../../../../components/Keypad/NumericKeypad";

export interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  total: number;
  onConfirmPayment: (
    checkoutData: CheckoutRequest
  ) => void;
  initialMode?: PaymentMode;
  isSubmitting?: boolean;
}

// Payment options in the requested priority order.
// "Other" uses "Card" internally until the shared
// checkout schema supports additional methods.
const TENDER_OPTIONS = [
  {
    value: "Cash",
    label: "Cash",
    Icon: Banknote,
  },
  {
    value: "UPI",
    label: "UPI",
    Icon: QrCode,
  },
  {
    value: "Card",
    label: "Other",
    Icon: MoreHorizontal,
  },
] as const;

const validCashInput = (value: string) =>
  /^\d{0,9}(?:\.\d{0,2})?$/.test(value);

export function PosCheckoutModal({
  isOpen,
  onClose,
  subtotal,
  tax,
  total,
  onConfirmPayment,
  isSubmitting = false,
}: PosCheckoutModalProps) {
  const [paymentMode, setPaymentMode] =
    useState<PaymentMode>("Cash");

  // Cash always starts from zero.
  const [cashInput, setCashInput] = useState("0");

  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset whenever checkout opens.
  useEffect(() => {
    if (!isOpen) return;

    setPaymentMode("Cash");
    setCashInput("0");
    setNotes("");
    setError(null);
  }, [isOpen]);

  // Integer paise calculations prevent
  // floating-point change errors.
  const payablePaise = Math.round(total * 100);

  const receivedPaise = useMemo(() => {
    const amount = Number(cashInput || "0");

    if (!Number.isFinite(amount) || amount < 0) {
      return 0;
    }

    return Math.round(amount * 100);
  }, [cashInput]);

  const differencePaise =
    receivedPaise - payablePaise;

  const isCash = paymentMode === "Cash";

  const canConfirm =
    !isSubmitting &&
    payablePaise > 0 &&
    (!isCash || receivedPaise >= payablePaise);

  // Accept only positive decimal amounts
  // with up to two decimal places.
  const changeCash = (value: string) => {
    if (!validCashInput(value)) return;

    setCashInput(value);
    setError(null);
  };

  // Reusable numeric keypad input.
  const handleDigit = (digit: string) => {
    setCashInput((previous) => {
      if (digit === ".") {
        if (previous.includes(".")) {
          return previous;
        }

        return `${previous || "0"}.`;
      }

      const next =
        previous === "0"
          ? digit === "00"
            ? "0"
            : digit
          : previous + digit;

      return validCashInput(next)
        ? next
        : previous;
    });

    setError(null);
  };

  const handleBackspace = () => {
    setCashInput(
      (previous) => previous.slice(0, -1) || "0"
    );

    setError(null);
  };

  // Validate the payment details before
  // calling the existing checkout callback.
  const handleConfirm = useCallback(() => {
    if (!canConfirm) {
      setError(
        "Enter the full cash amount before confirming."
      );
      return;
    }

    const request = {
      paymentMode,
      payableAmount: payablePaise / 100,
      amountTendered: isCash
        ? receivedPaise / 100
        : payablePaise / 100,
      changeDue: isCash
        ? Math.max(0, differencePaise) / 100
        : 0,
      notes: notes.trim() || undefined,
    };

    const result =
      CheckoutRequestSchema.safeParse(request);

    if (!result.success) {
      setError(
        result.error.issues[0]?.message ??
          "Invalid checkout details."
      );
      return;
    }

    setError(null);
    onConfirmPayment(result.data);
  }, [
    canConfirm,
    paymentMode,
    payablePaise,
    isCash,
    receivedPaise,
    differencePaise,
    notes,
    onConfirmPayment,
  ]);

  // Enter confirms, without triggering a
  // button twice when that button has focus.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.isComposing
      ) {
        return;
      }

      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button")
      ) {
        return;
      }

      event.preventDefault();

      if (canConfirm) {
        handleConfirm();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, canConfirm, handleConfirm]);

  if (!isOpen) return null;

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Checkout & Tender"
      size="lg"
      className="max-w-[760px] p-0"
      footer={
        <div className="flex w-full items-center gap-3">
          <Button
            variant="ghost"
            size="lg"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel (Esc)
          </Button>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="!bg-[#49382E] !text-white disabled:!bg-[#D9CDB8]"
          >
            {isSubmitting
              ? "Processing..."
              : "Confirm & Print Receipt (Enter)"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 text-[#49382E] md:grid-cols-12">

        {/* LEFT: BILL AND TENDER OPTIONS */}
        <div className="flex flex-col gap-6 md:col-span-5 md:border-r md:border-[#E4D8C3] md:pr-4">

          {/* BILL SUMMARY */}
          <div className="rounded-xl border border-[#E4D8C3] bg-[#FFFDF8] p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
              Bill Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span>Subtotal</span>
                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between gap-3">
                <span>GST (5%)</span>
                <strong>
                  ₹{tax.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between gap-3 border-t border-dashed border-[#E4D8C3] pt-3 text-lg font-bold">
                <span>Payable Total</span>
                <strong>
                  ₹{total.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          {/* TENDER OPTIONS */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
              Select Tender Option
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {TENDER_OPTIONS.map(
                ({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={paymentMode === value}
                    onClick={() => {
                      setPaymentMode(value);
                      setError(null);
                    }}
                    className={`flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${
                      paymentMode === value
                        ? "border-[#49382E] bg-[#49382E] text-white"
                        : "border-[#E4D8C3] bg-white text-[#49382E] hover:bg-[#FAF3E6]"
                    }`}
                  >
                    <Icon
                      size={20}
                      aria-hidden="true"
                    />

                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* EXISTING OPTIONAL RECEIPT NOTE */}
          <div className="mt-auto">
            <label
              htmlFor="pos-checkout-notes"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8B5E3C]"
            >
              Receipt / Order Note (Optional)
            </label>

            <input
              id="pos-checkout-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="e.g., Table 4, split bill..."
              className="w-full rounded-lg border border-[#E4D8C3] bg-white px-3 py-2 text-sm outline-none focus:border-[#8B5E3C]"
            />
          </div>
        </div>

        {/* RIGHT: CASH OR DIGITAL PAYMENT */}
        <div className="min-w-0 space-y-4 md:col-span-7">

          {isCash ? (
            <>
              {/* CASH AMOUNT AND CHANGE */}
              <div className="grid grid-cols-2 gap-3">

                {/* EDITABLE CASH TENDERED */}
                <div className="rounded-xl border border-[#E4D8C3] bg-[#FFFDF8] p-3">
                  <label
                    htmlFor="pos-cash-tendered"
                    className="block text-xs font-bold uppercase text-[#8B5E3C]"
                  >
                    Cash Tendered
                  </label>

                  <div className="mt-2 flex items-center justify-end gap-1">
                    <span className="text-2xl font-bold">
                      ₹
                    </span>

                    <input
                      id="pos-cash-tendered"
                      type="text"
                      inputMode="decimal"
                      aria-label="Cash amount received"
                      value={cashInput}
                      onFocus={(event) =>
                        event.currentTarget.select()
                      }
                      onChange={(event) =>
                        changeCash(event.target.value)
                      }
                      onBlur={() => {
                        if (cashInput === "") {
                          setCashInput("0");
                        }
                      }}
                      className="w-full min-w-0 bg-transparent text-right font-mono text-2xl font-bold outline-none"
                    />
                  </div>
                </div>

                {/* CHANGE OR SHORT BALANCE */}
                <div
                  className={`rounded-xl border p-3 ${
                    differencePaise < 0
                      ? "border-[#F5C2BE] bg-[#FCEDEC] text-[#B3402A]"
                      : "border-[#B7DFBD] bg-[#EEF3E8] text-[#3F6B3A]"
                  }`}
                >
                  <span className="block text-xs font-bold uppercase">
                    {differencePaise < 0
                      ? "Short / Balance"
                      : "Change Due"}
                  </span>

                  <strong className="mt-2 block text-right font-mono text-2xl">
                    {differencePaise < 0
                      ? "−"
                      : ""}
                    ₹
                    {(
                      Math.abs(differencePaise) / 100
                    ).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* QUICK CASH AMOUNTS */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    changeCash(
                      (payablePaise / 100).toFixed(2)
                    )
                  }
                >
                  Exact (₹{total.toFixed(2)})
                </Button>

                {[50, 100, 200, 500].map(
                  (amount) => (
                    <Button
                      key={amount}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        changeCash(String(amount))
                      }
                    >
                      ₹{amount}
                    </Button>
                  )
                )}
              </div>

              {/* EXISTING REUSABLE KEYPAD */}
              <NumericKeypad
                onDigit={handleDigit}
                onBackspace={handleBackspace}
                onClear={() => changeCash("0")}
              />

              {!canConfirm && !isSubmitting && (
                <p
                  className="flex items-center gap-2 text-xs text-[#B3402A]"
                  role="status"
                >
                  <AlertCircle size={16} />
                  Cash tendered is less than the payable total.
                </p>
              )}
            </>
          ) : (
            /* UPI OR OTHER */
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-[#E4D8C3] bg-[#FFFDF8] p-6 text-center">

              {paymentMode === "UPI" ? (
                <QrCode size={44} />
              ) : (
                <CreditCard size={44} />
              )}

              <h3 className="text-lg font-bold">
                {paymentMode === "UPI"
                  ? "UPI Payment"
                  : "Other Payment"}
              </h3>

              <p className="text-sm text-[#7A6A5A]">
                {paymentMode === "UPI"
                  ? "Use your configured UPI payment process to collect payment."
                  : "Other currently uses the existing Card payment mode."}
              </p>

              <strong className="text-2xl">
                ₹{total.toFixed(2)}
              </strong>
            </div>
          )}

          {error && (
            <p
              className="flex items-center gap-2 text-sm text-[#B3402A]"
              role="alert"
            >
              <AlertCircle size={16} />
              {error}
            </p>
          )}
        </div>
      </div>
    </PopupModal>
  );
}

export default PosCheckoutModal;
