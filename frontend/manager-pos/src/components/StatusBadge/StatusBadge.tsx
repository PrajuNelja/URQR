// src/components/StatusBadge/StatusBadge.tsx

// 1. Imports
import React from "react";
import { statusBadgeConfig } from "./StatusBadge.config";
import type { StatusBadgeProps } from "./StatusBadge.types";

// 2. Component
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = "",
  ...props
}) => {
  // 3. Handlers (None needed)

  // 4. Render Variables
  const badgeClasses = `
    ${statusBadgeConfig.base}
    ${statusBadgeConfig.statuses[status]}
    ${className}
  `.trim();

  const displayLabel = label || statusBadgeConfig.defaultLabels[status];

  // 5. Export / Return
  return (
    <span className={badgeClasses} {...props}>
      {displayLabel}
    </span>
  );
};