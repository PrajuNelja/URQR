import React, { useState } from "react";
import { PopupModal } from "../PopupModal/PopupModal";
import { Button } from "../Buttons/Button";
import { NumericKeypad } from "./NumericKeypad";

export interface NumericKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  initialValue?: string | number;
  currencyPrefix?: string;
  unitSuffix?: string;
  maxLimit?: number;
  minLimit?: number;
  quickPresets?: number[];
  onConfirm: (numericValue: number, rawString: string) => void;
}

/**
 * NumericKeypadModal — Reusable POS touch modal primitive using Radix UI accessible dialog foundations.
 * Allows rapid cash tendering, quantity modification, and price adjustment with minimum 64x64px touch targets.
 */
export const NumericKeypadModal: React.FC<NumericKeypadModalProps> = ({
  isOpen,
  onClose,
  title = "Enter Amount / Quantity",
  subtitle,
  initialValue = "",
  currencyPrefix = "₹",
  unitSuffix = "",
  maxLimit = 99999,
  minLimit = 0,
  quickPresets = [10, 50, 100, 500],
  onConfirm,
}) => {
  const [prevInitial, setPrevInitial] = useState({ isOpen, initialValue });
  const [displayValue, setDisplayValue] = useState<string>(
    initialValue ? String(initialValue) : ""
  );
  const [error, setError] = useState<string | null>(null);

  if (prevInitial.isOpen !== isOpen || prevInitial.initialValue !== initialValue) {
    setPrevInitial({ isOpen, initialValue });
    if (isOpen) {
      setDisplayValue(initialValue ? String(initialValue) : "");
      setError(null);
    }
  }

  const handleDigit = (digit: string) => {
    setError(null);
    setDisplayValue((prev) => {
      // Prevent multiple decimals
      if (digit === "." && prev.includes(".")) return prev;
      if (prev === "0" && digit !== ".") return digit;

      const nextVal = prev + digit;
      const num = parseFloat(nextVal);
      if (!isNaN(num) && num > maxLimit) {
        setError(`Maximum limit is ${maxLimit}`);
        return prev;
      }
      return nextVal;
    });
  };

  const handleBackspace = () => {
    setError(null);
    setDisplayValue((prev) => (prev.length > 0 ? prev.slice(0, -1) : ""));
  };

  const handleClear = () => {
    setError(null);
    setDisplayValue("");
  };

  const handleAddPreset = (amount: number) => {
    setError(null);
    setDisplayValue((prev) => {
      const current = parseFloat(prev) || 0;
      const next = current + amount;
      if (next > maxLimit) {
        setError(`Maximum limit is ${maxLimit}`);
        return String(maxLimit);
      }
      return String(next);
    });
  };

  const handleConfirm = () => {
    const num = parseFloat(displayValue) || 0;
    if (num < minLimit) {
      setError(`Minimum value is ${minLimit}`);
      return;
    }
    if (num > maxLimit) {
      setError(`Maximum limit is ${maxLimit}`);
      return;
    }
    onConfirm(num, displayValue);
    onClose();
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      className="max-w-[440px]"
      footer={
        <div className="flex w-full items-center justify-between gap-3 pt-2">
          <Button variant="ghost" size="lg" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirm}
            className="flex-1 bg-[#2d241b] text-white hover:bg-[#433628] font-bold text-base"
          >
            Confirm
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {subtitle && (
          <p className="text-xs text-[#91816c] font-medium -mt-2">{subtitle}</p>
        )}

        {/* Readout Display Screen */}
        <div className="rounded-xl border border-[#e4d5bd] bg-[#fffaf2] p-4 text-right shadow-inner">
          <span className="block text-[11px] font-bold tracking-wider uppercase text-[#91816c] mb-1 text-left">
            Input Amount
          </span>
          <div className="flex items-baseline justify-end gap-1.5 font-mono text-3xl font-extrabold text-[#2d241b] tracking-tight">
            {currencyPrefix && <span className="text-xl text-[#a46714] font-serif">{currencyPrefix}</span>}
            <span className="truncate">{displayValue || "0"}</span>
            {unitSuffix && <span className="text-sm font-sans text-[#705e4b]">{unitSuffix}</span>}
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#b3402a] font-semibold text-center">{error}</p>
        )}

        {/* Quick Increment Preset Chips */}
        {quickPresets && quickPresets.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#91816c] shrink-0">
              Quick:
            </span>
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="shrink-0 rounded-lg border border-[#e4d5bd] bg-white px-3 py-1.5 text-xs font-bold text-[#705e4b] hover:bg-[#f5efe6] active:scale-95 transition-all"
              >
                +{currencyPrefix}{preset}
              </button>
            ))}
          </div>
        )}

        {/* 64x64px Touch Numeric Keypad */}
        <NumericKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />
      </div>
    </PopupModal>
  );
};

export default NumericKeypadModal;
