// src/components/VirtualKeyboard/VirtualKeyboard.types.ts

export interface VirtualKeyboardProps {
  /** Called when a key is pressed */
  onKeyPress: (key: string) => void;
  /** Called when the Enter/Return key is pressed */
  onEnter?: () => void;
  /** Called when the Backspace key is pressed */
  onBackspace?: () => void;
  /** Called when the Clear key is pressed */
  onClear?: () => void;
  /** Optional extra classes for the wrapper */
  className?: string;
  /** Whether to show the keyboard */
  isOpen?: boolean;
  value?:string;
}