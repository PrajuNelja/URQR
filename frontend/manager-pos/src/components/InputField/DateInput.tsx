// src/components/InputField/DateInput.tsx

import { forwardRef, useId } from "react";
import { Calendar } from "lucide-react";
import type { DateInputProps } from "./InputField.types";
import {
  FIELD_WRAPPER,
  FIELD_LABEL,
  FIELD_HINT,
  FIELD_ERROR,
  DATE_INPUT_BASE,
} from "./InputField.config";

/**
 * DateInput — compact date picker pill (matches reference "From / To" filters).
 *
 * <DateInput label="From" value={from} onChange={...} />
 * <DateInput label="To" value={to} onChange={...} min={from} />
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      error,
      hint,
      min,
      max,
      fullWidth = false,
      wrapperClassName = "",
      className = "",
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `date-${generatedId}`;

    const inputClasses = [
      DATE_INPUT_BASE,
      error ? "border-error-text focus:border-error-text" : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={[
          FIELD_WRAPPER,
          "!gap-1",
          fullWidth ? "w-full" : "",
          wrapperClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={`${FIELD_LABEL} !mb-0 !text-[10px]`}
          >
            {label}
          </label>
        )}

        <div className="relative inline-flex items-center">
          <Calendar
            size={13}
            className="absolute left-2 text-text-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={ref}
            id={inputId}
            type="date"
            min={min}
            max={max}
            className={`${inputClasses} pl-6`}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            {...rest}
          />
        </div>

        {error ? (
          <p id={`${inputId}-error`} className={FIELD_ERROR} role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className={FIELD_HINT}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export default DateInput;