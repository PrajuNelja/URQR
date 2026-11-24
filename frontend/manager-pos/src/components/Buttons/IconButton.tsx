// src/components/Buttons/IconButton.tsx

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import type { IconButtonProps } from "./Button.types";
import {
  ICON_BUTTON_BASE,
  ICON_BUTTON_SIZES,
  BUTTON_VARIANTS,
  SPINNER_CLASSES,
} from "./Button.config";

/**
 * IconButton — square icon-only button (eye, download, close).
 *
 * <IconButton label="View receipt" icon={<Icon name="Eye" />} />
 * <IconButton variant="primary" label="Download" icon={<Download size={18} />} />
 * <IconButton size="sm" label="Close" icon={<X size={14} />} />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "outline",
      size = "md",
      label,
      icon,
      isLoading = false,
      className = "",
      disabled,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const classes = [
      ICON_BUTTON_BASE,
      BUTTON_VARIANTS[variant],
      ICON_BUTTON_SIZES[size],
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
        aria-label={label}
        title={label}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading ? (
          <Loader2 size={16} className={SPINNER_CLASSES} aria-hidden="true" />
        ) : (
          icon
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;