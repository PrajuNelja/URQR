// src/components/DataCard/DataCard.tsx

// 1. Imports
import React from "react";
import { dataCardConfig } from "./DataCard.config";
import type { DataCardProps } from "./DataCard.types";

// 2. Component
export const DataCard: React.FC<DataCardProps> = ({
  variant = "summary",
  title,
  value,
  trend,
  icon,
  children,
  className = "",
  ...props
}) => {
  // 3. Handlers (None needed)

  // 4. Render Variables
  const cardClasses = `${dataCardConfig.base} ${className}`;

  // 5. Export / Return
  return (
    <div className={cardClasses} {...props}>
      
      {/* Optional Header (Title & Icon) */}
      {(title || icon) && (
        <div className={dataCardConfig.header}>
          {icon && (
            <div className={dataCardConfig.iconWrapper}>
              {icon}
            </div>
          )}
          {title && (
            <h3 className={dataCardConfig.title}>
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Body */}
      <div className={dataCardConfig.body}>
        {/* If it's a summary card, show the big value and trend */}
        {variant === "summary" && value && (
          <div>
            <div className={dataCardConfig.summary.value}>{value}</div>
            {trend && <div className={dataCardConfig.summary.trend}>{trend}</div>}
          </div>
        )}

        {/* If it's info or content, just render the children */}
        {(variant === "info" || variant === "content") && children}
      </div>

    </div>
  );
};