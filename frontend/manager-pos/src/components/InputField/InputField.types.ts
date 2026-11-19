// src/components/InputField/InputField.types.ts
// All types for the InputField folder: InputField, SearchInput, TextArea, DateInput

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

// ═══════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════

export type FieldSize = "sm" | "md" | "lg";

// ═══════════════════════════════════════════
// INPUT FIELD
// ═══════════════════════════════════════════

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label above the input */
  label?: string;
  /** Error message (also applies error styling) */
  error?: string;
  /** Hint text below the input */
  hint?: string;
  /** Icon on the left side of the input */
  leftIcon?: ReactNode;
  /** Icon on the right side of the input */
  rightIcon?: ReactNode;
  /** Size preset (default: 'md') */
  fieldSize?: FieldSize;
  /** Stretch to full width (default: true) */
  fullWidth?: boolean;
  /** Wrapper className (applied to outer container) */
  wrapperClassName?: string;
}

// ═══════════════════════════════════════════
// SEARCH INPUT
// ═══════════════════════════════════════════

export interface SearchInputProps
  extends Omit<InputFieldProps, "leftIcon" | "type"> {
  /** Called when user clears the field */
  onClear?: () => void;
}

// ═══════════════════════════════════════════
// TEXT AREA
// ═══════════════════════════════════════════

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label above the textarea */
  label?: string;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Number of visible rows (default: 3) */
  rows?: number;
  /** Stretch to full width (default: true) */
  fullWidth?: boolean;
  /** Wrapper className */
  wrapperClassName?: string;
}

// ═══════════════════════════════════════════
// DATE INPUT
// ═══════════════════════════════════════════

export interface DateInputProps
  extends Omit<InputFieldProps, "type"> {
  /** Minimum date (ISO string) */
  min?: string;
  /** Maximum date (ISO string) */
  max?: string;
}