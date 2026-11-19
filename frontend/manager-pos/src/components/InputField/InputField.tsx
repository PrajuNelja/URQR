// src/components/InputField/InputField.tsx

import { forwardRef, useId } from "react";
import type { InputFieldProps } from "./InputField.types";
import {
  FIELD_WRAPPER,
  FIELD_LABEL,
  FIELD_HINT,
  FIELD_ERROR,
  INPUT_BASE,
  INPUT_VARIANTS,
  INPUT_SIZES,
  INPUT_LEFT_ICON,
  INPUT_RIGHT_ICON,
} from "./InputField.config";

/**
 * InputField — text/password/number/etc. input with label, hint, error, icons.
 *
 * <InputField label="MANAGER ID" placeholder="e.g., MGR-8902" />
 * <InputField label="Password" type="password" placeholder="••••••••" />
 * <InputField label="Search" leftIcon={<Icon name="Search" />} />
 * <InputField label="Amount" error="This field is required" />
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fieldSize = "md",
      fullWidth = true,
      wrapperClassName = "",
      className = "",
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    const inputClasses = [
      INPUT_BASE,
      INPUT_VARIANTS[error ? "error" : "default"],
      INPUT_SIZES[fieldSize],
      leftIcon ? "pl-10" : "",
      rightIcon ? "pr-10" : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={[FIELD_WRAPPER, fullWidth ? "w-full" : "", wrapperClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <label htmlFor={inputId} className={FIELD_LABEL}>
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && <span className={INPUT_LEFT_ICON}>{leftIcon}</span>}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...rest}
          />

          {rightIcon && <span className={INPUT_RIGHT_ICON}>{rightIcon}</span>}
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

InputField.displayName = "InputField";

export default InputField;