
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import {
  LayoutDashboard,
  LogOut,
  ReceiptText,
  X,
} from "lucide-react";

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

  const clearAuth = useAuthStore(
    (state) => state.clearAuth
  );

  const sidebarRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // =====================================
  // SIDEBAR FOCUS AND KEYBOARD HANDLING
  // =====================================
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow =
      document.body.style.overflow;

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

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;

      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  // =====================================
  // EXISTING LOGOUT FUNCTIONALITY
  // =====================================
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
      {/* OVERLAY */}
      <button
        type="button"
        className="
          urqr-billing-backdrop
          absolute inset-0 bg-black/40
        "
        aria-label="Close navigation"
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Billing navigation"
        className="
          urqr-billing-drawer-panel
          absolute inset-y-0 left-0
          flex w-[350px] max-w-[90vw]
          flex-col
          bg-surface px-6 py-6 shadow-xl
        "
      >
        {/* =====================================
            HOTEL NAME AND CLOSE BUTTON
        ===================================== */}
        <div
          className="
            urqr-billing-drawer-head
            flex items-center
            justify-between gap-3
            border-b border-border pb-6
          "
        >
          <h2
            className="
              text-[19px] font-bold
              tracking-wide text-text
            "
          >
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

        {/* =====================================
            TOP NAVIGATION
        ===================================== */}
        <nav
          aria-label="Main navigation"
          className="
            urqr-billing-drawer-links
            mt-6 flex flex-col gap-3
          "
        >
          {/* BILLING */}
          <Link
            to="/pos/billing"
            aria-current="page"
            onClick={onClose}
            className="
              flex min-h-[54px]
              items-center !justify-start
              !gap-[3px]
              rounded-xl bg-primary
              px-4 py-3
              text-[15px] font-semibold
              !text-white
            "
          >
            <ReceiptText
              size={21}
              className="shrink-0"
              aria-hidden="true"
            />

            <span>Billing</span>
          </Link>

          {/* DASHBOARD */}
          <Link
            to="/dashboard"
            onClick={onClose}
            className="
              flex min-h-[54px]
              items-center !justify-start
              !gap-[3px]
              rounded-xl px-4 py-3
              text-[15px] font-medium
              text-text
              hover:bg-surface-alt
            "
          >
            <LayoutDashboard
              size={21}
              className="shrink-0"
              aria-hidden="true"
            />

            <span>Dashboard</span>
          </Link>
        </nav>

        {/* =====================================
            BOTTOM LOGOUT SECTION

            ADDED:
            - Proper icon/text alignment
            - 3px icon/text spacing
            - 16px extra bottom spacing
        ===================================== */}
        <div
          className="
            urqr-billing-drawer-bottom
            mt-auto
            border-t border-border
            !pt-5 !pb-4
          "
        >
          {/* EXISTING REUSABLE BUTTON */}
          <Button
            type="button"
            variant="ghost"
            fullWidth
            className="
              !flex !min-h-[54px]
              !w-full
              !items-center !justify-start
              !rounded-xl
              !bg-surface-alt
              !px-4 !py-3
              !text-[15px]
              !font-semibold !text-text
              hover:!bg-surface-alt
              hover:!translate-y-0
            "
            onClick={handleLogout}
          >
            {/* ICON AND TEXT AS ONE GROUP */}
            <span
              className="
                inline-flex items-center
                justify-start gap-[3px]
              "
            >
              <LogOut
                size={21}
                className="shrink-0"
                aria-hidden="true"
              />

              <span>Logout</span>
            </span>
          </Button>
        </div>
      </aside>
    </div>
  );
}

export default BillingSidebar;
