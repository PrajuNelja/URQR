
import { useCallback } from "react";

import { BillingHeader } from "./BillingHeader";
import { BillingCatalogMock } from "./BillingCatalogMock";
import { BillingCartPreview } from "./BillingCartPreview";

import { usePosKeyboardShortcuts } from "../../Hooks/usePosKeyboardShortcuts";
import type { PosFunctionKey } from "../../Hooks/posShortcutKeys";

export default function Billing() {
  // Temporary shortcut handler
  const handleShortcut = useCallback(
    (key: PosFunctionKey) => {
      console.info(
        `[POS] ${key} detected - action not assigned yet.`
      );
    },
    []
  );

  // Activate shortcuts only on the Billing page
  usePosKeyboardShortcuts({
    onShortcut: handleShortcut,
  });

  return (
    <main className="flex min-h-dvh w-full flex-col bg-[#f5efe6] lg:h-dvh lg:overflow-hidden">
      <BillingHeader />

      <div className="grid w-full flex-1 grid-cols-1 gap-4 px-4 pb-4 lg:min-h-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:px-7">
        <BillingCatalogMock />
        <BillingCartPreview />
      </div>
    </main>
  );
}
