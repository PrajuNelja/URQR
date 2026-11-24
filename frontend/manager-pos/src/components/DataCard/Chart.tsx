// src/components/DataCard/Chart.tsx
// Recharts wrapper: bar / line / area / pie

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { TooltipValueType } from "recharts";
import type { ChartProps } from "./DataCard.types";
import {
  CHART_COLORS,
  CHART_WRAPPER,
  CHART_AXIS_TEXT,
  CHART_GRID_COLOR,
  CHART_TOOLTIP_STYLE,
} from "./DataCard.config";

// ── Pie label renderer ──
type PieLabelProps = {
  name?: string | number;
  percent?: number;
};

const renderPieLabel = (props: PieLabelProps): string => {
  const { name = "", percent = 0 } = props;
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

export const Chart = ({
  type,
  data,
  xKey,
  series = [],
  pieDataKey = "value",
  pieNameKey = "name",
  layout = "vertical",
  height = 240,
  showGrid,
  showValues = true,
  showTooltip = true,
  showLegend = false,
  valueFormatter,
  className = "",
}: ChartProps) => {
  // ── SAFETY: bail out if data is missing/empty ──
  const safeData: Record<string, unknown>[] = Array.isArray(data) ? data : [];
  const shouldShowGrid = showGrid ?? type !== "bar";

  if (safeData.length === 0) {
    return (
      <div
        className={`${CHART_WRAPPER} ${className}`.trim()}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full text-xs text-text-muted">
          No data
        </div>
      </div>
    );
  }

  // ── Axis config ──
  const axisProps = {
    stroke: CHART_AXIS_TEXT,
    tick: { fill: CHART_AXIS_TEXT, fontSize: 11 },
    tickLine: false,
    axisLine: { stroke: CHART_GRID_COLOR },
  };

  // ── Tooltip formatter ──
  const tooltipFormatter = valueFormatter
    ? (value: TooltipValueType | undefined) => {
        if (value === undefined) return "";
        if (Array.isArray(value)) {
          return value.map(Number).map(valueFormatter).join(", ");
        }
        return valueFormatter(Number(value));
      }
    : undefined;

  // ═══════════════════════════════════════════
  // BAR CHART
  // ═══════════════════════════════════════════
  if (type === "bar") {
    const isVertical = layout === "vertical";

    return (
      <div className={`${CHART_WRAPPER} ${className}`.trim()}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={safeData}
            layout={layout}
            margin={{
              top: 8,
              right: isVertical && showValues ? 36 : 8,
              left: 0,
              bottom: 0,
            }}
          >
            {shouldShowGrid && (
              <CartesianGrid
                stroke={CHART_GRID_COLOR}
                strokeDasharray="3 3"
                horizontal={!isVertical}
                vertical={isVertical}
              />
            )}

            {isVertical ? (
              <>
                <XAxis type="number" {...axisProps} />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  width={110}
                  {...axisProps}
                />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} {...axisProps} />
                <YAxis {...axisProps} />
              </>
            )}

            {showTooltip && (
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={CHART_TOOLTIP_STYLE}
                cursor={{ fill: "rgba(184,137,59,0.08)" }}
              />
            )}

            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}

            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                maxBarSize={40}
              >
                {!s.color &&
                  safeData.map((item, index) => (
                    <Cell
                      key={`${s.key}-${index}`}
                      fill={
                        typeof item.color === "string"
                          ? item.color
                          : CHART_COLORS[index % CHART_COLORS.length]
                      }
                    />
                  ))}
                {showValues && (
                  <LabelList
                    dataKey={s.key}
                    position={isVertical ? "right" : "top"}
                    fill={CHART_AXIS_TEXT}
                    fontSize={12}
                    formatter={(value) =>
                      valueFormatter
                        ? valueFormatter(Number(value))
                        : String(value ?? "")
                    }
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // LINE CHART
  // ═══════════════════════════════════════════
  if (type === "line") {
    return (
      <div className={`${CHART_WRAPPER} ${className}`.trim()}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={safeData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            {shouldShowGrid && (
              <CartesianGrid stroke={CHART_GRID_COLOR} strokeDasharray="3 3" />
            )}
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />

            {showTooltip && (
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            )}
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}

            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // AREA CHART
  // ═══════════════════════════════════════════
  if (type === "area") {
    return (
      <div className={`${CHART_WRAPPER} ${className}`.trim()}>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={safeData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            {shouldShowGrid && (
              <CartesianGrid stroke={CHART_GRID_COLOR} strokeDasharray="3 3" />
            )}
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />

            {showTooltip && (
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            )}
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}

            {series.map((s, i) => {
              const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PIE CHART
  // ═══════════════════════════════════════════
  if (type === "pie") {
    return (
      <div className={`${CHART_WRAPPER} ${className}`.trim()}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={safeData}
              dataKey={pieDataKey}
              nameKey={pieNameKey}
              cx="50%"
              cy="50%"
              outerRadius="70%"
              innerRadius="45%"
              paddingAngle={2}
              label={renderPieLabel}
              labelLine={false}
            >
              {safeData.map((_, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Pie>

            {showTooltip && (
              <Tooltip
                formatter={tooltipFormatter}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
            )}
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};

export default Chart;