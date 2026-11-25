// src/components/InputField/InputField.types.ts
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

export type FieldSize = "sm" | "md" | "lg";

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** NEW: rendered inside the input wrapper, right-aligned (e.g. eye toggle) */
  suffix?: ReactNode;
  fieldSize?: FieldSize;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

export interface SearchInputProps
  extends Omit<InputFieldProps, "leftIcon" | "type"> {
  onClear?: () => void;
  shortcutHint?:any;
}

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

export interface DateInputProps
  extends Omit<InputFieldProps, "type"> {
  min?: string;
  max?: string;
}