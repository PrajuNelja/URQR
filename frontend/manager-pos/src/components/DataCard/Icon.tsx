// src/components/DataCard/Icon.tsx
// Lucide-react wrapper with consistent sizing & safe fallback.

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IconProps } from "./DataCard.types";
import { ICON_SIZES, ICON_DEFAULT_STROKE } from "./DataCard.config";

/**
 * Icon — renders a lucide-react icon by name.
 *
 * <Icon name="Eye" />
 * <Icon name="IndianRupee" size="lg" />
 * <Icon name="Search" size={22} className="text-accent-gold" />
 */
export const Icon = ({
  name,
  size = "md",
  className = "",
  strokeWidth = ICON_DEFAULT_STROKE,
  color,
}: IconProps) => {
  const LucideComponent = (
    LucideIcons as unknown as Record<string, LucideIcon>
  )[name];

  if (!LucideComponent) {
    if (import.meta.env?.DEV) {
      console.warn(`[Icon] Unknown lucide icon name: "${name}"`);
    }
    return null;
  }

  const pixelSize = typeof size === "number" ? size : ICON_SIZES[size];

  return (
    <LucideComponent
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      aria-hidden="true"
    />
  );
};

export default Icon;