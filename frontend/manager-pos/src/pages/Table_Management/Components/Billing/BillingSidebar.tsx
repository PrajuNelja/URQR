
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Hotel,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react";

import { IconButton } from "../../../../components/Buttons/IconButton";
import { DesktopWindowControls } from "../../../../components/Header/DesktopWindowControls";

interface BillingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingSidebar({
  isOpen,
  onClose,
}: BillingSidebarProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key !== "Tab") return;

      const focusable =
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );

      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/40"
        aria-label="Close navigation"
        onClick={onClose}
      />

      <aside
        ref={sidebarRef}
        id="billing-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="POS navigation"
        className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-border bg-surface p-4 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-text">
            <Hotel size={22} aria-hidden="true" />
            <span className="font-semibold">
              Grand Horizon
            </span>
          </div>

          <IconButton
            ref={closeRef}
            label="Close navigation"
            icon={<X size={18} />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </div>

        <nav
          className="mt-5 flex flex-col gap-2"
          aria-label="Main navigation"
        >
          <Link
            to="/pos/billing"
            onClick={onClose}
            aria-current="page"
            className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold !text-white"
          >
            <ReceiptText size={19} aria-hidden="true" />
            POS Billing
          </Link>

          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-text hover:bg-surface-alt"
          >
            <LayoutDashboard size={19} aria-hidden="true" />
            Dashboard
          </Link>
        </nav>

        <div className="mt-auto space-y-4 border-t border-border pt-4">
          {/* Preserve existing kiosk and bridge functions */}
          <div className="overflow-x-auto">
            <DesktopWindowControls />
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-surface-alt px-3 py-3">
            <UserRound size={21} aria-hidden="true" />
            <span className="text-sm font-medium text-text">
              Manager profile
            </span>
          </div>

          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text hover:bg-surface-alt"
          >
            <LogOut size={19} aria-hidden="true" />
            Logout
          </Link>
        </div>
      </aside>
    </div>
  );
}
