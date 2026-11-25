// src/components/DataTable/QuantityStepper.tsx

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { QuantityStepperProps } from "./DataTable.types";
import { quantityStepperConfig } from "./DataTable.config";

/**
 * QuantityStepper — cart quantity control (− [input] +).
 * Supports instant direct numeric typing and maximum limit safety:
 * - Direct editable numeric input for fast cashier bulk entry.
 * - Maximum limit safety enforcement (default max: 99).
 * - Minimum limit safety enforcement (default min: 1).
 *
 * <QuantityStepper value={2} onChange={(v) => setQty(v)} />
 * <QuantityStepper value={qty} onChange={...} min={1} max={99} size="sm" />
 */
export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  disabled = false,
  className = "",
}: QuantityStepperProps) => {
  const sizeStyles = quantityStepperConfig.sizes[size];
  const [prevValue, setPrevValue] = useState<number>(value);
  const [localInput, setLocalInput] = useState<string>(String(value));

  // Sync local input when the controlled value changes externally
  if (prevValue !== value) {
    setPrevValue(value);
    setLocalInput(String(value));
  }

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && (max === undefined || value < max);

  const handleDecrease = () => {
    if (canDecrease) {
      const next = value - 1;
      onChange(next);
      setLocalInput(String(next));
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      const next = value + 1;
      onChange(next);
      setLocalInput(String(next));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
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
    if (localInput === "" || isNaN(parseInt(localInput, 10))) {
      setLocalInput(String(min));
      onChange(min);
    } else {
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
      className={[
        "pos-quantity-stepper flex items-center gap-1",
        `pos-quantity-stepper--${size}`,
        disabled ? "pos-quantity-stepper--disabled opacity-50" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="pos-quantity-stepper__button flex items-center justify-center rounded p-1 hover:bg-[#e9ddcc] transition-colors disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Decrease quantity"
        onClick={handleDecrease}
        disabled={!canDecrease}
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>

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
        className={`${quantityStepperConfig?.value || ""} ${sizeStyles.value} w-10 text-center rounded border border-transparent bg-transparent font-bold text-[#2d241b] focus:border-[#a46714] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#a46714] transition-all`}
        aria-label="Item quantity"
      />

      <button
        type="button"
        className="pos-quantity-stepper__button flex items-center justify-center rounded p-1 hover:bg-[#e9ddcc] transition-colors disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Increase quantity"
        onClick={handleIncrease}
        disabled={!canIncrease}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};