
import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "@tanstack/react-router";

import { PosHeader } from "../Header/PosHeader";
import { PosSidebar } from "../SideBar/PosSidebar";

import {
  PosLayoutContext,
} from "./PosLayoutContext";

import type {
  PosPageHeader,
} from "./PosLayoutContext";

import "../../Styles/PosNavigation.css";

const noop = () => {};

export default function PosLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [pageHeader, setPageHeader] =
    useState<PosPageHeader | null>(null);

  const fallbackSearchRef =
    useRef<HTMLInputElement>(null);

  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const isBilling =
    pathname === "/pos/billing" ||
    pathname === "/pos/billing/";

  const context = useMemo(
    () => ({
      setPageHeader,
      sidebarCollapsed,
      setSidebarCollapsed,
    }),
    [sidebarCollapsed]
  );

  return (
    <PosLayoutContext.Provider value={context}>
      <div
        className={`dashboard-shell pos-shared-layout ${
          isBilling
            ? "urqr-billing-screen"
            : "urqr-dashboard-screen antialiased"
        }${
          sidebarCollapsed
            ? " dashboard-shell--collapsed"
            : ""
        }`}
      >
        {/* Persistent Header */}

        <PosHeader
          searchText={pageHeader?.searchText ?? ""}
          onSearchChange={
            pageHeader?.onSearchChange ?? noop
          }
          searchInputRef={
            pageHeader?.searchInputRef ??
            fallbackSearchRef
          }
          onClearSearch={
            pageHeader?.onClearSearch ?? noop
          }
          isKeyboardOpen={
            pageHeader?.isKeyboardOpen ?? false
          }
          onToggleKeyboard={
            pageHeader?.onToggleKeyboard ?? noop
          }
          onMenuClick={() => {
            if (!pageHeader?.navigationLocked) {
              setSidebarCollapsed(
                (previous) => !previous
              );
            }
          }}
          menuOpen={!sidebarCollapsed}
        />

        {/* Persistent Sidebar */}

        <PosSidebar
          collapsed={sidebarCollapsed}
        />

        {/* Only page content changes */}

        <Outlet />
      </div>
    </PosLayoutContext.Provider>
  );
}
