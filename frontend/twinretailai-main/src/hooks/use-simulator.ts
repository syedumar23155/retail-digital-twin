import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export interface SimulatorData {
  visitorId: string;
  rawId: number;

  segment: string;
  strategy: string;
  behaviorType: string;
  funnelPosition: string;

  baseline: {
    views: number;
    carts: number;
    purchases: number;
    buyProbability: number;
  };

  prediction: {
    buyProbability: number;
    predictedBuyer: number;
    threshold: number;
  };

  scenario: {
    views: number;
    carts: number;
    purchases: number;
  };

  delta: {
    probability: number;
    percentagePoints: number;
    impact: string;
  };

  recommendations: {
    itemId: string;
    rank: number;
    tag: string;
    source: string;
  }[];
}

export function useSimulator(visitorId: number | null) {
  return useQuery({
    queryKey: ["simulator", visitorId],

    queryFn: () =>
      apiGet<SimulatorData>(
        `/api/simulator/${visitorId}`
      ),

    enabled: visitorId !== null,

    staleTime: 60000,

    retry: false,
  });
}