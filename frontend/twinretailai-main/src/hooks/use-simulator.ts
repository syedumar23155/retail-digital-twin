import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

export interface SimulatorPayload {
  views: number;
  carts: number;
  purchases: number;

  storeVisits: number;
  posPurchases: number;

  emailInteractions: number;
  couponRedemptions: number;
}

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

export async function simulateJourney(
  visitorId: number,
  payload: SimulatorPayload
) {
  return apiPost(
    `/api/simulator/${visitorId}`,
    payload
  );
}