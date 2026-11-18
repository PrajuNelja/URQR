// src/components/Header/Header.config.ts

export const headerConfig = {
  base: "flex items-center justify-between w-full bg-surface border-b border-border-subtle px-6 py-4",
  variants: {
    dashboard: {
      container: "py-4",
      title: "text-2xl font-serif font-bold text-primary",
      subtitle: "text-sm text-text-muted mt-1",
    },
    billing: {
      container: "py-3",
      title: "text-xl font-serif font-semibold text-primary",
      subtitle: "text-xs text-text-muted mt-0.5",
    },
    compact: {
      container: "py-2 px-4",
      title: "text-lg font-sans font-semibold text-primary",
      subtitle: "hidden",
    },
  },
};