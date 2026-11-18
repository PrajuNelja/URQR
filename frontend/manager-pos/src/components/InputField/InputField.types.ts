// src/components/InputField/InputField.types.ts
import type React from "react";

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** The visual variant of the input */
  type?: "text" | "password" | "search" | "number" | "date" | "quantity";
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text to display below the input (ignored if error is present) */
  helperText?: string;
  /** Size of the input field */
  inputSize?: "sm" | "md" | "lg";
}