import { apiClient } from "../../../../lib/apiClient";
import {
  analyticsSummarySchema,
  type AnalyticsSummary,
} from "../../Types/AnalyticsSummary";

export async function getAnalyticsSummary(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<AnalyticsSummary> {
  const response = await apiClient.get<unknown>("/analytics/summary", {
    params: { from, to },
    signal,
  });

  return analyticsSummarySchema.parse(response.data);
}
