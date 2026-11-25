
import { useEffect } from "react";
import type { RefObject } from "react";

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
}

export function BillingHeader({
  searchText,
  onSearchChange,
  searchInputRef,
  onMenuClick,
  menuOpen,
}: BillingHeaderProps) {

  // Focus the reusable search input
  const focusSearch = () => {
    const input =
      searchInputRef.current ??
      document.querySelector<HTMLInputElement>(
        "#billing-search-input"
      );

    input?.focus();
  };

  // =====================================
  // F2 KEYBOARD SHORTCUT
  // =====================================

  useEffect(() => {
    const handleF2 = (event: KeyboardEvent) => {
      if (
        event.key === "F2" &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        event.stopPropagation();

        const searchInput =
          searchInputRef.current ??
          document.querySelector<HTMLInputElement>(
            "#billing-search-input"
          );

        searchInput?.focus();
      }
    };

    window.addEventListener(
      "keydown",
      handleF2,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleF2,
        true
      );
    };
  }, [searchInputRef]);

  return (
    <Header
      variant="billing"
      title="GRAND HORIZON"
      titleClassName="sr-only"
      className="urqr-billing-header"

      // REUSABLE MENU AND HOTEL LOGO
      logo={
        <>
          <IconButton
            label="Open navigation"
            icon={
              <Icon name="Menu" size={22} />
            }
            variant="ghost"
            size="md"
            className="urqr-billing-menu-button"
            aria-expanded={menuOpen}
            aria-controls="urqr-billing-drawer"
            onClick={onMenuClick}
          />

          <Logo
            size="md"
            variant="solid"
            showText={true}
            label="GRAND HORIZON"
            subLabel=""
            className="urqr-billing-brand-logo"
          />
        </>
      }

      // REUSABLE SEARCH INPUT WITH F2
      center={
        <div
          className="urqr-billing-search"
          onClick={(event) => {
            const target = event.target;

            if (
              target instanceof HTMLElement &&
              target.closest(".pos-search-shortcut")
            ) {
              focusSearch();
            }
          }}
        >
          <SearchInput
            id="billing-search-input"
            ref={searchInputRef}
            value={searchText}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            onClear={() => {
              onSearchChange("");
              focusSearch();
            }}
            placeholder="Search items"
            shortcutHint="F2"
            aria-label="Search catalog products"
            fieldSize="sm"
          />
        </div>
      }

      // REUSABLE NETWORK AND DATE
      actions={
        <div className="urqr-billing-header-actions">
          <NetworkStatusPill />
          <CurrentDatePill />
        </div>
      }
    />
  );
}

export default BillingHeader;
