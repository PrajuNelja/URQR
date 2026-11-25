
import type { RefObject } from "react";
import { Hotel, Menu } from "lucide-react";

import { Header } from "../../../../components/Header/Header";
import { IconButton } from "../../../../components/Buttons/IconButton";
import { SearchInput } from "../../../../components/InputField/SearchInput";
import { NetworkStatusPill } from "../../../../components/Header/NetworkStatusPill";
import { CurrentDatePill } from "../../../../components/Header/CurrentDatePill";

interface BillingHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

export function BillingHeader({
  searchText,
  onSearchChange,
  searchInputRef,
  onMenuClick,
  isMenuOpen,
}: BillingHeaderProps) {
  return (
    <Header
      variant="billing"
      title="GRAND HORIZON"
      subtitle="Billing POS"
      titleClassName="!font-sans !text-[17px] !font-semibold !text-text"
      className="!mb-0 !min-h-16 !w-full !rounded-none !border-b !border-border !bg-surface !px-4 !py-2 lg:!px-6"
      logo={
        <>
          <IconButton
            label="Open navigation"
            icon={<Menu size={22} />}
            variant="ghost"
            size="md"
            onClick={onMenuClick}
            aria-controls="billing-navigation"
            aria-expanded={isMenuOpen}
          />

          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-dark !text-white"
            aria-label="Hotel"
          >
            <Hotel size={21} aria-hidden="true" />
          </span>
        </>
      }
      center={
        <div className="billing-header-search w-full max-w-[440px]">
          <SearchInput
            id="billing-search-input"
            ref={searchInputRef}
            value={searchText}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            onClear={() => onSearchChange("")}
            placeholder="Search items"
            aria-label="Search catalog products"
            shortcutHint="F2"
            fieldSize="sm"
          />
        </div>
      }
      actions={
        <div className="flex items-center gap-2.5">
          <NetworkStatusPill />
          <CurrentDatePill />
        </div>
      }
    />
  );
}
