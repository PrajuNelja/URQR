// src/components/DataCard/KPIStat.tsx

import type { KPIStatProps } from "./DataCard.types";
import { kpiStatConfig } from "./DataCard.config";

/**
 * KPIStat — dashboard metric card (icon + label + value + trend).
 *
 * <KPIStat label="Total Revenue" value="₹1,73,332" trend="+14%" icon={<Icon name="IndianRupee" />} />
 * <KPIStat label="Total Orders" value={897} trend="+11%" icon={<Icon name="ShoppingBag" />} />
 * <KPIStat label="Profit" value="₹25,995" trend="-3%" trendDirection="down" icon={<Icon name="TrendingUp" />} />
 */
export const KPIStat = ({
  label,
  value,
  trend,
  trendDirection = "up",
  icon,
  className = "",
}: KPIStatProps) => {
  const trendArrow =
    trendDirection === "up" ? "▲" : trendDirection === "down" ? "▼" : "";

  return (
    <div className={`${kpiStatConfig.wrapper} ${className}`.trim()}>
      {icon && <div className={kpiStatConfig.iconWrapper}>{icon}</div>}

      <div className={kpiStatConfig.textCol}>
        <span className={kpiStatConfig.label}>{label}</span>
        <span className={kpiStatConfig.value}>{value}</span>
        {trend && (
          <span className={kpiStatConfig.trend[trendDirection]}>
            {trendArrow} {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPIStat;