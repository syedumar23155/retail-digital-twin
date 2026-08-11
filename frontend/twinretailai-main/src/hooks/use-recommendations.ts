import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export interface RecommendationItem {
  itemId: string;
  rank: number;
  source: string;
  tag: string;
}

export interface RecommendationData {
  visitorId: string;
  rawId: number;
  buyProbability: number;
  segment: string;
  strategy: string;
  interactionCount: number;
  dataSource: string;
  catalogNote: string;
  recommendations: RecommendationItem[];
}

export function useRecommendations(visitorId: number | null) {
  return useQuery({
    queryKey: ["recommendations", visitorId],
    queryFn: () =>
      apiGet<RecommendationData>(
        `/api/recommendations/${visitorId}`
      ),
    enabled: visitorId !== null,
    staleTime: 60_000,
    retry: false,
  });
}