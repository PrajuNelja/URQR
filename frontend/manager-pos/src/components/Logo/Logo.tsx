// src/components/Logo/Logo.tsx

import React from "react";
import { Sparkle } from "lucide-react";
import { logoConfig } from "./Logo.config";
import type { LogoProps } from "./Logo.types";

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "solid",
  showText = true,
  label = "GRAND HORIZON",
  subLabel = "Operations Dashboard",
  className = "",
}) => {
  const currentSize = logoConfig.sizes[size];

  const badgeClasses = [
    logoConfig.icon.wrapper,
    logoConfig.variants[variant],
    currentSize.wrapper,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${logoConfig.base} ${className}`}>
      {/* Badge */}
      <div className={badgeClasses}>
        <Sparkle
          className={`${logoConfig.icon.star} ${currentSize.star}`}
          fill="currentColor"
          strokeWidth={1.5}
        />
      </div>

      {/* Text */}
      {showText && (
        <div className={logoConfig.text.wrapper}>
          <span className={`${logoConfig.text.brand} ${currentSize.brand}`}>
            {label}
          </span>
          {subLabel && (
            <span
              className={`${logoConfig.text.subtitle} ${currentSize.subtitle}`}
            >
              {subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;