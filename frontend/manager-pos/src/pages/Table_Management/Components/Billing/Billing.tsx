
import {
  useCallback,
  useRef,
  useState,
} from "react";

import { BillingHeader } from "./BillingHeader";
import { BillingCatalogMock } from "./BillingCatalogMock";
import { BillingCartPreview } from "./BillingCartPreview";

import { usePosKeyboardShortcuts } from "../../Hooks/usePosKeyboardShortcuts";

import type { PosFunctionKey } from "../../Hooks/posShortcutKeys";

export default function Billing() {
  // Shared search state
  const [searchText, setSearchText] = useState("");

  // Used to focus the search bar with F2
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleShortcut = useCallback(
    (key: PosFunctionKey) => {
      if (key === "F2") {
        searchInputRef.current?.focus();
        return;
      }

      console.info(`[POS] ${key} detected`);
    },
    []
  );

  usePosKeyboardShortcuts({
    onShortcut: handleShortcut,
  });

  return (
    <main className="flex min-h-dvh w-full flex-col bg-app-bg lg:h-dvh lg:overflow-hidden">

      {/* SHARED BILLING HEADER */}
      <BillingHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        searchInputRef={searchInputRef}
      />

      {/* 60% CATALOG + 40% CART */}
      <div className="grid w-full flex-1 grid-cols-1 gap-4 px-4 pb-4 pt-4 lg:min-h-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-7">

        <BillingCatalogMock
          searchText={searchText}
        />

        <BillingCartPreview />

      </div>
    </main>
  );
}
