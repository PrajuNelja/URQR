
import { Link } from "@tanstack/react-router";

import AppShell from "../../../../components/Header/AppShell";
import Header from "../../../../components/Header/Header";
import Logo from "../../../../components/Logo/Logo";
import { DateRangePicker } from "../../../../components/DataTable/DateRangePicker";

import { useDashboard } from "../../Hooks/useDashboard";

// Dashboard sub-components
import { DashboardHeaderActions } from "./DashboardHeaderActions";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardTable } from "./DashboardTable";

export default function Dashboard() {
  const {
    activeNav,
    setActiveNav,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    filteredOrders,
  } = useDashboard();

  return (
    <AppShell
      maxWidth="xl"
      header={
        <Header
          title=""
          logo={<Logo size="md" />}
          navItems={[]}
          actions={
            <DashboardHeaderActions
              activeNav={activeNav}
              setActiveNav={setActiveNav}
            />
          }
        />
      }
    >
      {/* Dashboard Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">

        <div>
          <h1 className="font-serif text-3xl font-bold text-primary m-0 leading-tight">
            Dashboard
          </h1>

          <p className="font-sans text-text-muted text-xs mt-1 uppercase tracking-wide">
            Business overview and sales analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* TanStack Router - Billing Navigation */}
          <Link
            to="/pos/billing"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-white font-medium transition-opacity hover:opacity-90"
          >
            Go to Billing
          </Link>

          {/* Date Range Picker */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="bg-surface shadow-ivory"
          />
        </div>
      </div>

      {/* Dashboard Metrics */}
      <DashboardMetrics />

      {/* Dashboard Table */}
      <DashboardTable
        filteredOrders={filteredOrders}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </AppShell>
  );
}
