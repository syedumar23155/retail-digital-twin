import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export interface TwinRadarPoint {
  trait: string;
  value: number;
}

export interface TwinTimelineEvent {
  time: string;
  date: string;
  event: string;
  itemId: string;
  channel: string;
}

export interface TwinRecommendation {
  itemId: string;
  source: string;
  tag: string;
  reason: string;
  rank: number;
}

export interface TwinFeatureImportance {
  feature: string;
  weight: number;
}

export interface TwinData {
  visitorId: string;
  rawId: number;
  segment: string;
  clvTier: string;
  behaviorType: string;
  funnelPosition: string;
  roiPotential: string;
  engagementLevel: string;
  firstSeen: string | null;
  lastSeen: string | null;
  activeDays: number;
  totalViews: number;
  totalAddToCarts: number;
  totalPurchases: number;
  buyProbability: number;
  engagementPercentile: number;
  radar: TwinRadarPoint[];
  timeline: TwinTimelineEvent[];
  recommendations: TwinRecommendation[];
  featureImportance: TwinFeatureImportance[];
  narrative: string;
}

export function useTwin(visitorId: number | null) {
  return useQuery({
    queryKey: ["twin", visitorId],
    queryFn: () => apiGet<TwinData>(`/api/twin/${visitorId}`),
    enabled: visitorId !== null,
    staleTime: 60_000,
    retry: false,
  });
}