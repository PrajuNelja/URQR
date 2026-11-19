// src/pages/Table_Management/Components/Dashboard/Dashboard.tsx
import AppShell from "../../../../components/Header/AppShell";
import Header from "../../../../components/Header/Header";
import Logo from "../../../../components/Logo/Logo";
import { DateRangePicker } from "../../../../components/DataTable/DateRangePicker";

import { useDashboard } from "../../Hooks/useDashboard";

// Sub-components imported from the same folder
import { DashboardHeaderActions } from "./DashboardHeaderActions";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardTable } from "./DashboardTable";

export default function Dashboard() {
  const { activeNav, setActiveNav, searchQuery, setSearchQuery, dateRange, setDateRange, filteredOrders } = useDashboard();

  return (
    <AppShell maxWidth="xl" header={
      <Header 
        title="" 
        logo={<Logo size="md" />} 
        navItems={[]} 
        actions={<DashboardHeaderActions activeNav={activeNav} setActiveNav={setActiveNav} />} 
      />
    }>
      {/* Title & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary m-0 leading-tight">Dashboard</h1>
          <p className="font-sans text-text-muted text-xs mt-1 uppercase tracking-wide">Business overview and sales analytics</p>
        </div>
        <div className="mt-4 md:mt-0">
          <DateRangePicker value={dateRange} onChange={setDateRange} className="bg-surface shadow-ivory" />
        </div>
      </div>

      {/* Extracted Sections */}
      <DashboardMetrics />
      <DashboardTable 
        filteredOrders={filteredOrders} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
    </AppShell>
  );
}