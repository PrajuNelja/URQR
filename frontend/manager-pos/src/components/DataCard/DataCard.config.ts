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
  "bg-surface border border-border rounded-lg shadow-sm transition-colors";

/** Padding presets */
export const CARD_PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-[18px]",
};

/** Visual variants */
export const CARD_VARIANTS: Record<CardVariant, string> = {
  default: "bg-surface border-border",
  outline: "!bg-transparent border-border",
  elevated: "bg-surface border-border shadow-md",
};

/** Hover behaviour for interactive cards */
export const CARD_INTERACTIVE =
  "cursor-pointer transition-transform hover:-translate-y-[3px] hover:border-primary/50";

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
  /** Wrapper */
  base: "!bg-surface border !border-border rounded-lg shadow-sm p-[18px]",

  /** Header row (icon + title) */
  header: "flex items-center gap-3 mb-3",

  /** Circular icon wrapper */
  iconWrapper:
    "w-12 h-12 rounded-full bg-surface-alt text-primary flex items-center justify-center flex-none",

  /** Title */
  title: "font-serif text-lg text-text m-0",

  /** Body */
  body: "",

  /** Summary variant (big value + trend) */
  summary: {
    value: "font-serif text-3xl font-bold text-text leading-tight",
    trend: "inline-block text-xs font-semibold text-success mt-1",
  },
} as const;

// ═══════════════════════════════════════════
// KPI STAT
// ═══════════════════════════════════════════

export const kpiStatConfig = {
  wrapper:
    "!bg-surface border !border-border rounded-lg shadow-sm p-5 flex items-center gap-4",

  iconWrapper:
    "w-12 h-12 rounded-full bg-surface-alt text-primary flex items-center justify-center flex-none",

  textCol: "flex flex-col leading-tight",

  label: "text-[13px] font-medium text-text-secondary",

  value: "font-serif text-3xl font-bold text-text mt-0.5",

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
  "var(--primary)",
  "var(--primary-dark)",
  "var(--warning)",
  "var(--success)",
  "var(--error)",
] as const;

export const CHART_WRAPPER = "w-full";

export const CHART_AXIS_TEXT = "var(--text-secondary)";
export const CHART_GRID_COLOR = "var(--border)";

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--text)",
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
  message: "text-sm font-semibold text-text",
  description: "text-xs text-text-secondary",
} as const;

// ═══════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════

// 1. We remove the width/height from here and put them in the component 
// so they can't be overridden by flexbox.
export const AVATAR_SIZES: Record<AvatarSize, string> = {
  sm: "text-[12px]",
  md: "text-[14px]",
  lg: "text-[16px]",
};

export const AVATAR_BASE =
  "rounded-full bg-primary text-on-primary font-semibold overflow-hidden tracking-tight";