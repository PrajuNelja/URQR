// src/components/DataCard/DataCard.types.ts
// All types for the DataCard folder:
// Card, Icon, DataCard, KPIStat, Chart, Divider, EmptyState, Avatar

import type { ReactNode, ElementType, HTMLAttributes } from "react";

// ═══════════════════════════════════════════
// CARD (base surface)
// ═══════════════════════════════════════════

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardVariant = "default" | "outline" | "elevated";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** HTML element or component to render (default: 'div') */
  as?: ElementType;
  /** Inner padding preset */
  padding?: CardPadding;
  /** Visual variant */
  variant?: CardVariant;
  /** Adds hover lift + gold border (for clickable cards) */
  interactive?: boolean;
  /** Card content */
  children: ReactNode;
}

// ═══════════════════════════════════════════
// ICON (lucide-react wrapper)
// ═══════════════════════════════════════════

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconProps {
  /** Lucide icon name in PascalCase, e.g. "Eye", "IndianRupee", "Search" */
  name: string;
  /** Preset size or custom pixel number */
  size?: IconSize | number;
  /** Extra classes */
  className?: string;
  /** SVG stroke width (default: 1.8) */
  strokeWidth?: number;
  /** Custom color (defaults to currentColor) */
  color?: string;
}

// ═══════════════════════════════════════════
// DATA CARD (composite info/summary card)
// ═══════════════════════════════════════════

export type DataCardVariant = "summary" | "info" | "content";

export interface DataCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card style (default: 'summary') */
  variant?: DataCardVariant;
  /** Card title */
  title?: string;
  /** Big value shown for summary cards (e.g. "₹1,72,430") */
  value?: string;
  /** Trend chip, e.g. "↑ +14%" */
  trend?: string;
  /** Icon shown in header */
  icon?: ReactNode;
  /** Card body content (for info/content variants) */
  children?: ReactNode;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// KPI STAT (dashboard metric card)
// ═══════════════════════════════════════════

export type KPITrend = "up" | "down" | "neutral";

export interface KPIStatProps {
  /** Metric label, e.g. "Total Revenue" */
  label: string;
  /** Metric value, e.g. "₹1,73,332" or 897 */
  value: string | number;
  /** Trend text, e.g. "+14%" */
  trend?: string;
  /** Trend direction (default: 'up') */
  trendDirection?: KPITrend;
  /** Icon element (rendered in gold circle) */
  icon?: ReactNode;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// CHART (recharts wrapper)
// ═══════════════════════════════════════════

export type ChartType = "bar" | "line" | "area" | "pie";

export type ChartLayout = "horizontal" | "vertical";

export interface ChartSeries {
  /** Data key in each row */
  key: string;
  /** Human-readable label (legend / tooltip) */
  name: string;
  /** Bar/line color (hex or CSS var). If omitted, palette cycles. */
  color?: string;
}

export interface ChartProps {
  /** Chart type */
  type: ChartType;
  /** Array of data rows */
  data: Record<string, unknown>[];
  /** X-axis data key (or category key for vertical/pie) */
  xKey: string;
  /** Series to plot (bar/line/area). For pie: use `pieDataKey`. */
  series?: ChartSeries[];
  /** For pie chart: data key holding the numeric value */
  pieDataKey?: string;
  /** For pie chart: data key holding the label */
  pieNameKey?: string;
  /** Recharts layout; 'vertical' renders horizontal bars (default: 'vertical') */
  layout?: ChartLayout;
  /** Chart height in px (default: 240) */
  height?: number;
  /** Show chart grid lines (default: false for bar charts, true otherwise) */
  showGrid?: boolean;
  /** Show values at the end of bars (default: true) */
  showValues?: boolean;
  /** Show tooltip (default: true) */
  showTooltip?: boolean;
  /** Show legend (default: false) */
  showLegend?: boolean;
  /** Value formatter (e.g. currency ₹) */
  valueFormatter?: (value: number) => string;
  /** Extra classes on wrapper */
  className?: string;
}

// ═══════════════════════════════════════════
// DIVIDER
// ═══════════════════════════════════════════

export type DividerOrientation = "horizontal" | "vertical";
export type DividerStyle = "solid" | "dashed";

export interface DividerProps {
  /** Orientation (default: 'horizontal') */
  orientation?: DividerOrientation;
  /** Line style (default: 'solid') */
  variant?: DividerStyle;
  /** Optional center label */
  label?: string;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════

export interface EmptyStateProps {
  /** Message text */
  message: string;
  /** Optional sub-message */
  description?: string;
  /** Optional icon element (e.g. <Icon name="ShoppingBag" />) */
  icon?: ReactNode;
  /** Extra classes */
  className?: string;
}

// ═══════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  /** User name — initials will be generated if no image */
  name?: string;
  /** Image URL (optional) */
  src?: string;
  /** Size preset (default: 'md') */
  size?: AvatarSize;
  /** Extra classes */
  className?: string;
}