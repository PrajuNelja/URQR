import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useAuthStore } from "../../../../lib/authStore";
import { DashboardKpiGrid } from "../../../../components/Dashboard/DashboardKpiGrid";
import { DashboardBreakdown } from "../../../../components/Dashboard/DashboardBreakdown";
import { DashboardOrdersTable } from "../../../../components/Dashboard/DashboardOrdersTable";
import { DashboardOrderDrawer } from "../../../../components/Dashboard/DashboardOrderDrawer";
import { downloadDashboardOrdersCsv } from "../../../../components/Dashboard/DashboardOrdersExport";
import { MOCK_ORDERS, MOCK_ORDERS_DB } from "../../Config/Dashboard.config";
import { useAnalyticsSummary } from "./useAnalyticsSummary";
import "../../../../Styles/Dashboard.css";

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("Custom");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("#ORD1284");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dateFilterBtnRef = useRef<HTMLButtonElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const search = useSearch({ from: "/pos/dashboard" });
  const from = search.from ?? "2026-10-17";
  const to = search.to ?? "2026-10-23";
  const summaryQuery = useAnalyticsSummary(from, to);

  // Sync sidebar collapse with document.body class
  useEffect(() => {
    if (sidebarCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [sidebarCollapsed]);

  // Keyboard shortcut Ctrl+B / Cmd+B for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      if (e.key === "Escape") {
        setDatePopoverOpen(false);
        setLogoutModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside clicks for date popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        datePopoverOpen &&
        datePopoverRef.current &&
        !datePopoverRef.current.contains(e.target as Node) &&
        dateFilterBtnRef.current &&
        !dateFilterBtnRef.current.contains(e.target as Node)
      ) {
        setDatePopoverOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [datePopoverOpen]);

  const handleLogout = () => {
    setLogoutModalOpen(false);
    clearAuth();
    void navigate({ to: "/login", replace: true });
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  const selectedOrder = MOCK_ORDERS_DB[selectedOrderId] || MOCK_ORDERS_DB["#ORD1284"];

  // Calendar days grid data
  const calendarDays = [
    { day: "29", isMuted: true },
    { day: "30", isMuted: true },
    { day: "1" },
    { day: "2" },
    { day: "3" },
    { day: "4" },
    { day: "5" },
    { day: "6" },
    { day: "7" },
    { day: "8" },
    { day: "9" },
    { day: "10" },
    { day: "11" },
    { day: "12" },
    { day: "13" },
    { day: "14" },
    { day: "15" },
    { day: "16" },
    { day: "17", isStart: true },
    { day: "18", inRange: true },
    { day: "19", inRange: true },
    { day: "20", inRange: true },
    { day: "21", inRange: true },
    { day: "22", inRange: true },
    { day: "23", isEnd: true },
    { day: "24" },
    { day: "25" },
    { day: "26" },
    { day: "27" },
    { day: "28" },
    { day: "29" },
    { day: "30" },
    { day: "31" },
    { day: "1", isMuted: true },
    { day: "2", isMuted: true },
  ];

  return (
    <div className="bg-[#F5EEE0] min-h-screen text-[#3B2A1E] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* ================= FIXED TOPBAR ================= */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#FFFDF8] border-b border-[#E4D8C3] shadow-[0_1px_4px_rgba(59,42,30,0.04)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 w-64">
          <button
            type="button"
            id="sidebarToggleBtn"
            aria-label="Toggle Navigation Menu"
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className="w-10 h-10 -ml-1 rounded-lg flex items-center justify-center text-[#3B2A1E] hover:bg-[#FAF3E6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <div className="w-10 h-10 rounded bg-[#5C3D26] flex items-center justify-center text-[#FFFDF8] font-bold shadow-sm">
            <span className="material-symbols-outlined text-[20px]">restaurant</span>
          </div>
          <div className="flex flex-col">
            <span
              className="text-base font-bold text-[#5C3D26] tracking-tight leading-none"
              style={{ fontFamily: "Newsreader, Georgia, serif" }}
            >
              GRAND HORIZON
            </span>
            <span className="text-[10px] text-[#7A6A5A] tracking-wider uppercase mt-0.5 font-semibold">
              URQR POS v2.4
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-4 text-[#7A6A5A] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search items, reports, orders..."
              className="w-full h-10 pl-10 pr-12 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-sm text-[#3B2A1E] placeholder:text-[#7A6A5A] focus:outline-none focus:bg-[#FFFDF8] focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/20 transition-all"
            />
            <span
              className="absolute right-2 px-1 py-0.5 rounded bg-[#FFFDF8] border border-[#E4D8C3] text-[#7A6A5A] text-[11px]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              F2
            </span>
          </div>
        </div>

        {/* Status & Clock */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#EEF3E8] border border-[#3F6B3A]/20 text-[#3F6B3A] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#3F6B3A] animate-pulse" />
            <span>Online</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#7A6A5A] text-xs">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span>Thu, 26 Nov, 2026</span>
          </div>
        </div>
      </header>

      {/* ================= FIXED SIDEBAR ================= */}
      <aside
        id="mainSidebar"
        aria-label="Main Navigation"
        className="fixed left-0 top-16 bottom-0 w-64 bg-[#FFFDF8] border-r border-[#E4D8C3] z-40 flex flex-col justify-between py-4 px-4 shadow-[1px_0_6px_rgba(59,42,30,0.02)] transition-all duration-300 overflow-hidden"
      >
        <nav className="flex flex-col gap-1">
          <Link
            to="/pos/billing"
            data-path="billing"
            className="flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm text-[#7A6A5A] hover:bg-[#FAF3E6] hover:text-[#3B2A1E] transition-all font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">
              point_of_sale
            </span>
            <span>Billing</span>
          </Link>
          <Link
            to="/pos/dashboard"
            data-path="dashboard"
            aria-current="page"
            className="flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all bg-[#5C3D26] text-[#FFFFFF] font-bold shadow-[0_2px_8px_rgba(92,61,38,0.25)]"
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span>Dashboard</span>
          </Link>
        </nav>

        <div className="pt-4 border-t border-[#E4D8C3] mt-auto">
          <button
            type="button"
            id="logoutBtn"
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm text-[#7A6A5A] hover:bg-[#FDF1E1] hover:text-[#B91C1C] transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div
        id="mainContentWrapper"
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        <main className="relative pt-[88px] min-h-screen bg-[#F5EEE0] w-full px-6 pb-6">
          <div className="flex flex-col w-full text-[#3B2A1E]">
            {/* Header Controls & Telemetry Action Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#8B5E3C] text-xs uppercase tracking-widest font-bold">
                  <span>Grand Horizon Management</span>
                  <span className="w-1 h-1 rounded-full bg-[#8B5E3C]" />
                </div>
                <h1
                  className="text-3xl font-bold text-[#3B2A1E] tracking-tight mt-0.5"
                  style={{ fontFamily: "Newsreader, Georgia, serif" }}
                >
                  Dashboard
                </h1>
              </div>

              {/* Right Controls: Date Filter, Heartbeat, Export */}
              <div className="flex items-center flex-wrap gap-2 relative">
                {/* Date Range Button & Popover Container */}
                <div className="relative">
                  <button
                    ref={dateFilterBtnRef}
                    type="button"
                    id="dateFilterBtn"
                    aria-expanded={datePopoverOpen}
                    aria-haspopup="dialog"
                    onClick={() => setDatePopoverOpen((prev) => !prev)}
                    className="h-10 px-4 bg-[#FFFDF8] border border-[#E4D8C3] rounded-lg shadow-sm hover:bg-[#FAF3E6] transition-all flex items-center gap-2 text-[#3B2A1E] text-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#8B5E3C]">
                      calendar_today
                    </span>
                    <span id="dateFilterLabel">Custom Range</span>
                    <span
                      className="px-1.5 py-0.5 rounded bg-[#FAF3E6] border border-[#E4D8C3] text-[11px] text-[#7A6A5A]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      17–23 Oct
                    </span>
                    <span
                      id="dateChevron"
                      className={`material-symbols-outlined text-[18px] text-[#7A6A5A] transition-transform duration-200 ${
                        datePopoverOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Custom Range Date Popover */}
                  {datePopoverOpen && (
                    <div
                      ref={datePopoverRef}
                      id="datePopover"
                      role="dialog"
                      aria-label="Filter Analytics Range"
                      className="absolute top-full left-0 mt-2 w-96 p-5 bg-[#FFFDF8] rounded-xl shadow-2xl z-50 flex flex-col gap-4 border border-[#E4D8C3]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7A6A5A] uppercase tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#8B5E3C]">
                            tune
                          </span>
                          Filter Analytics Range
                        </span>
                      </div>

                      {/* Quick Presets */}
                      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#FAF3E6] border border-[#E4D8C3] rounded-lg text-center">
                        {["Today", "Yesterday", "Last 7D", "Custom"].map((preset) => {
                          const isActive = selectedPreset === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setSelectedPreset(preset)}
                              className={`py-1.5 text-xs transition-all rounded cursor-pointer ${
                                isActive
                                  ? "font-bold text-[#FFFFFF] bg-[#5C3D26] shadow-sm"
                                  : "font-semibold text-[#7A6A5A] hover:bg-[#FFFDF8]"
                              }`}
                            >
                              {preset}
                            </button>
                          );
                        })}
                      </div>

                      {/* Date Input Displays */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-[#7A6A5A] uppercase tracking-wider">
                            From Date
                          </span>
                          <div className="h-9 px-2.5 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#7A6A5A]">
                              calendar_month
                            </span>
                            <span
                              className="text-xs font-semibold text-[#3B2A1E]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              17 Oct 2024
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-[#7A6A5A] uppercase tracking-wider">
                            To Date
                          </span>
                          <div className="h-9 px-2.5 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#7A6A5A]">
                              calendar_month
                            </span>
                            <span
                              className="text-xs font-semibold text-[#3B2A1E]"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              23 Oct 2024
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Calendar Navigator */}
                      <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center justify-between px-1">
                          <button
                            type="button"
                            className="w-7 h-7 rounded hover:bg-[#FAF3E6] flex items-center justify-center text-[#7A6A5A] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              chevron_left
                            </span>
                          </button>
                          <span className="text-sm font-bold text-[#3B2A1E]">
                            October 2024
                          </span>
                          <button
                            type="button"
                            className="w-7 h-7 rounded hover:bg-[#FAF3E6] flex items-center justify-center text-[#7A6A5A] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              chevron_right
                            </span>
                          </button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[#7A6A5A]">
                          <span>Su</span>
                          <span>Mo</span>
                          <span>Tu</span>
                          <span>We</span>
                          <span>Th</span>
                          <span>Fr</span>
                          <span>Sa</span>
                        </div>

                        {/* Calendar Days */}
                        <div
                          className="grid grid-cols-7 gap-y-1 text-center text-xs items-center"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {calendarDays.map((item, idx) => {
                            if (item.isStart) {
                              return (
                                <span
                                  key={idx}
                                  className="py-1 bg-[#5C3D26] text-[#FFFFFF] font-bold rounded-l-md cursor-pointer"
                                >
                                  {item.day}
                                </span>
                              );
                            }
                            if (item.inRange) {
                              return (
                                <span
                                  key={idx}
                                  className="py-1 bg-[#FAF3E6] text-[#3B2A1E] font-semibold cursor-pointer"
                                >
                                  {item.day}
                                </span>
                              );
                            }
                            if (item.isEnd) {
                              return (
                                <span
                                  key={idx}
                                  className="py-1 bg-[#5C3D26] text-[#FFFFFF] font-bold rounded-r-md cursor-pointer"
                                >
                                  {item.day}
                                </span>
                              );
                            }
                            if (item.isMuted) {
                              return (
                                <span key={idx} className="py-1 text-[#7A6A5A]/40">
                                  {item.day}
                                </span>
                              );
                            }
                            return (
                              <span
                                key={idx}
                                className="py-1 text-[#7A6A5A] hover:bg-[#FAF3E6] rounded cursor-pointer"
                              >
                                {item.day}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Popover Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          id="closeDatePopover"
                          onClick={() => setDatePopoverOpen(false)}
                          className="px-3 py-2 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#7A6A5A] text-xs font-semibold hover:bg-[#E4D8C3]/30 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          id="applyDateBtn"
                          onClick={() => setDatePopoverOpen(false)}
                          className="flex-1 py-2 rounded-lg bg-[#5C3D26] hover:bg-[#3B2A1E] text-[#FFFFFF] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            check
                          </span>
                          Apply Range (7 Days)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Heartbeat Status Badge */}
                <div className="flex items-center gap-1 h-10 px-4 rounded-lg bg-[#FFFDF8] border border-[#E4D8C3] shadow-sm text-xs text-[#7A6A5A]">
                  <span className="w-2 h-2 rounded-full bg-[#3F6B3A] animate-ping" />
                  <span className="w-2 h-2 -ml-3 rounded-full bg-[#3F6B3A]" />
                  <span className="ml-1">Updated 2m ago</span>
                </div>

                {/* Export Report Button */}
                <button
                  type="button"
                  onClick={() => downloadDashboardOrdersCsv(MOCK_ORDERS)}
                  className="h-10 px-4 bg-[#8B5E3C] hover:bg-[#7A5132] text-[#FFFFFF] text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  <span>Export Report</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_drop_down
                  </span>
                </button>
              </div>
            </div>

            {/* KPI Bento Matrix (4 Cards) */}
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

            {/* Secondary Analytics Row: 50% / 50% Split */}
            <DashboardBreakdown />

            {/* Order Details Table Section */}
            <DashboardOrdersTable onSelectOrder={handleSelectOrder} />
          </div>
        </main>
      </div>

      {/* ================= ORDER DETAIL DRAWER ================= */}
      <DashboardOrderDrawer
        order={selectedOrder}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {logoutModalOpen && (
        <div
          id="logoutModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logoutModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A1E]/45 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLogoutModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[#FFFDF8] border border-[#E4D8C3] rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FDF1E1] border border-[#E4D8C3] text-[#B91C1C] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </div>
              <div>
                <h4
                  id="logoutModalTitle"
                  className="text-lg font-bold text-[#3B2A1E]"
                  style={{ fontFamily: "Newsreader, Georgia, serif" }}
                >
                  Sign out of URQR POS?
                </h4>
                <p className="text-xs text-[#7A6A5A] mt-0.5">
                  Your active shift session and register will remain securely saved.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E4D8C3]">
              <button
                type="button"
                id="cancelLogoutBtn"
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#FAF3E6] border border-[#E4D8C3] text-[#3B2A1E] text-xs font-semibold hover:bg-[#E4D8C3]/40 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirmLogoutBtn"
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-[#FFFFFF] text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
