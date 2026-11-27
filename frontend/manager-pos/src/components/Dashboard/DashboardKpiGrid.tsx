import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  IndianRupee,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import type { AnalyticsSummary } from "../../pages/Table_Management/Types/AnalyticsSummary";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface DashboardKpiGridProps {
  summary?: AnalyticsSummary;
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const auditCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function TrendIndicator({ value }: { value?: number }) {
  if (value === undefined) return null;

  const isPositive = value >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`dashboard-kpi-trend${isPositive ? " dashboard-kpi-trend--up" : " dashboard-kpi-trend--down"}`}
      aria-label={`${Math.abs(value)} percent ${isPositive ? "increase" : "decrease"}`}
    >
      <TrendIcon size={14} aria-hidden="true" />
      {Math.abs(value)}%
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon,
  progress,
  unit,
  trend,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  progress: number;
  unit?: string;
  trend?: number;
}) {
  return (
    <article className="dashboard-kpi-card">
      <div className="dashboard-kpi-card-heading">
        <h2>{label}</h2>
        <span className="dashboard-kpi-icon">{icon}</span>
      </div>
      <div className="dashboard-kpi-value-row">
        <p className="dashboard-kpi-value">{value}</p>
        {unit && <span className="dashboard-kpi-unit">{unit}</span>}
        <TrendIndicator value={trend} />
      </div>
      <div
        className="dashboard-kpi-progress"
        role="progressbar"
        aria-label={`${label} performance`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}

function KpiSkeleton({ label }: { label: string }) {
  return (
    <article className="dashboard-kpi-card" aria-label={`Loading ${label}`}>
      <div className="dashboard-kpi-card-heading">
        <span className="dashboard-skeleton dashboard-skeleton-label" />
        <span className="dashboard-skeleton dashboard-skeleton-icon" />
      </div>
      <span className="dashboard-skeleton dashboard-skeleton-value" />
      <span className="dashboard-skeleton dashboard-skeleton-progress" />
    </article>
  );
}

function TaxKpiCard({ summary }: { summary: AnalyticsSummary }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="dashboard-kpi-card dashboard-kpi-card--tax"
          aria-haspopup="dialog"
          aria-controls="taxPopover"
        >
          <span className="dashboard-kpi-card-heading">
            <span className="dashboard-kpi-card-label">
              TAX COLLECTED (GST 5%)
            </span>
            <ChevronDown size={18} aria-hidden="true" />
          </span>
          <span className="dashboard-kpi-value-row">
            <span className="dashboard-kpi-value">
              {currencyFormatter.format(summary.totalTaxCollected)}
            </span>
            <TrendIndicator value={summary.trends?.totalTaxCollected} />
          </span>
          <span className="dashboard-kpi-progress" aria-hidden="true">
            <span style={{ width: "82%" }} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        id="taxPopover"
        className="!w-[min(380px,calc(100vw-32px))] dashboard-tax-popover"
        align="end"
        sideOffset={8}
      >
        <div className="dashboard-tax-popover-header">
          <div className="dashboard-tax-heading">
            <ReceiptText size={18} aria-hidden="true" />
            <h2>GST BREAKDOWN (5%)</h2>
          </div>
          <span className="dashboard-tax-status">Reconciled POS-01</span>
        </div>
        <div className="dashboard-tax-splits">
          <div className="dashboard-tax-split">
            <div>
              <strong>CGST (2.5%)</strong>
              <span>Central Goods &amp; Service Tax</span>
            </div>
            <strong>{auditCurrencyFormatter.format(summary.cgst)}</strong>
          </div>
          <div className="dashboard-tax-split">
            <div>
              <strong>SGST (2.5%)</strong>
              <span>State Goods &amp; Service Tax</span>
            </div>
            <strong>{auditCurrencyFormatter.format(summary.sgst)}</strong>
          </div>
        </div>
        <div className="dashboard-tax-total">
          <span>TOTAL GST COLLECTED (5%)</span>
          <strong>
            {auditCurrencyFormatter.format(summary.totalTaxCollected)}
          </strong>
        </div>
        <div className="dashboard-tax-audit">
          <span>
            Taxable Base:{" "}
            {summary.taxableBase === undefined
              ? "—"
              : auditCurrencyFormatter.format(summary.taxableBase)}
          </span>
          <span>
            Exempt Sales:{" "}
            {summary.exemptSales === undefined
              ? "—"
              : auditCurrencyFormatter.format(summary.exemptSales)}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DashboardKpiGrid({
  summary,
  isLoading,
  error,
  onRetry,
}: DashboardKpiGridProps) {
  if (isLoading) {
    return (
      <section
        className="dashboard-kpi-grid"
        aria-label="Sales summary"
        aria-busy="true"
      >
        <KpiSkeleton label="gross sales revenue" />
        <KpiSkeleton label="total orders" />
        <KpiSkeleton label="average order value" />
        <KpiSkeleton label="tax collected" />
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="dashboard-kpi-grid" aria-label="Sales summary">
        <div className="dashboard-kpi-error" role="alert">
          <p>{error ?? "Sales summary is unavailable."}</p>
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-kpi-grid" aria-label="Sales summary">
      <KpiCard
        label="GROSS REVENUE"
        value={currencyFormatter.format(summary.grossSalesRevenue)}
        icon={<IndianRupee size={19} aria-hidden="true" />}
        progress={78}
        trend={summary.trends?.grossSalesRevenue}
      />
      <KpiCard
        label="TOTAL ORDERS"
        value={new Intl.NumberFormat("en-IN").format(summary.totalOrderCount)}
        icon={<ReceiptText size={19} aria-hidden="true" />}
        progress={65}
        trend={summary.trends?.totalOrderCount}
      />
      <KpiCard
        label="AVERAGE ORDER VALUE"
        value={currencyFormatter.format(summary.averageOrderValue)}
        icon={<TrendingUp size={19} aria-hidden="true" />}
        progress={72}
        unit="/ order"
        trend={summary.trends?.averageOrderValue}
      />
      <TaxKpiCard summary={summary} />
    </section>
  );
}
