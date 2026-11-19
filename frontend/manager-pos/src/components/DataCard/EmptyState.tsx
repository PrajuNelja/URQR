// src/components/DataCard/EmptyState.tsx

import type { EmptyStateProps } from "./DataCard.types";
import { emptyStateConfig } from "./DataCard.config";

/**
 * EmptyState — placeholder when there's no data.
 *
 * <EmptyState message="Cart is empty" />
 * <EmptyState message="No results found" description="Try a different search." icon={<Icon name="Search" />} />
 * <EmptyState message="No orders yet" icon={<Icon name="ShoppingBag" size="lg" />} />
 */
export const EmptyState = ({
  message,
  description,
  icon,
  className = "",
}: EmptyStateProps) => {
  return (
    <div className={`${emptyStateConfig.wrapper} ${className}`.trim()}>
      {icon && <div className={emptyStateConfig.icon}>{icon}</div>}
      <p className={emptyStateConfig.message}>{message}</p>
      {description && (
        <p className={emptyStateConfig.description}>{description}</p>
      )}
    </div>
  );
};

export default EmptyState;