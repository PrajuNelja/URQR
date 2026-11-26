import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 15,
  size = "md",
  disabled = false,
  className = "",
}: QuantityStepperProps) => {
  const [prevValue, setPrevValue] = useState(value);
  const [localInput, setLocalInput] = useState<string>(String(value));

  // Keep internal input in sync if the parent changes the value externally
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalInput(String(value));
  }

  // Determine if buttons should be disabled
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;
  const btnSizeClass = size === "sm" ? "p-0.5" : "p-1";

  const handleDecrease = () => {
    if (canDecrease) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Allow user to clear the input temporarily
    if (raw === "") {
      setLocalInput("");
      return;
    }

    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(parsed, max));
      setLocalInput(String(clamped));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    // If they leave it empty or type invalid, reset to min
    if (localInput === "" || isNaN(parseInt(localInput, 10))) {
      setLocalInput(String(min));
      onChange(min);
    } else {
      // Ensure it's clamped correctly on blur
      const parsed = parseInt(localInput, 10);
      const clamped = Math.max(min, Math.min(parsed, max));
      setLocalInput(String(clamped));
      onChange(clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrease();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrease();
    }
  };

  return (
    <div
      role="group"
      aria-label="Quantity"
      className={`flex items-center gap-1 ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {/* Minus Button */}
      <button
        type="button"
        className={`flex items-center justify-center rounded ${btnSizeClass} hover:bg-[#e9ddcc] transition-colors disabled:opacity-30 disabled:pointer-events-none`}
        aria-label="Decrease quantity"
        onClick={handleDecrease}
        disabled={!canDecrease}
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>

      {/* Input Field */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localInput}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        disabled={disabled}
        className="w-10 text-center rounded border border-transparent bg-transparent font-bold text-[#2d241b] focus:border-[#a46714] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a46714] transition-all"
        aria-label="Item quantity"
      />

      {/* Plus Button */}
      <button
        type="button"
        className={`flex items-center justify-center rounded ${btnSizeClass} hover:bg-[#e9ddcc] transition-colors disabled:opacity-30 disabled:pointer-events-none`}
        aria-label="Increase quantity"
        onClick={handleIncrease}
        disabled={!canIncrease}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};