import React from "react";
import { Delete, RotateCcw } from "lucide-react";

export interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  showDecimal?: boolean;
  className?: string;
  buttonClassName?: string;
}

/**
 * NumericKeypad — POS touch-optimized numeric entry grid.
 * Adheres strictly to Manasa's master POS design guidelines:
 * - Minimum 64x64px touch targets (min-h-[64px] min-w-[64px]) to eliminate cashier input mistakes.
 * - Deep espresso (#2d241b) high-contrast text and warm tactile active press states.
 */
export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  showDecimal = true,
  className = "",
  buttonClassName = "",
}) => {
  const buttons = [
    { label: "1", type: "digit" },
    { label: "2", type: "digit" },
    { label: "3", type: "digit" },
    { label: "4", type: "digit" },
    { label: "5", type: "digit" },
    { label: "6", type: "digit" },
    { label: "7", type: "digit" },
    { label: "8", type: "digit" },
    { label: "9", type: "digit" },
    { label: "CLR", type: "clear", icon: RotateCcw },
    { label: "0", type: "digit" },
    { label: "DEL", type: "backspace", icon: Delete },
    { label: "00", type: "digit" },
    { label: showDecimal ? "." : "000", type: "digit" },
  ];

  return (
    <div
      className={`grid grid-cols-3 gap-3 p-4 bg-[#fbf8f2] rounded-2xl border border-[#e4d5bd] shadow-sm ${className}`}
      aria-label="Touch Numeric Keypad"
      role="group"
    >
      {buttons.slice(0, 9).map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={() => onDigit(btn.label)}
          className={`min-h-[64px] min-w-[64px] h-16 w-full flex items-center justify-center rounded-xl text-2xl font-bold bg-white text-[#2d241b] border border-[#dfcdb4] shadow-xs transition-all duration-100 select-none hover:bg-[#fcfaf6] active:scale-95 active:bg-[#e9ddcc] focus:outline-none focus:ring-2 focus:ring-[#a46714] ${buttonClassName}`}
          aria-label={`Digit ${btn.label}`}
        >
          {btn.label}
        </button>
      ))}

      {/* Row 4: CLR, 0, DEL */}
      <button
        type="button"
        onClick={onClear}
        className={`min-h-[64px] min-w-[64px] h-16 w-full flex items-center justify-center gap-1 rounded-xl text-base font-bold bg-[#f3eae0] text-[#705e4b] border border-[#dfcdb4] shadow-xs transition-all duration-100 select-none hover:bg-[#ebdccb] active:scale-95 active:bg-[#dfcdb4] focus:outline-none focus:ring-2 focus:ring-[#a46714] ${buttonClassName}`}
        aria-label="Clear input"
        title="Clear all"
      >
        <RotateCcw size={20} />
        <span className="text-xs">CLR</span>
      </button>

      <button
        type="button"
        onClick={() => onDigit("0")}
        className={`min-h-[64px] min-w-[64px] h-16 w-full flex items-center justify-center rounded-xl text-2xl font-bold bg-white text-[#2d241b] border border-[#dfcdb4] shadow-xs transition-all duration-100 select-none hover:bg-[#fcfaf6] active:scale-95 active:bg-[#e9ddcc] focus:outline-none focus:ring-2 focus:ring-[#a46714] ${buttonClassName}`}
        aria-label="Digit 0"
      >
        0
      </button>

      <button
        type="button"
        onClick={onBackspace}
        className={`min-h-[64px] min-w-[64px] h-16 w-full flex items-center justify-center gap-1 rounded-xl text-base font-bold bg-[#fbe7e5] text-[#b3402a] border border-[#f5c2be] shadow-xs transition-all duration-100 select-none hover:bg-[#f7d6d3] active:scale-95 active:bg-[#f0b5b0] focus:outline-none focus:ring-2 focus:ring-[#b3402a] ${buttonClassName}`}
        aria-label="Backspace"
        title="Delete last digit"
      >
        <Delete size={20} />
        <span className="text-xs">DEL</span>
      </button>

      {/* Row 5: 00, Decimal (.), Confirm / Custom */}
      <button
        type="button"
        onClick={() => onDigit("00")}
        className={`min-h-[64px] min-w-[64px] h-16 w-full flex items-center justify-center rounded-xl text-xl font-bold bg-white text-[#2d241b] border border-[#dfcdb4] shadow-xs transition-all duration-100 select-none hover:bg-[#fcfaf6] active:scale-95 active:bg-[#e9ddcc] focus:outline-none focus:ring-2 focus:ring-[#a46714] ${buttonClassName}`}
        aria-label="Double zero"
      >
        00
      </button>

      <button
        type="button"
        onClick={() => onDigit(".")}
        className={`min-h-[64px] min-w-[64px] h-16 w-full flex items-center justify-center rounded-xl text-2xl font-bold bg-white text-[#2d241b] border border-[#dfcdb4] shadow-xs transition-all duration-100 select-none hover:bg-[#fcfaf6] active:scale-95 active:bg-[#e9ddcc] focus:outline-none focus:ring-2 focus:ring-[#a46714] ${buttonClassName}`}
        aria-label="Decimal point"
      >
        .
      </button>

      <button
        type="button"
        onClick={() => onDigit("5")}
        className={`min-h-[64px] min-w-[64px] h-16 w-full flex items-center justify-center rounded-xl text-sm font-bold bg-[#f3efe8] text-[#705e4b] border border-[#dfcdb4] shadow-xs transition-all duration-100 select-none hover:bg-[#ebdccb] active:scale-95 active:bg-[#dfcdb4] focus:outline-none focus:ring-2 focus:ring-[#a46714] ${buttonClassName}`}
        aria-label="Plus 5 quick increment"
      >
        +5
      </button>
    </div>
  );
};

export default NumericKeypad;
