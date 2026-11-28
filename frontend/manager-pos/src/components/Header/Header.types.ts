
import type { ReactNode, Ref } from "react";

// Header variants
export type HeaderVariant =
  | "dashboard"
  | "billing"
  | "plain";

// Navigation item
export interface HeaderNavItem {
  key: string;
  label: string;
}

// Reusable Header props
export interface HeaderProps {
  headerRef?: Ref<HTMLElement>;
  variant?: HeaderVariant;

  // Left side
  title: string;
  subtitle?: string;
  logo?: ReactNode;

  // Center: search or other content
  center?: ReactNode;

  // Existing navigation
  navItems?: HeaderNavItem[];
  activeNav?: string;
  onNavChange?: (key: string) => void;

  // Right side: status, date, actions
  actions?: ReactNode;

  // Additional styling
  titleClassName?: string;
  className?: string;
}

// Category tabs
export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

// Selectable payment group
export interface SelectableOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SelectableGroupProps {
  options: SelectableOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
  className?: string;
}

// Page layout wrapper
export interface AppShellProps {
  header?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}
