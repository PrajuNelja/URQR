
import type { RefObject } from "react";

import { Header } from "../../../../components/Header/Header";
import { SearchInput } from "../../../../components/InputField/SearchInput";
import { NetworkStatusPill } from "../../../../components/Header/NetworkStatusPill";
import { CurrentDatePill } from "../../../../components/Header/CurrentDatePill";

interface BillingHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export function BillingHeader({
  searchText,
  onSearchChange,
  searchInputRef,
}: BillingHeaderProps) {
  return (
    <Header
      variant="billing"
      title="Billing"
      titleClassName="!font-sans !text-[28px] !font-semibold"
      className="!mb-0 min-h-[72px] w-full border-b border-border-subtle bg-surface px-4 lg:px-7"
      center={
        <div className="billing-header-search w-full max-w-[555px]">
          <SearchInput
            ref={searchInputRef}
            value={searchText}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            onClear={() => onSearchChange("")}
            placeholder="Search items"
            aria-label="Search catalog products"
            fieldSize="sm"
          />
        </div>
      }
      actions={
        <div className="flex items-center gap-6">
          <NetworkStatusPill />
          <CurrentDatePill />
        </div>
      }
    />
  );
}
