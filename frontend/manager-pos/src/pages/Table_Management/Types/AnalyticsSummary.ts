import { z } from "zod";

export const analyticsSummarySchema = z.object({
  grossSalesRevenue: z.number(),
  totalOrderCount: z.number().int(),
  averageOrderValue: z.number(),
  totalTaxCollected: z.number(),
  cgst: z.number(),
  sgst: z.number(),
  taxableBase: z.number().optional(),
  exemptSales: z.number().optional(),
  trends: z
    .object({
      grossSalesRevenue: z.number().optional(),
      totalOrderCount: z.number().optional(),
      averageOrderValue: z.number().optional(),
      totalTaxCollected: z.number().optional(),
    })
    .optional(),
});

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;
