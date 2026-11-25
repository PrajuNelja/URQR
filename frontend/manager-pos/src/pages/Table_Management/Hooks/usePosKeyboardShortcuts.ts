
import { useEffect } from "react";

import {
  toPosFunctionKey,
  type PosFunctionKey,
} from "./posShortcutKeys";

interface ShortcutOptions {
  onShortcut: (key: PosFunctionKey) => void;
}

export function usePosKeyboardShortcuts({
  onShortcut,
}: ShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore held-down keys and modified shortcuts
      if (
        event.repeat ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      // Identify F1-F12
      const key = toPosFunctionKey(event.key);

      if (!key) {
        return;
      }

      // Ignore typing in input fields
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          target.closest(
            "input, textarea, select, [contenteditable='true']"
          )
        )
      ) {
        return;
      }

      // Call the POS handler
      onShortcut(key);

      // No preventDefault() yet:
      // preserve browser and system shortcuts.
    }

    // Start listening
    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    // Remove listener when the page unmounts
    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onShortcut]);
}
