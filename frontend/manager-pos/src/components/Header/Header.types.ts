// src/components/Header/Header.types.ts
import type { ReactNode } from "react";

export type HeaderVariant = "dashboard" | "billing" | "plain";

export interface HeaderNavItem {
  key: string;
  label: string;
}

export interface HeaderProps {
  variant?: HeaderVariant;
  title: string;
  subtitle?: string;
  logo?: ReactNode;
  navItems?: HeaderNavItem[];
  activeNav?: string;
  onNavChange?: (key: string) => void;
  actions?: ReactNode;
  className?: string;
}

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

export interface AppShellProps {
  header?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}