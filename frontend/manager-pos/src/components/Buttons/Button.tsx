// src/components/Buttons/Button.tsx

// 1. Imports
import React from "react";
import { Loader2 } from "lucide-react";
import { buttonConfig } from "./Button.config";
import type { ButtonProps } from "./Button.types";

// 2. Component
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  // 3. Handlers (None needed for basic button, handled by HTML native props)

  // 4. Render Variables
  const classes = `
    ${buttonConfig.base}
    ${buttonConfig.variants[variant]}
    ${buttonConfig.sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  // 5. Export / Return
  return (
    <button 
      className={classes} 
      disabled={disabled || isLoading} 
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <Loader2 className="animate-spin mr-2" size={16} />
      )}

      {/* Left Icon */}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}

      {/* Button Text */}
      {children}

      {/* Right Icon */}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};