// src/components/InputField/InputField.config.ts
export const inputFieldConfig = {
  baseWrapper: "flex flex-col gap-1.5 w-full",
  label: "text-sm font-medium font-sans text-primary",
  
  inputWrapper: {
    base: "relative flex items-center w-full bg-surface border transition-colors duration-200",
    focus: "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
    default: "border-border-subtle hover:border-text-muted",
    error: "border-red-500 focus-within:ring-red-500/20 focus-within:border-red-500",
    disabled: "bg-app-bg cursor-not-allowed opacity-70",
  },

  input: {
  base: "w-full bg-transparent outline-none text-primary font-sans placeholder:text-text-muted/70",
  padding: {
      none: "px-3",
      leftIcon: "pl-9 pr-3",
      rightIcon: "pl-3 pr-9",
      bothIcons: "px-9",
    },
  },

  icon: {
    base: "absolute text-text-muted",
    left: "left-2.5",
    right: "right-2.5",
    clickable: "cursor-pointer hover:text-primary transition-colors",
  },

  // --- UPDATED STEPPER CONFIG ---
  stepper: {
    // Flex container to align buttons and number horizontally
    wrapper: "flex items-center justify-start gap-4",
    
    // Square button styling (matches the image)
    button: "flex items-center justify-center w-10 h-10 bg-surface border border-border-subtle rounded-sm text-primary hover:border-text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
    
    // Number input styling (no border, no background, centered text)
    input: "w-10 text-center bg-transparent outline-none text-primary font-sans font-semibold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  },

  sizes: {
    sm: {
      inputWrapper: "h-8 rounded-sm",
      input: "text-xs h-full",
      icon: "w-3.5 h-3.5",
    },
    md: {
      inputWrapper: "h-10 rounded-md",
      input: "text-base h-full",
      icon: "w-4 h-4",
    },
    lg: {
      inputWrapper: "h-12 rounded-lg",
      input: "text-lg h-full",
      icon: "w-5 h-5",
    },
  },

  message: {
    base: "text-xs font-sans mt-1",
    error: "text-red-500",
    helper: "text-text-muted", 
  },
};