// src/components/Buttons/Button.tsx
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import {
  BUTTON_BASE,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  BUTTON_FULL_WIDTH,
  SPINNER_CLASSES,
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
      BUTTON_BASE, // <-- FIXED: Added the base styles back
      BUTTON_VARIANTS[variant],
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
          <Loader2 size={16} className={SPINNER_CLASSES} aria-hidden="true" />
        ) : (
          leftIcon
        )}
        
        {/* Using flex-1 for text to center it properly when icon is present */}
        <span className="flex-1 text-center">
          {children}
        </span>
        
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;