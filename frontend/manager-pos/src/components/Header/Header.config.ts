// src/components/Header/Header.config.ts
// All configs for the Header folder: Header, Tabs, SelectableGroup, AppShell

import type { HeaderVariant } from "./Header.types";

// ═══════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════

export const headerConfig = {
  /** Outer wrapper — matches reference `.top` */
  base: "flex justify-between items-center gap-3 flex-wrap mb-[18px]",

  /** Left section (logo + title) */
  left: "flex items-center gap-3",

  /** Title block */
  titleBlock: "flex flex-col leading-tight",
  title: "font-serif text-[17px] font-bold text-primary",
  subtitle:
    "text-[11px] font-medium tracking-[0.1em] text-text-muted uppercase",

  /** Nav container */
  nav: "flex items-center gap-2",

  /** Nav link (default) */
  navItem:
    "px-3.5 py-2 rounded-md text-[13px] font-bold cursor-pointer border border-transparent transition-all duration-200 hover:text-accent-gold",

  /** Nav link (active) */
  navItemActive:
    "px-3.5 py-2 rounded-md text-[13px] font-bold cursor-pointer bg-primary text-button-text border-primary shadow-ivory",

  /** Right actions */
  actions: "flex items-center gap-2",
} as const;

export const HEADER_VARIANTS: Record<HeaderVariant, string> = {
  dashboard: "",
  billing: "",
  plain: "",
};

// ═══════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════

export const tabsConfig = {
  /** Container */
  wrapper: "flex gap-2 flex-wrap my-3",

  /** Tab pill (default) */
  item: "cursor-pointer px-3.5 py-1.5 border border-border-subtle rounded-full text-xs font-bold bg-transparent text-primary transition-all duration-200 hover:border-accent-gold hover:text-accent-gold",

  /** Tab pill (active) */
  itemActive:
    "cursor-pointer px-3.5 py-1.5 border border-primary rounded-full text-xs font-bold bg-primary text-button-text shadow-ivory",
} as const;

// ═══════════════════════════════════════════
// SELECTABLE GROUP
// ═══════════════════════════════════════════

export const selectableGroupConfig = {
  /** Container — pure flex, stretch full width */
  wrapper: "flex w-full gap-2",

  /** Option (default) */
  item: "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-bold cursor-pointer border border-border-subtle bg-transparent text-primary transition-all duration-200 hover:border-accent-gold whitespace-nowrap",

  /** Option (active) */
  itemActive:
    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-bold cursor-pointer border border-primary bg-primary text-button-text shadow-ivory whitespace-nowrap",
} as const;

// ═══════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════

export const appShellConfig = {
  wrapper: "min-h-screen bg-[#f6efdf]",
  main: "px-5 pt-5 pb-24 mx-auto w-full",
} as const;

export const APP_SHELL_MAX_WIDTH: Record<
  NonNullable<import("./Header.types").AppShellProps["maxWidth"]>,
  string
> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-[1500px]",
  full: "max-w-none",
};