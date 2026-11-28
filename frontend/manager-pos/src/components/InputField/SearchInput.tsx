import { forwardRef } from "react";
import { Search, X } from "lucide-react";

import type { SearchInputProps } from "./InputField.types";
import { SEARCH_CLEAR_BUTTON } from "./InputField.config";
import { InputField } from "./InputField";

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      placeholder = "Search items",
      value,
      onClear,
      onChange,
      fieldSize = "md",
      shortcutHint,
      className = "",
      ...rest
    },
    ref
  ) => {
    const hasValue = typeof value === "string" && value.length > 0;

    const handleClear = () => {
      onClear?.();
      if (onChange) {
        const event = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    return (
      <InputField
        ref={ref}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        fieldSize={fieldSize}
        autoComplete="off"
        leftIcon={
          <Search
            size={18}
            aria-hidden="true"
            className="text-text-secondary"
          />
        }
        rightIcon={
          hasValue && (onClear || onChange) ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear search"
              className={`${SEARCH_CLEAR_BUTTON}`}
            >
              <X size={16} />
            </button>
          ) : !hasValue && shortcutHint ? (
            <kbd className="text-[10px] font-sans font-semibold text-text-secondary bg-surface-alt px-1.5 py-0.5 rounded border border-border">
              {shortcutHint}
            </kbd>
          ) : undefined
        }
        className={className}
        {...rest}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;