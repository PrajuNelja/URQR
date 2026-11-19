// src/components/Logo/Logo.types.ts

export type LogoSize = "sm" | "md" | "lg";
export type LogoVariant = "solid" | "outline";

export interface LogoProps {
  /** Size preset (default: 'md') */
  size?: LogoSize;
  /** Style: solid (dark bg) or outline (transparent) — default: 'solid' */
  variant?: LogoVariant;
  /** Show brand text next to badge (default: true) */
  showText?: boolean;
  /** Brand name (default: 'GRAND HORIZON') */
  label?: string;
  /** Subtitle under brand name (default: 'Operations Dashboard') */
  subLabel?: string;
  /** Extra classes on wrapper */
  className?: string;
}