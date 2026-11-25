import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PopupModal } from "../../../../components/PopupModal/PopupModal";
import { Button } from "../../../../components/Buttons/Button";
import { NumericKeypad } from "../../../../components/Keypad/NumericKeypad";
import {
  Banknote,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  CheckoutRequestSchema,
  type PaymentMode,
  type CheckoutRequest,
} from "@urqr/types";

export interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  tax: number;
  total: number;
  onConfirmPayment: (checkoutData: CheckoutRequest) => void;
  initialMode?: PaymentMode;
  isSubmitting?: boolean;
}

/**
 * PosCheckoutModal — High-speed POS Checkout Modal for Cashier Counter operations.
 * - Supports Cash, Credit/Debit Card, and UPI tender options.
 * - Instant tender math, live Change Due calculation, and zero negative balance submission guard.
 * - Form state strictly validated against CheckoutRequestSchema (Zod).
 * - Keyboard shortcut listeners: Enter to confirm payment, Escape to dismiss.
 * - Fully responsive for both Web Browser and Tauri v2 Desktop (1366x768 to 1080p).
 */
export const PosCheckoutModal: React.FC<PosCheckoutModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  tax,
  total,
  onConfirmPayment,
  initialMode = "Cash",
  isSubmitting = false,
}) => {
  const [prevModalState, setPrevModalState] = useState({ isOpen, initialMode, total });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(initialMode);
  const [cashTenderedInput, setCashTenderedInput] = useState<string>(
    initialMode === "Cash" ? "" : String(total)
  );
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (
    prevModalState.isOpen !== isOpen ||
    prevModalState.initialMode !== initialMode ||
    prevModalState.total !== total
  ) {
    setPrevModalState({ isOpen, initialMode, total });
    if (isOpen) {
      setPaymentMode(initialMode);
      setCashTenderedInput(initialMode === "Cash" ? "" : String(total));
      setOrderNotes("");
      setValidationError(null);
    }
  }

  // Derived numeric amount tendered
  const amountTendered = useMemo(() => {
    if (paymentMode !== "Cash") return total;
    const parsed = parseFloat(cashTenderedInput);
    return isNaN(parsed) ? 0 : parsed;
  }, [paymentMode, cashTenderedInput, total]);

  // Instant Change Due calculation
  const changeDue = useMemo(() => {
    if (paymentMode !== "Cash") return 0;
    const diff = amountTendered - total;
    return Math.round(diff * 100) / 100;
  }, [paymentMode, amountTendered, total]);

  const isTenderSufficient = useMemo(() => {
    if (paymentMode !== "Cash") return true;
    return amountTendered >= total;
  }, [paymentMode, amountTendered, total]);

  // Quick tender chips (Exact, +50, +100, +500)
  const handleQuickTender = (tender: number) => {
    setValidationError(null);
    setCashTenderedInput(String(tender));
  };

  const handleKeypadDigit = (digit: string) => {
    setValidationError(null);
    setCashTenderedInput((prev) => {
      if (digit === "." && prev.includes(".")) return prev;
      if (prev === "0" && digit !== ".") return digit;
      return prev + digit;
    });
  };

  const handleKeypadBackspace = () => {
    setValidationError(null);
    setCashTenderedInput((prev) => (prev.length > 0 ? prev.slice(0, -1) : ""));
  };

  const handleKeypadClear = () => {
    setValidationError(null);
    setCashTenderedInput("");
  };

  // Submit and validate against Zod CheckoutRequestSchema
  const handleCheckoutSubmit = useCallback(() => {
    setValidationError(null);

    const payloadCandidate = {
      paymentMode,
      payableAmount: total,
      amountTendered: paymentMode === "Cash" ? amountTendered : total,
      changeDue: Math.max(0, changeDue),
      notes: orderNotes.trim() || undefined,
    };

    const parseResult = CheckoutRequestSchema.safeParse(payloadCandidate);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      setValidationError(issue?.message || "Invalid checkout payload.");
      return;
    }

    onConfirmPayment(parseResult.data);
  }, [paymentMode, total, amountTendered, changeDue, orderNotes, onConfirmPayment]);

  // Keyboard shortcut listeners (Enter to confirm, Escape handled by PopupModal)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (isTenderSufficient && !isSubmitting) {
          handleCheckoutSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isTenderSufficient, isSubmitting, handleCheckoutSubmit]);

  if (!isOpen) return null;

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Checkout & Tender"
      size="lg"
      className="max-w-[720px] p-0 overflow-hidden"
      footer={
        <div className="flex w-full items-center justify-between gap-3 pt-2">
          <Button variant="ghost" size="lg" onClick={onClose} disabled={isSubmitting}>
            Cancel (Esc)
          </Button>

          <Button
            variant="primary"
            size="lg"
            disabled={!isTenderSufficient || isSubmitting}
            onClick={handleCheckoutSubmit}
            className="flex-1 bg-[#2d241b] text-white hover:bg-[#433628] font-bold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Processing Tender..."
              : `Confirm & Print Receipt (Enter)`}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-1 text-[#2d241b]">
        {/* Left Column (5 cols): Order Totals & Tender Selector */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-[#e4d5bd] pr-0 md:pr-4">
          {/* Bill Summary */}
          <div className="rounded-xl border border-[#e4d5bd] bg-[#fffaf2] p-4 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#91816c] block mb-2">
              Bill Summary
            </span>
            <div className="space-y-1.5 text-xs text-[#705e4b]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2d241b]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold text-[#2d241b]">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-[#e4d5bd] pt-2 text-lg font-extrabold text-[#2d241b]">
                <span>Payable Total</span>
                <span className="text-[#a46714] font-serif">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Tender Mode Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#91816c] block mb-2">
              Select Tender Option
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: "Cash" as PaymentMode, label: "Cash", icon: Banknote },
                { mode: "Card" as PaymentMode, label: "Card", icon: CreditCard },
                { mode: "UPI" as PaymentMode, label: "UPI", icon: QrCode },
              ].map(({ mode, label, icon: Icon }) => {
                const isSelected = paymentMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setPaymentMode(mode);
                      setValidationError(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border font-bold text-xs transition-all ${
                      isSelected
                        ? "bg-[#2d241b] text-white border-[#2d241b] shadow-sm scale-102"
                        : "bg-white text-[#705e4b] border-[#e4d5bd] hover:bg-[#f5efe6]"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Notes Field */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#91816c] block mb-1">
              Receipt / Order Note (Optional)
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Table 4, split bill..."
              className="w-full text-xs rounded-lg border border-[#e4d5bd] bg-white px-3 py-2 outline-none focus:border-[#a46714]"
            />
          </div>
        </div>

        {/* Right Column (7 cols): Tender Display & Touch Keypad */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3">
          {paymentMode === "Cash" ? (
            <>
              {/* Cash Tendered & Change Due Readout Screen */}
              <div className="grid grid-cols-2 gap-3">
                {/* Amount Tendered Box */}
                <div className="rounded-xl border border-[#e4d5bd] bg-[#fffaf2] p-3 text-right shadow-inner">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#91816c] text-left">
                    Cash Tendered
                  </span>
                  <div className="font-mono text-2xl font-extrabold text-[#2d241b] truncate mt-0.5">
                    ₹{cashTenderedInput || "0"}
                  </div>
                </div>

                {/* Change Due Box */}
                <div
                  className={`rounded-xl border p-3 text-right shadow-inner transition-colors ${
                    changeDue >= 0
                      ? "bg-[#d9eedd]/40 border-[#b7dfbd] text-[#2f7a45]"
                      : "bg-[#fbd9d6]/40 border-[#f5c2be] text-[#b3402a]"
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-left">
                    {changeDue >= 0 ? "Change Due" : "Short / Balance"}
                  </span>
                  <div className="font-mono text-2xl font-extrabold truncate mt-0.5">
                    {changeDue >= 0 ? `₹${changeDue.toFixed(2)}` : `-₹${Math.abs(changeDue).toFixed(2)}`}
                  </div>
                </div>
              </div>

              {/* Zero Negative Balance Guard Alert */}
              {!isTenderSufficient && cashTenderedInput !== "" && (
                <div className="flex items-center gap-1.5 text-xs text-[#b3402a] font-semibold bg-[#fbd9d6]/50 p-2 rounded-lg border border-[#f5c2be]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>Insufficient cash tendered. Negative balance submission prevented.</span>
                </div>
              )}

              {validationError && (
                <div className="flex items-center gap-1.5 text-xs text-[#b3402a] font-semibold bg-[#fbd9d6]/50 p-2 rounded-lg border border-[#f5c2be]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Quick Cash Presets */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => handleQuickTender(total)}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2d241b] bg-[#2d241b] text-white text-xs font-bold shadow-xs hover:bg-[#433628]"
                >
                  Exact (₹{total.toFixed(2)})
                </button>
                {[50, 100, 200, 500, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickTender(amt)}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg border border-[#e4d5bd] bg-white text-[#705e4b] text-xs font-bold hover:bg-[#f5efe6]"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* 64x64px Touch Numeric Keypad */}
              <NumericKeypad
                onDigit={handleKeypadDigit}
                onBackspace={handleKeypadBackspace}
                onClear={handleKeypadClear}
              />
            </>
          ) : (
            /* Card / UPI Instant Direct Tender View */
            <div className="h-full flex flex-col items-center justify-center p-6 text-center rounded-xl border border-[#e4d5bd] bg-[#fffaf2]">
              {paymentMode === "Card" ? (
                <>
                  <CreditCard size={48} className="text-[#a46714] mb-3" />
                  <h4 className="font-serif text-lg font-bold">Credit / Debit Card Terminal</h4>
                  <p className="text-xs text-[#705e4b] mt-1 max-w-xs">
                    Swipe, tap, or insert customer card on external payment EDC terminal.
                  </p>
                </>
              ) : (
                <>
                  <QrCode size={48} className="text-[#a46714] mb-3" />
                  <h4 className="font-serif text-lg font-bold">Dynamic UPI QR Payment</h4>
                  <p className="text-xs text-[#705e4b] mt-1 max-w-xs">
                    Customer scans counter dynamic UPI QR code with any UPI app.
                  </p>
                </>
              )}

              <div className="mt-5 rounded-lg bg-white border border-[#e4d5bd] px-6 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#91816c] block">
                  Amount to Authorize
                </span>
                <span className="font-serif text-2xl font-extrabold text-[#2d241b]">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#2f7a45] font-semibold mt-4">
                <CheckCircle2 size={16} />
                <span>Ready for 1-Tap instant authorization</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PopupModal>
  );
};

export default PosCheckoutModal;
