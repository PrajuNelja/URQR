import React, { useState, useRef, useCallback } from "react";
import { Search, X, ScanBarcode } from "lucide-react";
import { SEARCH_CLEAR_BUTTON } from "./InputField.config";

export interface QuickItemSearchBarProps {
  placeholder?: string;
  value?: string;
  debounceMs?: number;
  onSearchChange: (query: string) => void;
  onBarcodeScanned?: (barcode: string) => void;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

/**
 * QuickItemSearchBar — POS search bar supporting debounced text query and direct barcode scanner input.
 * Hardware barcode scanners emit rapid keyboard events (< 40ms per character) ending with 'Enter'.
 * This component discriminates between human typing and hardware scanner bursts.
 */
export const QuickItemSearchBar: React.FC<QuickItemSearchBarProps> = ({
  placeholder = "Search dishes or scan barcode...",
  value: controlledValue,
  debounceMs = 250,
  onSearchChange,
  onBarcodeScanned,
  onClear,
  className = "",
  autoFocus = false,
}) => {
  const [prevControlled, setPrevControlled] = useState<string | undefined>(controlledValue);
  const [internalValue, setInternalValue] = useState<string>(controlledValue || "");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Barcode scanner burst buffer
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (controlledValue !== undefined && prevControlled !== controlledValue) {
    setPrevControlled(controlledValue);
    setInternalValue(controlledValue);
  }

  // Debounced search trigger for human typing
  const triggerDebouncedSearch = useCallback(
    (text: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onSearchChange(text);
      }, debounceMs);
    },
    [debounceMs, onSearchChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    triggerDebouncedSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    const timeDiff = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    // Detect hardware barcode scanner (characters arriving < 50ms apart)
    if (timeDiff < 50 && e.key.length === 1) {
      barcodeBufferRef.current += e.key;
      setIsScanning(true);
    } else if (timeDiff > 200 && e.key.length === 1) {
      // Human typing gap reset
      barcodeBufferRef.current = e.key;
      setIsScanning(false);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const scannedCandidate = barcodeBufferRef.current.trim() || internalValue.trim();

      // If buffer has barcode length (>= 3 chars) or scanned rapidly
      if (scannedCandidate.length >= 3 && onBarcodeScanned) {
        onBarcodeScanned(scannedCandidate);
        setInternalValue("");
        barcodeBufferRef.current = "";
        setIsScanning(false);
        onSearchChange("");
        return;
      }

      // Regular Enter on manual search
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      onSearchChange(internalValue);
    }
  };

  const handleClear = () => {
    setInternalValue("");
    barcodeBufferRef.current = "";
    setIsScanning(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    onSearchChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-3.5 flex items-center pointer-events-none text-[#91816c]">
        <Search size={18} />
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="search"
        autoFocus={autoFocus}
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-12 pl-10 pr-20 rounded-xl border border-[#e4d5bd] bg-white text-sm font-medium text-[#2d241b] placeholder:text-[#91816c]/70 focus:outline-none focus:border-[#a46714] focus:ring-2 focus:ring-[#a46714]/20 transition-all"
        aria-label="Quick dish search and barcode input"
      />

      {/* Right Action Icons: Scanner Indicator & Clear Button */}
      <div className="absolute right-3 flex items-center gap-1.5">
        {isScanning && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2f7a45] bg-[#d9eedd] px-2 py-0.5 rounded-md animate-pulse">
            <ScanBarcode size={13} />
            Scan
          </span>
        )}

        {!isScanning && (
          <span
            title="Ready for barcode scanner input"
            className="text-[#91816c] hover:text-[#2d241b] transition-colors p-1"
          >
            <ScanBarcode size={16} />
          </span>
        )}

        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={SEARCH_CLEAR_BUTTON}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickItemSearchBar;
