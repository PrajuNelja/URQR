// src/components/VirtualKeyboard/VirtualKeyboard.config.ts

export const keyboardConfig = {
  wrapper:
    "fixed bottom-0 left-0 right-0 z-[100] bg-surface border-t border-border-subtle shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] p-4 pb-8 animate-[slideUp_0.3s_ease-out]",
  container: "max-w-4xl mx-auto flex flex-col gap-2",
  row: "flex justify-center gap-2",
  
  // Key styles
  keyBase:
    "flex items-center justify-center rounded-md font-sans font-bold text-primary transition-all duration-100 select-none cursor-pointer border border-border-subtle bg-app-bg hover:bg-accent-gold/10 active:bg-accent-gold/20 active:scale-95 shadow-sm",
  
  // Specific key sizes
  keyChar: "h-12 w-10 text-lg",
  keySpecial: "h-12 px-4 text-sm bg-surface border-primary/20 text-text-muted hover:text-primary",
  keyAction: "h-12 px-6 text-sm bg-primary text-button-text border-primary hover:brightness-110 shadow-ivory",
  keySpace: "h-12 flex-1 text-sm bg-surface",

  // Animations
  animations: `
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `,
};