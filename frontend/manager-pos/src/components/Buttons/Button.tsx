// src/components/Buttons/Button.tsx
import { forwardRef } from "react";
import {
  BUTTON_BASE,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  BUTTON_FULL_WIDTH,
} from "./Button.config";
import type { ButtonProps } from "./Button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const classes = [
      BUTTON_BASE,
      BUTTON_VARIANTS[variant],
      isLoading
        ? "!bg-primary !text-on-primary opacity-90 cursor-wait pointer-events-none"
        : "",
      BUTTON_SIZES[size],
      fullWidth ? BUTTON_FULL_WIDTH : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading ? (
          <svg
            className={`${size === "login" ? "h-[22px] w-[22px]" : "h-5 w-5"} animate-spin shrink-0 text-current`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        
        <span className="inline-flex items-center justify-center font-semibold">
          {children}
        </span>
        
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;