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
  "bg-surface border border-border-subtle rounded-md shadow-ivory transition-colors";

/** Padding presets */
export const CARD_PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-[18px]",
};

/** Visual variants */
export const CARD_VARIANTS: Record<CardVariant, string> = {
  default: "bg-surface border border-border-subtle",
  outline: "bg-transparent border border-border-subtle",
  elevated: "bg-surface border border-border-subtle shadow-md",
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
  base: "bg-surface border border-border-subtle rounded-md shadow-ivory p-[18px]",

  /** Header row (icon + title) */
  header: "flex items-center gap-3 mb-3",

  /** Circular icon wrapper (gold accent on ivory) */
  iconWrapper:
    "w-12 h-12 rounded-full bg-app-bg text-accent-gold flex items-center justify-center flex-none",

  /** Title */
  title: "font-serif text-lg text-primary m-0",

  /** Body */
  body: "",

  /** Summary variant (big value + trend) */
  summary: {
    value: "font-serif text-3xl font-bold text-primary leading-tight",
    trend: "inline-block text-xs font-semibold text-success-text mt-1",
  },
} as const;

// ═══════════════════════════════════════════
// KPI STAT
// ═══════════════════════════════════════════

export const kpiStatConfig = {
  wrapper:
    "bg-surface border border-border-subtle rounded-md shadow-ivory p-5 flex items-center gap-4",

  iconWrapper:
    "w-12 h-12 rounded-full bg-app-bg text-accent-gold flex items-center justify-center flex-none",

  textCol: "flex flex-col leading-tight",

  label: "text-[13px] font-medium text-text-muted",

  value: "font-serif text-3xl font-bold text-primary mt-0.5",

  trend: {
    up: "inline-block text-xs font-semibold text-success-text mt-1",
    down: "inline-block text-xs font-semibold text-error-text mt-1",
    neutral: "inline-block text-xs font-semibold text-text-muted mt-1",
  },
} as const;

// ═══════════════════════════════════════════
// CHART (Recharts)
// ═══════════════════════════════════════════

/** Chart palette (Recharts expects actual color strings or CSS vars) */
export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
] as const;

export const CHART_WRAPPER = "w-full";

export const CHART_AXIS_TEXT = "#8B857D";
export const CHART_GRID_COLOR = "#E5E1D8";

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E1D8",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#2A2118",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
} as const;

// ═══════════════════════════════════════════
// DIVIDER
// ═══════════════════════════════════════════

export const dividerConfig = {
  horizontal: {
    solid: "w-full border-t border-border-subtle",
    dashed: "w-full border-t border-dashed border-border-subtle",
  },
  vertical: {
    solid: "h-full border-l border-border-subtle",
    dashed: "h-full border-l border-dashed border-border-subtle",
  },
  label: "px-3 text-xs font-semibold text-text-muted uppercase tracking-wider",
} as const;

// ═══════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════

export const emptyStateConfig = {
  wrapper: "flex flex-col items-center justify-center py-8 px-4 text-center gap-2",
  icon: "text-text-muted opacity-60 mb-1",
  message: "text-sm font-semibold text-primary",
  description: "text-xs text-text-muted",
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
  "rounded-full bg-primary text-button-text flex items-center justify-center font-semibold flex-none overflow-hidden";