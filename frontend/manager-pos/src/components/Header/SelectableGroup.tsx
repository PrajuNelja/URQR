// src/components/Header/SelectableGroup.tsx
import type { SelectableGroupProps } from "./Header.types";
import { selectableGroupConfig } from "./Header.config";

export const SelectableGroup = ({
  options,
  value,
  onChange,
  className = "",
}: SelectableGroupProps) => {
  if (!options || options.length === 0) return null;

  return (
    <div
      className={`${selectableGroupConfig.wrapper} ${className}`.trim()}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={
              isActive
                ? selectableGroupConfig.itemActive
                : selectableGroupConfig.item
            }
            onClick={() => onChange(opt.value)}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SelectableGroup;