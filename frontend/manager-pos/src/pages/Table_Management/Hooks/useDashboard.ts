// src/pages/Table_Management/Hooks/useDashboard.ts
import { useState, useMemo } from "react";
import { MOCK_ORDERS } from "../Config/Dashboard.config";
import type { DateRange } from "../Types/Dashboard.types";

export const useDashboard = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ 
    from: "2026-11-01", 
    to: "2026-11-18" 
  });

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return MOCK_ORDERS;
    const lowerQuery = searchQuery.toLowerCase();
    
    return MOCK_ORDERS.filter(
      (order) =>
        order.orderId.toLowerCase().includes(lowerQuery) ||
        order.items.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  return {
    activeNav,
    setActiveNav,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    filteredOrders,
  };
};