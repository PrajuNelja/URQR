// src/components/Logo/Logo.config.ts

import type { LogoVariant } from "./Logo.types";

export const logoConfig = {
  base: "flex items-center gap-3 select-none",

  /** Badge visual style */
  variants: {
    solid: "bg-primary text-surface border border-primary",
    outline: "bg-transparent text-primary border border-border-subtle",
  } as Record<LogoVariant, string>,

  icon: {
    wrapper:
      "flex items-center justify-center rounded-md flex-none",
    star: "text-current",
  },

  text: {
    wrapper: "flex flex-col leading-tight",
    brand: "font-serif font-semibold tracking-widest text-primary",
    subtitle: "font-sans tracking-widest text-text-muted uppercase",
  },

  sizes: {
    sm: {
      wrapper: "w-9 h-9",
      star: "w-4 h-4",
      brand: "text-sm",
      subtitle: "text-[10px]",
    },
    md: {
      wrapper: "w-11 h-11",
      star: "w-5 h-5",
      brand: "text-base",
      subtitle: "text-[11px]",
    },
    lg: {
      wrapper: "w-14 h-14",
      star: "w-6 h-6",
      brand: "text-lg",
      subtitle: "text-xs",
    },
  },
};