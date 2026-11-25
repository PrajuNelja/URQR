
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, ReceiptText, X } from "lucide-react";

import { IconButton } from "../../../../components/Buttons/IconButton";
import { Button } from "../../../../components/Buttons/Button";
import { useAuthStore } from "../../../../lib/authStore";

interface BillingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingSidebar({
  isOpen,
  onClose,
}: BillingSidebarProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const sidebarRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements =
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );

      if (!elements?.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

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
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    clearAuth();
    onClose();

    void navigate({
      to: "/login",
      replace: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      id="urqr-billing-drawer"
      className="urqr-billing-drawer fixed inset-0 z-[100]"
    >
      {/* Overlay */}
      <button
        type="button"
        className="urqr-billing-backdrop absolute inset-0 bg-black/40"
        aria-label="Close navigation"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Billing navigation"
        className="
          urqr-billing-drawer-panel
          absolute inset-y-0 left-0
          flex w-[350px] max-w-[90vw] flex-col
          bg-surface px-6 py-6 shadow-xl
        "
      >
        {/* Hotel name and close button */}
        <div
          className="
            urqr-billing-drawer-head
            flex items-center justify-between gap-3
            border-b border-border pb-6
          "
        >
          <h2 className="text-[19px] font-bold tracking-wide text-text">
            GRAND HORIZON
          </h2>

          <IconButton
            ref={closeRef}
            label="Close navigation"
            icon={<X size={20} />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </div>

        {/* Top navigation */}
        <nav
          aria-label="Main navigation"
          className="urqr-billing-drawer-links mt-6 flex flex-col gap-3"
        >
          <Link
            to="/pos/billing"
            aria-current="page"
            onClick={onClose}
            className="
              flex min-h-[54px] items-center gap-4
              rounded-xl bg-primary px-4 py-3
              text-[15px] font-semibold !text-white
            "
          >
            <ReceiptText size={21} aria-hidden="true" />
            <span>Billing</span>
          </Link>

          <Link
            to="/dashboard"
            onClick={onClose}
            className="
              flex min-h-[54px] items-center gap-4
              rounded-xl px-4 py-3 text-[15px]
              font-medium text-text hover:bg-surface-alt
            "
          >
            <LayoutDashboard size={21} aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Bottom — Logout only */}
        <div
          className="
            urqr-billing-drawer-bottom
            mt-auto border-t border-border pt-5
          "
        >
          <Button
            type="button"
            variant="ghost"
            fullWidth
            leftIcon={<LogOut size={20} aria-hidden="true" />}
            className="
              !min-h-[50px] !justify-start !gap-4
              !rounded-xl !px-4 !text-[15px]
              !font-semibold !text-text
              hover:!bg-surface-alt
            "
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>
    </div>
  );
}
