import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ChevronDown,
  Clock3,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Utensils,
} from "lucide-react";

import { useAuthStore } from "../../../../lib/authStore";
import { DashboardKpiGrid } from "../../../../components/Dashboard/DashboardKpiGrid";
import { DashboardBreakdown } from "../../../../components/Dashboard/DashboardBreakdown";
import { DashboardOrdersTable } from "../../../../components/Dashboard/DashboardOrdersTable";
import { downloadDashboardOrdersCsv } from "../../../../components/Dashboard/DashboardOrdersExport";
import { DashboardDateRangePicker } from "../../../../components/Dashboard/DashboardDateRangePicker";
import type { DashboardDateRange } from "../../../../components/Dashboard/DashboardDateRange";
import { MOCK_ORDERS } from "../../Config/Dashboard.config";
import { useAnalyticsSummary } from "./useAnalyticsSummary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import "../../../../Styles/Dashboard.css";

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const search = useSearch({ from: "/pos/dashboard" });
  const from = search.from ?? "2026-10-17";
  const to = search.to ?? "2026-10-23";
  const summaryQuery = useAnalyticsSummary(from, to);
  const handleApplyDateRange = (range: DashboardDateRange) => {
    void navigate({
      to: "/pos/dashboard",
      search: (previous) => ({ ...previous, ...range }),
    });
  };
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date());
  const datePart = (type: string) =>
    dateParts.find((part) => part.type === type)?.value ?? "";
  const currentDate = `${datePart("weekday")}, ${datePart("day")} ${datePart("month")}, ${datePart("year")}`;

  const handleLogout = () => {
    clearAuth();
    void navigate({ to: "/login", replace: true });
  };

  return (
    <div
      className={`dashboard-shell${sidebarCollapsed ? " dashboard-shell--collapsed" : ""}`}
    >
      <header className="dashboard-topbar">
        <div className="dashboard-brand-cluster">
          <button
            type="button"
            className="dashboard-icon-button"
            aria-label={
              sidebarCollapsed ? "Expand navigation" : "Collapse navigation"
            }
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="dashboard-brand-mark">
            <Utensils size={19} aria-hidden="true" />
          </div>
          <div className="dashboard-brand-copy">
            <span className="dashboard-brand-name">GRAND HORIZON</span>
            <span className="dashboard-brand-version">URQR POS V2.4</span>
          </div>
        </div>

        <label className="dashboard-global-search">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search items, reports, orders..."
            aria-label="Search items, reports, orders"
          />
          <kbd>F2</kbd>
        </label>

        <div className="dashboard-topbar-status">
          <span className="dashboard-status-pill">
            <span className="dashboard-status-dot" />
            Online
          </span>
          <span className="dashboard-clock-pill">
            <Clock3 size={16} aria-hidden="true" />
            {currentDate}
          </span>
        </div>
      </header>

      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <nav className="dashboard-sidebar-nav">
          <Link className="dashboard-nav-link" to="/pos/billing">
            <ReceiptText size={19} aria-hidden="true" />
            <span>Billing</span>
          </Link>
          <Link
            className="dashboard-nav-link dashboard-nav-link--active"
            to="/pos/dashboard"
            aria-current="page"
          >
            <LayoutDashboard size={19} aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
        </nav>
        <div className="dashboard-sidebar-footer">
          <button
            type="button"
            className="dashboard-nav-link dashboard-logout-button"
            onClick={() => setLogoutConfirmationOpen(true)}
          >
            <LogOut size={19} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <section className="dashboard-page-heading">
          <div>
            <p className="dashboard-eyebrow">
              GRAND HORIZON MANAGEMENT <span aria-hidden="true">•</span> SALES
              ANALYTICS
            </p>
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-page-actions">
            <DashboardDateRangePicker
              value={{ from, to }}
              onApply={handleApplyDateRange}
            />
            <span className="dashboard-updated-pill">
              <span className="dashboard-status-dot" />
              Updated 2m ago
            </span>
            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() => downloadDashboardOrdersCsv(MOCK_ORDERS)}
            >
              <Download size={17} aria-hidden="true" />
              Export Report
              <ChevronDown size={15} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="dashboard-content" aria-label="Sales analytics">
          <DashboardKpiGrid
            summary={summaryQuery.data}
            isLoading={summaryQuery.isPending}
            error={
              summaryQuery.error instanceof Error
                ? summaryQuery.error.message
                : "Sales summary is unavailable."
            }
            onRetry={() => void summaryQuery.refetch()}
          />
          <DashboardBreakdown />
          <DashboardOrdersTable />
        </section>
      </main>
      <AlertDialog
        open={logoutConfirmationOpen}
        onOpenChange={setLogoutConfirmationOpen}
      >
        <AlertDialogContent className="dashboard-logout-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of URQR POS?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
