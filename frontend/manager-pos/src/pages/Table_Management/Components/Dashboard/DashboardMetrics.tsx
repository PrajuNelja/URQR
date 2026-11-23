// src/pages/Table_Management/Components/Dashboard/DashboardMetrics.tsx
import { Chart } from "../../../../components/DataCard/Chart";
import { Icon } from "../../../../components/DataCard/Icon";
import { KPIStat } from "../../../../components/DataCard/KPIStat";
import { DataCard } from "../../../../components/DataCard/DataCard";
import {
  dashboardConfig,
  MOCK_KPI_DATA,
  MOCK_TOP_ITEMS,
  MOCK_PAYMENT_SPLIT,
} from "../../Config/Dashboard.config";

export const DashboardMetrics = () => {
  return (
    <>
      <div className={dashboardConfig.kpiGrid}>
        {MOCK_KPI_DATA.map((kpi, i) => (
          <KPIStat
            key={i}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            trendDirection="up"
            icon={<Icon name={kpi.icon} size="lg" />}
          />
        ))}
      </div>

      <div className={dashboardConfig.chartGrid}>
        <DataCard
          title="Top 5 Selling Items"
          variant="content"
          className="shadow-ivory"
        >
          <Chart
            type="bar"
            layout="vertical"
            data={MOCK_TOP_ITEMS}
            xKey="name"
            series={[
              { key: "qty", name: "Sold", color: "var(--color-chart-1)" },
            ]}
            height={280}
            showLegend={false}
          />
        </DataCard>
        <DataCard
          title="Payment Methods"
          variant="content"
          className="shadow-ivory"
        >
          <Chart
            type="bar"
            layout="horizontal"
            data={MOCK_PAYMENT_SPLIT}
            xKey="name"
            series={[
              {
                key: "value",
                name: "Percentage",
                color: "var(--color-chart-2)",
              },
            ]}
            height={280}
            showLegend={false}
          />
        </DataCard>
      </div>
    </>
  );
};
