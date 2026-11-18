// src/components/InputField/InputField.types.ts

import type { InputHTMLAttributes, ReactNode } from "react";


export type InputVariant = "text" | "password" | "search" | "number" | "date";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** The type of input to render */
  type?: InputVariant;
  /** Label displayed above the input */
  label?: string;
  /** Error message to display below */
  error?: string;
  /** Icon to display on the left side */
  leftIcon?: ReactNode;
  /** Whether the field takes up the full width of its container */
  fullWidth?: boolean;
}