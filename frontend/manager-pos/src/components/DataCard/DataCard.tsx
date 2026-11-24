// src/components/DataCard/DataCard.tsx

import React from "react";
import type { DataCardProps } from "./DataCard.types";
import { dataCardConfig } from "./DataCard.config";

/**
 * DataCard — composite info/summary card.
 *
 * <DataCard variant="summary" title="Total Revenue" value="₹1,72,430" trend="↑ +14%" icon={<Icon name="IndianRupee" />} />
 * <DataCard variant="info" title="Customer Info">
 *   <p>Name: John Doe</p>
 * </DataCard>
 */
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
  const cardClasses = `${dataCardConfig.base} ${className}`.trim();

  return (
    <div className={cardClasses} {...props}>
      {/* Header (icon + title) */}
      {(title || icon) && (
        <div className={dataCardConfig.header}>
          {icon && <div className={dataCardConfig.iconWrapper}>{icon}</div>}
          {title && <h3 className={dataCardConfig.title}>{title}</h3>}
        </div>
      )}

      {/* Body */}
      <div className={dataCardConfig.body}>
        {/* Summary: big value + trend */}
        {variant === "summary" && value && (
          <div>
            <div className={dataCardConfig.summary.value}>{value}</div>
            {trend && (
              <div className={dataCardConfig.summary.trend}>{trend}</div>
            )}
          </div>
        )}

        {/* Info / content: render children */}
        {(variant === "info" || variant === "content") && children}
      </div>
    </div>
  );
};

export default DataCard;