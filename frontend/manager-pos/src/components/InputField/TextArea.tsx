// src/components/InputField/TextArea.tsx
import { forwardRef, useId } from "react";
import type { TextAreaProps } from "./InputField.types";
import {
  FIELD_WRAPPER,
  FIELD_LABEL,
  FIELD_HINT,
  FIELD_ERROR,
  TEXTAREA_BASE,
  TEXTAREA_ERROR,
} from "./InputField.config";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      hint,
      rows = 3,
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
    const textareaId = id || `textarea-${generatedId}`;

    const textareaClasses = [
      TEXTAREA_BASE,
      error ? TEXTAREA_ERROR : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={[FIELD_WRAPPER, fullWidth ? "w-full" : "", wrapperClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {label && (
          <label htmlFor={textareaId} className={FIELD_LABEL}>
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
              ? `${textareaId}-hint`
              : undefined
          }
          {...rest}
        />

        {error ? (
          <p id={`${textareaId}-error`} className={FIELD_ERROR} role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className={FIELD_HINT}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;