// src/components/InputField/InputField.tsx

// 1. Imports
import React, { useState } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import { inputFieldConfig } from "./InputField.config";
import type { InputFieldProps } from "./InputField.types";

// 2. Component
export const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  label,
  error,
  leftIcon,
  fullWidth = true,
  className = "",
  ...props
}) => {
  // 3. Handlers & State
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // 4. Render Variables
  const actualType = type === "password" && showPassword ? "text" : type;

  const renderLeftIcon = () => {
    if (type === "search") return <Search size={16} />;
    return leftIcon;
  };

  const renderRightIcon = () => {
    if (type === "password") {
      return showPassword ? <EyeOff size={16} /> : <Eye size={16} />;
    }
    return null;
  };

  const hasLeftIcon = !!renderLeftIcon();
  const hasRightIcon = !!renderRightIcon() || type === "password";

  const inputClasses = `
    ${inputFieldConfig.input.base}
    ${error ? inputFieldConfig.input.error : inputFieldConfig.input.focus}
    ${hasLeftIcon ? inputFieldConfig.input.withLeftIcon : ""}
    ${hasRightIcon ? inputFieldConfig.input.withRightIcon : ""}
    ${className}
  `.trim();

  // 5. Export / Return
  return (
    <div className={`${fullWidth ? "w-full" : ""} ${inputFieldConfig.wrapper}`}>
      {/* Label */}
      {label && <label className={inputFieldConfig.label}>{label}</label>}

      {/* Input Container */}
      <div className={inputFieldConfig.inputWrapper}>
        {/* Left Icon */}
        {hasLeftIcon && (
          <div className={inputFieldConfig.icon.left}>{renderLeftIcon()}</div>
        )}

        {/* Input Element */}
        <input
          type={actualType}
          className={inputClasses}
          {...props}
        />

        {/* Right Icon (Password Toggle) */}
        {hasRightIcon && (
          <button
            type="button"
            onClick={type === "password" ? togglePasswordVisibility : undefined}
            className={inputFieldConfig.icon.right}
            tabIndex={-1}
          >
            {renderRightIcon()}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <span className={inputFieldConfig.errorText}>{error}</span>}
    </div>
  );
};