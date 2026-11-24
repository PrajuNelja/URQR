// src/components/DataTable/QuantityStepper.tsx

import { Minus, Plus } from "lucide-react";
import type { QuantityStepperProps } from "./DataTable.types";
import { quantityStepperConfig } from "./DataTable.config";

/**
 * QuantityStepper — cart quantity control (− 1 +).
 *
 * <QuantityStepper value={2} onChange={(v) => setQty(v)} />
 * <QuantityStepper value={qty} onChange={...} min={1} max={10} size="sm" />
 */
export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  disabled = false,
  className = "",
}: QuantityStepperProps) => {
  const sizeStyles = quantityStepperConfig.sizes[size];

  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && (max === undefined || value < max);

  const handleDecrement = () => {
    if (canDecrement) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (canIncrement) onChange(value + 1);
  };

  const btnClass = `${quantityStepperConfig.button} ${sizeStyles.button}`;

  return (
    <div
      className={`${quantityStepperConfig.wrapper} ${className}`.trim()}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        className={btnClass}
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        title="Decrease quantity"
      >
        <Minus size={14} />
      </button>

      <span
        className={`${quantityStepperConfig.value} ${sizeStyles.value}`}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        className={btnClass}
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        title="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default QuantityStepper;