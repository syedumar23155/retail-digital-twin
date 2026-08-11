import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export interface PredictionFeature {
  feature: string;
  value: number;
}

export interface PredictionFeatures {
  totalViews: number;
  totalAddToCarts: number;
  viewToCartRate: number;
  cartRateFlag: number;
  engagementScore: number;
  totalEvents: number;
  activityRatio: number;
  engagementPercentile: number;
}

export interface ModelPerformance {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  averagePrecision: number;
  threshold: number;
}

export interface CrossValidation {
  folds: number;
  meanAuc: number;
  stdAuc: number;
}

export interface ModelComparison {
  model: string;
  rocAuc: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  status: string;
}

export interface PredictionData {
  visitorId: string;
  rawId: number;

  buyProbability: number;
  predictedBuyer: number;
  threshold: number;

  segment: string;
  clvTier: string;
  behaviorType: string;
  engagementLevel: string;

  features: PredictionFeatures;

  featureImportance: PredictionFeature[];

  modelPerformance: ModelPerformance;

  crossValidation: CrossValidation;

  modelComparison: ModelComparison[];
}

export function usePrediction(visitorId: number | null) {
  return useQuery({
    queryKey: ["prediction", visitorId],

    queryFn: () =>
      apiGet<PredictionData>(
        `/api/prediction/${visitorId}`
      ),

    enabled: visitorId !== null,

    staleTime: 60_000,

    retry: false,
  });
}