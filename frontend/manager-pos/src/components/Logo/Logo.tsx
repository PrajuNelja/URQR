// src/components/Logo/Logo.tsx

// 1. Imports
import React from "react";
import { Sparkles } from "lucide-react";
import { logoConfig } from "./Logo.config";
import type { LogoProps } from "./Logo.types";

// 2. Component
export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  // 3. Handlers (None needed for Logo)

  // 4. Render Variables
  const currentSize = logoConfig.sizes[size];

  // 5. Export / Return
  return (
    <div className={`${logoConfig.base} ${className}`}>
      {/* Icon Wrapper */}
      <div className={`${logoConfig.icon.wrapper} ${currentSize.wrapper}`}>
        <Sparkles 
          className={`${logoConfig.icon.star} ${currentSize.star}`} 
          strokeWidth={2} 
        />
      </div>

      {/* Text Wrapper */}
      {showText && (
        <div className={logoConfig.text.wrapper}>
          <span className={`${logoConfig.text.brand} ${currentSize.brand}`}>
            GRAND HORIZON
          </span>
          <span className={`${logoConfig.text.subtitle} ${currentSize.subtitle}`}>
            Operations Dashboard
          </span>
        </div>
      )}
    </div>
  );
};