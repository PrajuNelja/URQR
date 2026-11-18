// src/components/InputField/InputField.tsx
import React, { useState } from "react";
import { Search, Eye, EyeOff, Calendar, Minus, Plus } from "lucide-react";
import { inputFieldConfig } from "./InputField.config";
import type { InputFieldProps } from "./InputField.types";

export const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  inputSize = "md",
  label,
  error,
  helperText,
  className = "",
  disabled,
  value,
  onChange,
  min = 1,
  max = 99,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // --- 1. Render Variables ---
  const currentSize = inputFieldConfig.sizes[inputSize];
  const actualType = type === "password" && showPassword ? "text" : type;
  
  const hasLeftIcon = type === "search" || type === "date";
  const hasRightIcon = type === "password";

  let paddingClass = inputFieldConfig.input.padding.none;
  if (hasLeftIcon && hasRightIcon) paddingClass = inputFieldConfig.input.padding.bothIcons;
  else if (hasLeftIcon) paddingClass = inputFieldConfig.input.padding.leftIcon;
  else if (hasRightIcon) paddingClass = inputFieldConfig.input.padding.rightIcon;

  // --- 2. Handlers ---
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleDecrease = () => {
    const currentVal = Number(value) || 0;
    if (currentVal > Number(min) && onChange) {
      const event = { target: { value: String(currentVal - 1) } } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  const handleIncrease = () => {
    const currentVal = Number(value) || 0;
    if (currentVal < Number(max) && onChange) {
      const event = { target: { value: String(currentVal + 1) } } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  // --- 3. Render Helpers ---
  const renderLeftIcon = () => {
    if (type === "search") return <Search className={`${inputFieldConfig.icon.base} ${inputFieldConfig.icon.left} ${currentSize.icon}`} />;
    if (type === "date") return <Calendar className={`${inputFieldConfig.icon.base} ${inputFieldConfig.icon.left} ${currentSize.icon}`} />;
    return null;
  };

  // --- 4. Return ---
  return (
    <div className={`${inputFieldConfig.baseWrapper} ${className}`}>
      {label && <label className={inputFieldConfig.label}>{label}</label>}

      {/* --- QUANTITY STEPPER RENDER --- */}
      {type === "quantity" ? (
        <div className={inputFieldConfig.stepper.wrapper}>
          <button
            type="button"
            onClick={handleDecrease}
            disabled={disabled || Number(value) <= Number(min)}
            className={inputFieldConfig.stepper.button}
          >
            <Minus className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <input
            type="number"
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={min}
            max={max}
            className={inputFieldConfig.stepper.input}
            {...props}
          />

          <button
            type="button"
            onClick={handleIncrease}
            disabled={disabled || Number(value) >= Number(max)}
            className={inputFieldConfig.stepper.button}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        /* --- STANDARD INPUT RENDER --- */
        <div
          className={`
            ${inputFieldConfig.inputWrapper.base} 
            ${currentSize.inputWrapper} 
            ${error ? inputFieldConfig.inputWrapper.error : inputFieldConfig.inputWrapper.default}
            ${disabled ? inputFieldConfig.inputWrapper.disabled : inputFieldConfig.inputWrapper.focus}
          `}
        >
          {renderLeftIcon()}
          <input
            type={actualType}
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={`${inputFieldConfig.input.base} ${currentSize.input} ${paddingClass}`}
            {...props}
          />

          {type === "password" && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={`${inputFieldConfig.icon.base} ${inputFieldConfig.icon.right} ${inputFieldConfig.icon.clickable}`}
            >
              {showPassword ? <EyeOff className={currentSize.icon} /> : <Eye className={currentSize.icon} />}
            </button>
          )}
        </div>
      )}

      {error ? (
        <span className={`${inputFieldConfig.message.base} ${inputFieldConfig.message.error}`}>{error}</span>
      ) : helperText ? (
        <span className={`${inputFieldConfig.message.base} ${inputFieldConfig.message.helper}`}>{helperText}</span>
      ) : null}
    </div>
  );
};