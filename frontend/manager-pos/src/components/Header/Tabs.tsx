// src/components/Header/Tabs.tsx

import type { TabsProps } from "./Header.types";
import { tabsConfig } from "./Header.config";

/**
 * Tabs — category pills (Menu Catalog: All / Starters / Main Course / …)
 *
 * <Tabs
 *   items={[
 *     { key: "all", label: "All" },
 *     { key: "starters", label: "Starters" },
 *   ]}
 *   value={cat}
 *   onChange={setCat}
 * />
 */
export const Tabs = ({
  items,
  value,
  onChange,
  className = "",
}: TabsProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={`${tabsConfig.wrapper} ${className}`.trim()}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={isActive ? tabsConfig.itemActive : tabsConfig.item}
            onClick={() => onChange(item.key)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;