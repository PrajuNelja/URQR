import { useQuery } from "@tanstack/react-query";

import { DASHBOARD_QUERY_KEY } from "../../../../queryClient";
import { getAnalyticsSummary } from "./analyticsSummary";

export function useAnalyticsSummary(from: string, to: string) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "summary", from, to],
    queryFn: ({ signal }) => getAnalyticsSummary(from, to, signal),
  });
}
