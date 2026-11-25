import { QueryClient } from "@tanstack/react-query";

/**
 * POS Catalog Query Keys and dedicated caching defaults.
 * Catalog dishes are stable during service shifts:
 * - staleTime: 5 minutes (300,000 ms) before background revalidation
 * - gcTime: 30 minutes (1,800,000 ms) garbage collection retention
 * - retry: 3 exponential backoff attempts on network drops
 */
export const POS_CATALOG_QUERY_KEY = ["pos", "catalog"] as const;

export const posCatalogQueryDefaults = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 3,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

queryClient.setQueryDefaults(POS_CATALOG_QUERY_KEY, posCatalogQueryDefaults);

/**
 * Screen 3 Dashboard Query Keys and caching defaults (Vishal Scope).
 * - staleTime: 30 seconds for live operations dashboard metrics
 * - gcTime: 10 minutes garbage collection retention
 * - retry: 2
 * - refetchOnWindowFocus: false
 */
export const DASHBOARD_QUERY_KEY = ["pos", "dashboard"] as const;

export const dashboardQueryDefaults = {
  staleTime: 30 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
};

queryClient.setQueryDefaults(DASHBOARD_QUERY_KEY, dashboardQueryDefaults);


