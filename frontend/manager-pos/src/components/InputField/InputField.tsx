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

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      suffix,
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
      leftIcon ? "pl-7" : "",
      rightIcon ? "pr-12" : "",
      suffix ? "!pr-12" : "",
      fullWidth ? "w-full" : "",
      "[&:-webkit-autofill]:!bg-white [&:-webkit-autofill]:!shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:!text-text",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // 👇 DYNAMIC OUTER RING COLOR: Dark Red for Error, Dark Brown for Normal 👇
    const outerRingColor = error 
      ? "group-focus-within:border-[#D92D20]" 
      : "group-focus-within:border-[#8B5E3C]"; 

    return (
      <div
        className={[
          FIELD_WRAPPER,
          fullWidth ? "w-full" : "",
          wrapperClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <label htmlFor={inputId} className={FIELD_LABEL}>
            {label}
          </label>
        )}

        <div className="relative w-full group">
          
          {leftIcon && (
            <span className={INPUT_LEFT_ICON}>{leftIcon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
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

          {rightIcon && (
            <span className={INPUT_RIGHT_ICON}>{rightIcon}</span>
          )}

          {suffix && (
            <span className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center">
              {suffix}
            </span>
          )}

          {/* Outer Ring */}
          <div 
            className={`pointer-events-none absolute -inset-[3px] rounded-[13px] border-2 border-transparent transition-colors duration-200 ${outerRingColor}`} 
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

InputField.displayName = "InputField";
export default InputField;