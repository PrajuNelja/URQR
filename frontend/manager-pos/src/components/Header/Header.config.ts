
import type {
  HeaderVariant,
  AppShellProps,
} from "./Header.types";

// SHARED HEADER STYLES
export const headerConfig = {
  base:
    "flex justify-between items-center gap-3 flex-wrap mb-[18px]",

  left:
    "flex items-center gap-3",

  titleBlock:
    "flex flex-col leading-tight",

  title:
    "font-serif text-[17px] font-bold text-primary",

  subtitle:
    "text-[11px] font-medium tracking-[0.1em] text-text-muted uppercase",

  nav:
    "flex items-center gap-2",

  navItem:
    "px-3.5 py-2 rounded-md text-[13px] font-bold cursor-pointer border border-transparent transition-all duration-200 hover:text-accent-gold",

  navItemActive:
    "px-3.5 py-2 rounded-md text-[13px] font-bold cursor-pointer bg-primary text-button-text border-primary shadow-ivory",

  actions:
    "flex items-center gap-2",
} as const;

// VARIANT-SPECIFIC LAYOUT
export const HEADER_VARIANTS: Record<
  HeaderVariant,
  string
> = {
  dashboard: "",
  billing:
    "!mb-0 min-h-16 w-full border-b border-border-subtle bg-surface px-4 py-3 lg:px-7",
  plain: "",
};

// CATEGORY TABS
export const tabsConfig = {
  wrapper:
    "flex gap-2 flex-wrap my-3",

  item:
    "cursor-pointer px-3.5 py-1.5 border border-border-subtle rounded-full text-xs font-bold bg-transparent text-primary transition-all duration-200 hover:border-accent-gold hover:text-accent-gold",

  itemActive:
    "cursor-pointer px-3.5 py-1.5 border border-primary rounded-full text-xs font-bold bg-primary text-button-text shadow-ivory",
} as const;

// SELECTABLE GROUP
export const selectableGroupConfig = {
  wrapper:
    "flex w-full gap-2",

  item:
    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-bold cursor-pointer border border-border-subtle bg-transparent text-primary transition-all duration-200 hover:border-accent-gold whitespace-nowrap",

  itemActive:
    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-bold cursor-pointer border border-primary bg-primary text-button-text shadow-ivory whitespace-nowrap",
} as const;

// APP SHELL
export const appShellConfig = {
  wrapper: "min-h-screen bg-[#f6efdf]",
  main: "px-5 pt-5 pb-24 mx-auto w-full",
} as const;

export const APP_SHELL_MAX_WIDTH: Record<
  NonNullable<AppShellProps["maxWidth"]>,
  string
> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-[1500px]",
  full: "max-w-none",
};
