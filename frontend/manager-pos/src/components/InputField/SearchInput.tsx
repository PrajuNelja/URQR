// src/components/InputField/SearchInput.tsx

import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import type { SearchInputProps } from "./InputField.types";
import { SEARCH_CLEAR_BUTTON } from "./InputField.config";
import { InputField } from "./InputField";

/**
 * SearchInput — InputField with a search icon and optional clear button.
 *
 * <SearchInput placeholder="Search dishes..." value={q} onChange={...} />
 * <SearchInput placeholder="Search orders..." onClear={() => setQ("")} />
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      placeholder = "Search...",
      value,
      onClear,
      onChange,
      fieldSize = "md",
      className = "",
      ...rest
    },
    ref
  ) => {
    const hasValue = typeof value === "string" && value.length > 0;

    const handleClear = () => {
      onClear?.();
      // Also fire a synthetic change so controlled parents reset
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
        leftIcon={<Search size={16} />}
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              className={SEARCH_CLEAR_BUTTON}
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear search"
            >
              <X size={14} />
            </button>
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