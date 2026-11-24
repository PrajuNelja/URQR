// src/components/Header/Header.config.ts
import type { HeaderVariant } from "./Header.types";

// ═══════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════

export const headerConfig = {
  // Spec: 72px height, border-b border-border, bg-surface, flat
  base: "flex justify-between items-center gap-3 h-[72px] border-b border-border bg-surface px-6 shrink-0",
  
  left: "flex items-center gap-3",
  
  titleBlock: "flex flex-col leading-tight",
  title: "font-sans text-[18px] font-bold text-text", // Spec: 18/22 Bold
  subtitle: "font-sans text-[14px] font-medium text-text-secondary", // Spec: 14/20
  
  nav: "flex items-center gap-2",
  
  // Spec: Default state transparent, hover text-text
  navItem: "px-3.5 py-1.5 rounded-md text-[13px] font-semibold cursor-pointer border border-transparent text-text-secondary hover:text-text transition-colors duration-200",
  
  // Spec: Active state bg-primary, text-on-primary
  navItemActive: "px-3.5 py-1.5 rounded-md text-[13px] font-semibold cursor-pointer bg-primary text-on-primary border-primary transition-colors duration-200",
  
  actions: "flex items-center gap-2",
} as const;

export const HEADER_VARIANTS: Record<HeaderVariant, string> = {
  dashboard: "",
  billing: "",
  plain: "",
};

// ═══════════════════════════════════════════
// TABS (Category Pills)
// ═══════════════════════════════════════════

export const tabsConfig = {
  wrapper: "flex gap-2 flex-wrap my-3",
  
  // Spec: border-border, text-text, hover border-primary
  item: "cursor-pointer px-3.5 py-1.5 border border-border rounded-full text-xs font-semibold bg-transparent text-text transition-colors duration-200 hover:border-primary",
  
  // Spec: bg-primary, text-on-primary
  itemActive: "cursor-pointer px-3.5 py-1.5 border border-primary rounded-full text-xs font-semibold bg-primary text-on-primary transition-colors duration-200",
} as const;

// ═══════════════════════════════════════════
// SELECTABLE GROUP (Payment Methods)
// ═══════════════════════════════════════════

export const selectableGroupConfig = {
  wrapper: "flex w-full gap-2",
  
  // Spec: bg-surface, border-border, text-text
  item: "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-semibold cursor-pointer border border-border bg-surface text-text transition-colors duration-200 hover:bg-surface-alt whitespace-nowrap",
  
  // Spec: bg-primary, text-on-primary
  itemActive: "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-semibold cursor-pointer border border-primary bg-primary text-on-primary whitespace-nowrap",
} as const;

// ═══════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════

export const appShellConfig = {
  wrapper: "min-h-screen bg-bg flex flex-col", // Spec: bg-bg
  main: "px-6 pt-6 pb-24 mx-auto w-full flex-1", // Added flex-1 to fill height
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