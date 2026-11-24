// src/components/DataCard/Divider.tsx

import type { DividerProps } from "./DataCard.types";
import { dividerConfig } from "./DataCard.config";

/**
 * Divider — horizontal or vertical separator (solid / dashed), optional label.
 *
 * <Divider />
 * <Divider variant="dashed" />
 * <Divider label="OR" />
 * <Divider orientation="vertical" />
 */
export const Divider = ({
  orientation = "horizontal",
  variant = "solid",
  label,
  className = "",
}: DividerProps) => {
  const lineClass = dividerConfig[orientation][variant];

  // ── Horizontal with label: line — label — line ──
  if (orientation === "horizontal" && label) {
    return (
      <div
        className={`flex items-center w-full ${className}`.trim()}
        role="separator"
        aria-orientation="horizontal"
      >
        <span className={`${lineClass} flex-1`} />
        <span className={dividerConfig.label}>{label}</span>
        <span className={`${lineClass} flex-1`} />
      </div>
    );
  }

  // ── Horizontal / vertical plain line ──
  return (
    <div
      className={`${lineClass} ${className}`.trim()}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export default Divider;