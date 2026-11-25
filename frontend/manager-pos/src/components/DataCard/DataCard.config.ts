// src/components/DataCard/DataCard.config.ts
// All configs for the DataCard folder:
// Card, Icon, DataCard, KPIStat, Chart, Divider, EmptyState, Avatar

import type {
  CardPadding,
  CardVariant,
  IconSize,
  AvatarSize,
} from "./DataCard.types";

// ═══════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════

/** Always-applied base classes */
export const CARD_BASE_CLASSES =
  "bg-[#fffaf1] border border-[#e8d9bf] rounded-lg shadow-[0_2px_0_#e5d7bf] transition-colors";

/** Padding presets */
export const CARD_PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-[18px]",
};

/** Visual variants */
export const CARD_VARIANTS: Record<CardVariant, string> = {
  default: "bg-[#fffaf1] border-[#e8d9bf]",
  outline: "!bg-transparent border-[#e8d9bf]",
  elevated: "bg-[#fffaf1] border-[#e8d9bf] shadow-[0_4px_12px_rgba(74,54,30,0.08)]",
};

/** Hover behaviour for interactive cards */
export const CARD_INTERACTIVE =
  "cursor-pointer transition-transform hover:-translate-y-[3px] hover:border-accent-gold";

// ═══════════════════════════════════════════
// ICON
// ═══════════════════════════════════════════

/** Pixel sizes for icon presets */
export const ICON_SIZES: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

/** Default stroke width for lucide icons */
export const ICON_DEFAULT_STROKE = 1.8;

// ═══════════════════════════════════════════
// DATA CARD (composite)
// ═══════════════════════════════════════════

export const dataCardConfig = {
  /** Wrapper — matches reference `.card` */
  base: "!bg-[#fffaf1] border !border-[#e8d9bf] rounded-lg shadow-[0_2px_0_#e5d7bf] p-[18px]",

  /** Header row (icon + title) */
  header: "flex items-center gap-3 mb-3",

  /** Circular icon wrapper (gold accent on ivory) */
  iconWrapper:
    "w-12 h-12 rounded-full bg-white text-accent-gold flex items-center justify-center flex-none",

  /** Title */
  title: "font-serif text-lg text-primary m-0",

  /** Body */
  body: "",

  /** Summary variant (big value + trend) */
  summary: {
    value: "font-serif text-3xl font-bold text-primary leading-tight",
    trend: "inline-block text-xs font-semibold text-success mt-1",
  },
} as const;

// ═══════════════════════════════════════════
// KPI STAT
// ═══════════════════════════════════════════

export const kpiStatConfig = {
  wrapper:
    "!bg-[#fffaf1] border !border-[#e8d9bf] rounded-lg shadow-[0_2px_0_#e5d7bf] p-5 flex items-center gap-4",

  iconWrapper:
    "w-12 h-12 rounded-full bg-white text-accent-gold flex items-center justify-center flex-none",

  textCol: "flex flex-col leading-tight",

  label: "text-[13px] font-medium text-text-secondary",

  value: "font-serif text-3xl font-bold text-primary mt-0.5",

  trend: {
    up: "inline-flex w-fit items-center rounded-md bg-success-bg px-2 py-0.5 text-xs font-semibold text-success mt-1",
    down: "inline-flex w-fit items-center rounded-md bg-error-bg px-2 py-0.5 text-xs font-semibold text-error mt-1",
    neutral: "inline-flex w-fit items-center rounded-md bg-surface-alt px-2 py-0.5 text-xs font-semibold text-text-secondary mt-1",
  },
} as const;

// ═══════════════════════════════════════════
// CHART (Recharts)
// ═══════════════════════════════════════════

/** Chart palette (Recharts expects actual color strings or CSS vars) */
export const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-primary-dark)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-error)",
] as const;

export const CHART_WRAPPER = "w-full";

export const CHART_AXIS_TEXT = "var(--color-text-secondary)";
export const CHART_GRID_COLOR = "var(--color-border)";

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--color-text)",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
} as const;

// ═══════════════════════════════════════════
// DIVIDER
// ═══════════════════════════════════════════

export const dividerConfig = {
  horizontal: {
    solid: "w-full border-t border-border",
    dashed: "w-full border-t border-dashed border-border",
  },
  vertical: {
    solid: "h-full border-l border-border",
    dashed: "h-full border-l border-dashed border-border",
  },
  label: "px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider",
} as const;

// ═══════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════

export const emptyStateConfig = {
  wrapper: "flex flex-col items-center justify-center py-8 px-4 text-center gap-2",
  icon: "text-text-secondary opacity-60 mb-1",
  message: "text-sm font-semibold text-primary",
  description: "text-xs text-text-secondary",
} as const;

// ═══════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════

export const AVATAR_SIZES: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export const AVATAR_BASE =
  "rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold flex-none overflow-hidden";