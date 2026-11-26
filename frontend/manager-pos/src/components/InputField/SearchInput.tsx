// src/components/InputField/SearchInput.tsx

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
      <div className="pos-search-shell">
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
              className="text-primary"
            />
          }
          rightIcon={
            hasValue && (onClear || onChange) ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                title="Clear search"
                className={`${SEARCH_CLEAR_BUTTON} pos-search-clear`}
              >
                <X size={16} />
              </button>
            ) : !hasValue && shortcutHint ? (
              <kbd className="pos-search-shortcut">
                {shortcutHint}
              </kbd>
            ) : undefined
          }
          className={[
            "pos-search-input",
            className,
          ].filter(Boolean).join(" ")}
          {...rest}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
