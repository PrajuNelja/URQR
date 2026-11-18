// src/components/Buttons/Button.config.ts

export const buttonConfig = {
  base: "inline-flex items-center justify-center font-sans font-medium rounded-sm transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  variants: {
    primary: "bg-primary text-surface hover:bg-primary/90 border border-transparent",
    secondary: "bg-surface text-primary border border-border-subtle hover:bg-app-bg",
    outline: "bg-transparent text-primary border border-primary hover:bg-primary hover:text-surface",
    ghost: "bg-transparent text-text-muted hover:text-primary hover:bg-app-bg border border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
  },
  sizes: {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  },
};