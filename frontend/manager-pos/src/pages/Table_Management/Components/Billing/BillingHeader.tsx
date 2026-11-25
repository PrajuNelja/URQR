
import type { RefObject } from "react";
import { Hotel, Menu } from "lucide-react";

import { Header } from "../../../../components/Header/Header";
import { IconButton } from "../../../../components/Buttons/IconButton";
import { SearchInput } from "../../../../components/InputField/SearchInput";
import { NetworkStatusPill } from "../../../../components/Header/NetworkStatusPill";
import { CurrentDatePill } from "../../../../components/Header/CurrentDatePill";

interface Props {
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
}: Props) {
  return (
    <Header
      variant="billing"
      title="GRAND HORIZON"
      subtitle="Billing POS"
      className="urqr-billing-header"
      titleClassName="urqr-billing-brand-name"
      logo={
        <>
          <IconButton
            label="Open navigation"
            icon={<Menu size={22} />}
            variant="ghost"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
            aria-controls="urqr-billing-drawer"
          />

          <span
            className="urqr-billing-hotel-icon"
            aria-hidden="true"
          >
            <Hotel size={21} />
          </span>
        </>
      }
      center={
        <div className="urqr-billing-search">
          <SearchInput
            id="billing-search-input"
            ref={searchInputRef}
            value={searchText}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            onClear={() => onSearchChange("")}
            placeholder="Search items"
            shortcutHint="F2"
            aria-label="Search catalog products"
            fieldSize="sm"
          />
        </div>
      }
      actions={
        <div className="urqr-billing-header-actions">
          <NetworkStatusPill />
          <CurrentDatePill />
        </div>
      }
    />
  );
}
