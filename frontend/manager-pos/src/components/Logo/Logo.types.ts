// src/components/Logo/Logo.types.ts

export interface LogoProps {
  /** Size of the logo */
  size?: "sm" | "md" | "lg";
  /** Whether to show the text alongside the icon */
  showText?: boolean;
  /** Custom class name for overriding styles */
  className?: string;
}