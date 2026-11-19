// src/components/Header/Header.types.ts
// All types for the Header folder: Header, Tabs, SelectableGroup, AppShell

import type { ReactNode } from "react";

// ═══════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════

export type HeaderVariant = "dashboard" | "billing" | "plain";

export interface HeaderNavItem {
  /** Unique key (also used as active check) */
  key: string;
  /** Display label */
  label: string;
}

export interface HeaderProps {
  /** Visual variant (default: 'dashboard') */
  variant?: HeaderVariant;
  /** Title shown on the left (big serif) */
  title: string;
  /** Optional subtitle under title */
  subtitle?: string;
  /** Logo node (render <Logo /> here) */
  logo?: ReactNode;
  /** Center nav items (matches reference "Billing POS / Dashboard") */
  navItems?: HeaderNavItem[];
  /** Active nav key */
  activeNav?: string;
  /** Called when nav item clicked */
  onNavChange?: (key: string) => void;
  /** Right side content (buttons, avatar, logout) */
  actions?: ReactNode;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// TABS (category pills — Menu Catalog)
// ═══════════════════════════════════════════

export interface TabItem {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
}

export interface TabsProps {
  /** Tab options */
  items: TabItem[];
  /** Currently active key */
  value: string;
  /** Called on tab click */
  onChange: (key: string) => void;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// SELECTABLE GROUP (payment methods)
// ═══════════════════════════════════════════

export interface SelectableOption {
  /** Unique key / value */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon element */
  icon?: ReactNode;
}

export interface SelectableGroupProps {
  /** Options */
  options: SelectableOption[];
  /** Currently selected value */
  value: string;
  /** Called on select */
  onChange: (value: string) => void;
  /** Grid columns (default: auto-fit) */
  columns?: number;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// APP SHELL (layout wrapper)
// ═══════════════════════════════════════════

export interface AppShellProps {
  /** Header node */
  header?: ReactNode;
  /** Main content */
  children: ReactNode;
  /** Max width preset (default: 'xl') */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Extra classes on main */
  className?: string;
}