import React from "react";
import { Delete, RotateCcw } from "lucide-react";

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  className?: string;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onDigit,
  onBackspace,
  onClear,
  className = "",
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
  ];

  return (
    <div
      className={`grid grid-cols-3 gap-2.5 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm ${className}`}
      aria-label="Touch Numeric Keypad"
    >
      {buttons.map((btn, index) => {
        const isAction = btn.type !== "digit";
        const Icon = btn.icon;

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (btn.type === "digit") onDigit(btn.label);
              else if (btn.type === "backspace") onBackspace();
              else if (btn.type === "clear") onClear();
            }}
            className={`h-12 flex items-center justify-center rounded-xl text-lg font-semibold transition-all duration-150 select-none active:scale-95 ${
              isAction
                ? "bg-gray-200/70 hover:bg-gray-300 text-gray-700 active:bg-gray-400"
                : "bg-white hover:bg-gray-50 text-gray-900 shadow-sm border border-gray-200 active:bg-gray-100"
            }`}
          >
            {Icon ? <Icon size={18} /> : btn.label}
          </button>
        );
      })}
    </div>
  );
};

export default NumericKeypad;
