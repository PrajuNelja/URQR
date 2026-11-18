// src/components/Logo/Logo.config.ts

export const logoConfig = {
  base: "flex items-center gap-3 select-none",
  icon: {
    wrapper: "flex items-center justify-center bg-primary text-surface rounded-sm",
    star: "text-surface",
  },
  text: {
    wrapper: "flex flex-col",
    brand: "font-serif font-semibold tracking-widest text-primary",
    subtitle: "font-sans tracking-widest text-text-muted uppercase",
  },
  sizes: {
    sm: {
      wrapper: "w-8 h-8",
      star: "w-4 h-4",
      brand: "text-sm",
      subtitle: "text-[10px]",
    },
    md: {
      wrapper: "w-10 h-10",
      star: "w-5 h-5",
      brand: "text-base",
      subtitle: "text-xs",
    },
    lg: {
      wrapper: "w-12 h-12",
      star: "w-6 h-6",
      brand: "text-lg",
      subtitle: "text-sm",
    },
  },
};