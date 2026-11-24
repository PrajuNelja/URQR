import { Minus, Plus } from "lucide-react";
import type { QuantityStepperProps } from "./DataTable.types";

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  disabled = false,
  className = "",
}: QuantityStepperProps) => {
  const canDecrease = !disabled && value > min;
  const canIncrease =
    !disabled && (max === undefined || value < max);

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

  return (
    <div
      role="group"
      aria-label="Quantity"
      className={[
        "pos-quantity-stepper",
        `pos-quantity-stepper--${size}`,
        disabled ? "pos-quantity-stepper--disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="pos-quantity-stepper__button"
        aria-label="Decrease quantity"
        onClick={handleDecrease}
        disabled={!canDecrease}
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>

      <span
        className="pos-quantity-stepper__value"
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        className="pos-quantity-stepper__button"
        aria-label="Increase quantity"
        onClick={handleIncrease}
        disabled={!canIncrease}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default QuantityStepper;