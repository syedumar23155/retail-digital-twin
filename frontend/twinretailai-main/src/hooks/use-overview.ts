import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export interface OverviewKpis {
  totalCustomers: number;
  buyers: number;
  buyerPct: number;
  highValueCount: number;
  predictedBuyers: number;
  avgBuyProbability: number;
  conversionRate: number;
  avgEngagementScore: number;
}

export interface OverviewData {
  kpis: OverviewKpis;
  dailyActivity: { date: string; views: number; carts: number; purchases: number }[];
  funnel: { name: string; value: number; fill: string }[];
  segments: { name: string; value: number; pct: number; color: string }[];
  buyProbabilityHistogram: { bin: string; count: number }[];
  insights: { tone: string; label: string; text: string; pct: string }[];
  abandonedHighIntent: { visitorId: string; segment: string; risk: number }[];
  trendingItems: { itemId: string; viewsLast7d: number; uplift: string }[];
  segmentClvMatrix: { segments: string[]; tiers: string[]; values: number[][] };
}

export function useOverview() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: () => apiGet<OverviewData>("/api/overview"),
    staleTime: 60_000,
  });
}