// src/components/InputField/InputField.config.ts

export const inputFieldConfig = {
  wrapper: "flex flex-col gap-1.5",
  label: "text-xs font-bold text-text-muted tracking-widest uppercase",
  inputWrapper: "relative flex items-center",
  input: {
    base: "w-full bg-surface text-primary border border-border-subtle rounded-sm px-3 py-2 text-sm outline-none transition-colors placeholder:text-text-muted/70",
    focus: "focus:border-accent-gold focus:ring-1 focus:ring-accent-gold",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500",
    withLeftIcon: "pl-10",
    withRightIcon: "pr-10",
  },
  icon: {
    left: "absolute left-3 text-text-muted",
    right: "absolute right-3 text-text-muted cursor-pointer hover:text-primary transition-colors",
  },
  errorText: "text-xs text-red-500 mt-1",
};