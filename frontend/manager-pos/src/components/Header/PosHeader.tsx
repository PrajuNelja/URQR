
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import type { RefObject } from "react";

import { PosIcon } from "../Icons/PosIcon";
import { Header } from "./Header";
import { IconButton } from "../Buttons/IconButton";
import { Logo } from "../Logo/Logo";
import { SearchInput } from "../InputField/SearchInput";
import { NetworkStatusPill } from "./NetworkStatusPill";
import { CurrentDatePill } from "./CurrentDatePill";

import "../../Styles/PosNavigation.css";

export interface PosHeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;

  searchInputRef: RefObject<HTMLInputElement | null>;

  onMenuClick: () => void;
  menuOpen: boolean;

  // Virtual keyboard
  isKeyboardOpen: boolean;
  onToggleKeyboard: () => void;
  onClearSearch: () => void;

  // Existing page compatibility
  isSkeletonPreview?: boolean;
  onToggleSkeleton?: () => void;

  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function PosHeader({
  searchText,
  onSearchChange,
  searchInputRef,
  onMenuClick,
  menuOpen,
  isKeyboardOpen,
  onToggleKeyboard,
  onClearSearch,
}: PosHeaderProps) {

  const headerRef = useRef<HTMLElement>(null);

  // ==========================================
  // FIXED HEADER HEIGHT
  // ==========================================

  useLayoutEffect(() => {
    const header = headerRef.current;

    const shell =
      header?.closest<HTMLElement>(
        ".dashboard-shell"
      );

    if (!header || !shell) return;

    const update = () => {
      shell.style.setProperty(
        "--pos-header-height",
        `${header.getBoundingClientRect().height}px`
      );
    };

    update();

    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(update);

    observer?.observe(header);

    window.addEventListener("resize", update);

    return () => {
      observer?.disconnect();

      window.removeEventListener(
        "resize",
        update
      );

      shell.style.removeProperty(
        "--pos-header-height"
      );
    };
  }, []);

  // ==========================================
  // CHECK ACTIVE MODAL
  // ==========================================

  const hasActiveModal = useCallback(() => {
    return Boolean(
      document.querySelector(
        '[aria-modal="true"]:not([data-state="closed"])'
      )
    );
  }, []);

  // ==========================================
  // FOCUS SEARCH INPUT
  // ==========================================

  const focusSearch = useCallback(() => {
    const input =
      searchInputRef.current ??
      document.querySelector<HTMLInputElement>(
        "#billing-search-input"
      );

    input?.focus({
      preventScroll: true,
    });
  }, [searchInputRef]);

  // ==========================================
  // F2 SHORTCUT - ONLY FOCUS SEARCH
  // ==========================================

  useEffect(() => {
    const handleF2 = (
      event: KeyboardEvent
    ) => {
      if (
        event.key !== "F2" ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.repeat
      ) {
        return;
      }

      if (hasActiveModal()) return;

      event.preventDefault();
      event.stopPropagation();

      // Only focus the search input.
      // Do not open the virtual keyboard.

      focusSearch();
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
  }, [focusSearch, hasActiveModal]);

  // ==========================================
  // TOUCH SEARCH INPUT
  // ==========================================

  const handleSearchPointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (hasActiveModal()) return;

    const target = event.target;

    // Only trigger when interacting with
    // the actual search input.

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const isTouchInteraction =
      event.pointerType === "touch" ||
      event.pointerType === "pen";

    const isTouchOrientedDevice =
      window.matchMedia(
        "(pointer: coarse) and (hover: none)"
      ).matches;

    // Open keyboard for touch interaction.
    // Never close an already opened keyboard.

    if (
      (isTouchInteraction || isTouchOrientedDevice) &&
      !isKeyboardOpen
    ) {
      onToggleKeyboard();
    }
  };

  // ==========================================
  // MANUAL KEYBOARD BUTTON
  // ==========================================

  const handleKeyboardButton = () => {
    if (hasActiveModal()) return;

    onToggleKeyboard();

    focusSearch();
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const handleClearSearch = () => {
    onClearSearch();

    focusSearch();
  };

  // ==========================================
  // HEADER UI
  // ==========================================

  return (
    <Header
      headerRef={headerRef}
      variant="billing"
      title="GRAND HORIZON"
      titleClassName="sr-only"
      className="urqr-billing-header"

      logo={
        <div className="flex items-center gap-2 -ml-2 sm:-ml-1">

          <IconButton
            label="Toggle navigation"

            icon={
              <PosIcon
                name="menu"
                size={20}
              />
            }

            variant="ghost"
            size="md"

            className="urqr-billing-menu-button !h-10 !w-10 rounded-lg text-text hover:bg-surface-alt transition-colors"

            aria-expanded={menuOpen}
            aria-controls="pos-sidebar"

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

        </div>
      }

      center={
        <div className="urqr-billing-search flex w-full min-w-0 items-center gap-2">

          <div
            className="min-w-0 flex-1"
            onPointerDown={handleSearchPointerDown}
          >

            <SearchInput
              id="billing-search-input"

              ref={searchInputRef}

              value={searchText}

              onChange={(event) =>
                onSearchChange(event.target.value)
              }

              onClear={handleClearSearch}

              placeholder="Search items"

              shortcutHint="F2"

              aria-label="Search catalog products"

              fieldSize="sm"

              inputMode="none"

              autoComplete="off"
            />

          </div>

          {/* Manual virtual keyboard button */}

          <IconButton
            label={
              isKeyboardOpen
                ? "Hide touch keyboard"
                : "Open touch keyboard"
            }

            icon={
              <PosIcon
                name="keyboard"
                size={20}
                aria-hidden="true"
              />
            }

            variant={
              isKeyboardOpen
                ? "primary"
                : "outline"
            }

            size="md"

            className="shrink-0 !h-10 !w-10"

            aria-pressed={isKeyboardOpen}

            onClick={handleKeyboardButton}
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

export default PosHeader;
