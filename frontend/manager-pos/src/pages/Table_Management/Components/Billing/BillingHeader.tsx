// src/pages/Table_Management/Components/Billing/BillingHeader.tsx
import { useCallback, useEffect } from "react";
import type { RefObject } from "react";
import { Keyboard, Moon, Sparkles, Sun } from "lucide-react";

import { Header } from "../../../../components/Header/Header";
import { IconButton } from "../../../../components/Buttons/IconButton";
import { Icon } from "../../../../components/DataCard/Icon";
import { Logo } from "../../../../components/Logo/Logo";
import { SearchInput } from "../../../../components/InputField/SearchInput";
import { NetworkStatusPill } from "../../../../components/Header/NetworkStatusPill";
import { CurrentDatePill } from "../../../../components/Header/CurrentDatePill";

interface BillingHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;

  onMenuClick: () => void;
  menuOpen: boolean;

  // Virtual keyboard integration
  isKeyboardOpen: boolean; // ADDED: So we can toggle correctly
  onToggleKeyboard: () => void; // CHANGED: Toggle instead of just open
  onClearSearch: () => void;

  // Loading skeleton demo
  isSkeletonPreview?: boolean;
  onToggleSkeleton?: () => void;

  // Theme toggle
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function BillingHeader({
  searchText,
  onSearchChange,
  searchInputRef,
  onMenuClick,
  menuOpen,
  isKeyboardOpen,
  onToggleKeyboard,
  onClearSearch,
  isSkeletonPreview = false,
  onToggleSkeleton,
  isDark = false,
  onToggleTheme,
}: BillingHeaderProps) {
  
  const focusSearch = useCallback(() => {
    const input = searchInputRef.current ?? document.querySelector<HTMLInputElement>("#billing-search-input");
    input?.focus({ preventScroll: true });
  }, [searchInputRef]);

  // Handle F2 Shortcut
  useEffect(() => {
    const handleF2 = (event: KeyboardEvent) => {
      if (event.key !== "F2" || event.ctrlKey || event.altKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      onToggleKeyboard();
      focusSearch();
    };

    window.addEventListener("keydown", handleF2, true);
    return () => window.removeEventListener("keydown", handleF2, true);
  }, [focusSearch, onToggleKeyboard]);

  const handleClearSearch = () => {
    onClearSearch();
    focusSearch();
  };

  return (
    <Header
      variant="billing"
      title="GRAND HORIZON"
      titleClassName="sr-only"
      className="urqr-billing-header"
      logo={
        <div className="flex items-center gap-2 -ml-2 sm:-ml-1">
          <IconButton
            label="Toggle navigation"
            icon={<Icon name="Menu" size={20} />}
            variant="ghost"
            size="md"
            className="urqr-billing-menu-button !h-10 !w-10 rounded-lg text-text hover:bg-surface-alt transition-colors"
            aria-expanded={menuOpen}
            aria-controls="urqr-billing-drawer"
            onClick={onMenuClick}
          />
          <Logo size="md" variant="solid" showText={true} label="GRAND HORIZON" subLabel="" className="urqr-billing-brand-logo" />
        </div>
      }
      center={
        <div className="urqr-billing-search flex w-full min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchInput
              id="billing-search-input"
              ref={searchInputRef}
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
              onClear={handleClearSearch}
              // NO onFocus here anymore!
              placeholder="Search items"
              shortcutHint="F2"
              aria-label="Search catalog products"
              fieldSize="sm"
              inputMode="none"
              autoComplete="off"
            />
          </div>

          {/* Keyboard Icon - Now toggles the keyboard */}
          <IconButton
            label={isKeyboardOpen ? "Hide touch keyboard" : "Open touch keyboard"}
            icon={<Keyboard size={19} aria-hidden="true" />}
            variant={isKeyboardOpen ? "primary" : "outline"} // Optional: highlight when open
            size="md"
            className="shrink-0 !h-10 !w-10"
            onClick={() => {
              onToggleKeyboard();
              focusSearch();
            }}
          />
        </div>
      }
      actions={
        <div className="urqr-billing-header-actions">
          {onToggleSkeleton && (
            <button
              type="button"
              onClick={onToggleSkeleton}
              aria-pressed={isSkeletonPreview}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors ${
                isSkeletonPreview
                  ? "bg-primary text-on-primary border-primary shadow-sm"
                  : "border-border bg-surface text-text hover:bg-surface-alt"
              }`}
              title="Toggle billing skeleton preview"
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>{isSkeletonPreview ? "Live Mode" : "Skeleton"}</span>
            </button>
          )}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle dark sepia theme"
              aria-pressed={isDark}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-semibold text-text hover:bg-surface-alt transition-colors"
            >
              {isDark ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>
          )}
          <NetworkStatusPill />
          <CurrentDatePill />
        </div>
      }
    />
  );
}

export default BillingHeader;