import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassCard, PageHeader, SectionTitle, Chip } from "@/components/premium";
import {
  Brain,
  Search,
  Trophy,
  Target,
  Activity,
  ShoppingCart,
  Eye,
  Users,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Database,
  ShieldCheck,
} from "lucide-react";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/prediction")({
  component: PredictionLab,
});

/* =========================================================
   BACKEND DATA TYPES
   These match /api/prediction/<visitor_id> exactly.
   ========================================================= */

interface PredictionFeatures {
  totalViews: number;
  totalAddToCarts: number;
  viewToCartRate: number;
  cartRateFlag: number;
  engagementScore: number;
  totalEvents: number;
  activityRatio: number;
  engagementPercentile: number;
}

interface FeatureImportance {
  feature: string;
  value: number;
}

interface ModelPerformance {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  averagePrecision: number;
  threshold: number;
}

interface CrossValidation {
  folds: number;
  meanAuc: number;
  stdAuc: number;
}

interface ModelComparison {
  model: string;
  rocAuc: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  status: string;
}

interface PredictionData {
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

  featureImportance: FeatureImportance[];

  modelPerformance: ModelPerformance;

  crossValidation: CrossValidation;

  modelComparison: ModelComparison[];
}

/* =========================================================
   PAGE
   ========================================================= */

function PredictionLab() {
  const [customerInput, setCustomerInput] = useState("1150086");
  const [customerId, setCustomerId] = useState<number | null>(1150086);

  const [searchError, setSearchError] = useState("");
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     Load prediction from Flask API
     --------------------------------------------------------- */

  async function loadPrediction(id: number) {
    setLoading(true);
    setSearchError("");

    try {
      const result = await apiGet<PredictionData>(
        `/api/prediction/${id}`
      );

      setData(result);
      setCustomerId(id);
      setCustomerInput(String(id));
    } catch (error) {
      console.error("Prediction API error:", error);

      setData(null);

      setSearchError(
        `Customer ${id} could not be found or the prediction API is unavailable.`
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     Load default customer AFTER first render.
     
     Important:
     We intentionally use useEffect here instead of calling
     loadPrediction() directly inside the component render.
     --------------------------------------------------------- */

  useEffect(() => {
    loadPrediction(1150086);
  }, []);

  /* ---------------------------------------------------------
     Search
     --------------------------------------------------------- */

  function handleSearch() {
    const id = Number(customerInput.trim());

    if (!Number.isInteger(id) || id <= 0) {
      setSearchError("Please enter a valid numeric customer ID.");
      return;
    }

    loadPrediction(id);
  }

  /* ---------------------------------------------------------
     Derived values
     --------------------------------------------------------- */

  const probability = data?.buyProbability ?? 0;
  const threshold = data?.threshold ?? 0.97;
  const predictedBuyer = data?.predictedBuyer === 1;

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Engagement Prediction Lab"
        title="Explainable customer prediction."
        description="Explore the real Module 3 XGBoost prediction for any RetailRocket customer. Every displayed value comes from the trained project pipeline."
        actions={
          <Chip tone="primary">
            <Brain className="w-3 h-3" />
            XGBoost · Module 3 V2
          </Chip>
        }
      />

      {/* =====================================================
          CUSTOMER SEARCH
          ===================================================== */}

      <GlassCard className="p-5 mt-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Customer ID
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  value={customerInput}
                  onChange={(e) => setCustomerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Enter RetailRocket customer ID"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-mono outline-none focus:border-primary/50 transition"
                />
              </div>

              <button
                onClick={handleSearch}
                className="rounded-xl px-5 py-3 bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition"
              >
                <Search className="w-4 h-4" />
                Predict
              </button>
            </div>

            {searchError && (
              <div className="mt-2 text-xs text-rose flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                {searchError}
              </div>
            )}
          </div>

          {data && (
            <div className="flex items-center gap-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Loaded Customer
              </div>

              <Chip tone="primary">{data.visitorId}</Chip>
            </div>
          )}
        </div>
      </GlassCard>

      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && !data ? (
        <GlassCard className="p-10 mt-4 text-center">
          <div className="text-sm text-muted-foreground">
            Loading prediction...
          </div>
        </GlassCard>
      ) : data ? (
        <>
          {/* =================================================
              MAIN PREDICTION
              ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
            <GlassCard className="p-6 xl:col-span-2" glow>
              <SectionTitle
                title="Prediction Result"
                subtitle={`Customer ${data.visitorId}`}
                right={
                  predictedBuyer ? (
                    <Chip tone="emerald">
                      <CheckCircle2 className="w-3 h-3" />
                      Predicted Buyer
                    </Chip>
                  ) : (
                    <Chip>
                      <Target className="w-3 h-3" />
                      Predicted Non-Buyer
                    </Chip>
                  )
                }
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BigStat
                  label="Buy Probability"
                  value={`${(probability * 100).toFixed(2)}%`}
                  accent="primary"
                />

                <BigStat
                  label="Decision Threshold"
                  value={`${(threshold * 100).toFixed(0)}%`}
                  accent="amber"
                />

                <BigStat
                  label="Segment"
                  value={data.segment}
                  accent="violet"
                  mono={false}
                />

                <BigStat
                  label="CLV Tier"
                  value={data.clvTier}
                  accent="emerald"
                  mono={false}
                />
              </div>

              {/* Probability meter */}

              <div className="mt-5 p-4 rounded-xl glass">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
                  <span>Purchase probability</span>

                  <span>
                    Threshold {(threshold * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-primary)] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        probability * 100
                      )}%`,
                    }}
                  />

                  <div
                    className="absolute top-[-4px] bottom-[-4px] w-px bg-amber"
                    style={{
                      left: `${Math.min(
                        100,
                        threshold * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>0%</span>

                  <span className="text-amber">
                    Threshold {(threshold * 100).toFixed(0)}%
                  </span>

                  <span>100%</span>
                </div>
              </div>

              {/* Customer state */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <InfoPill
                  icon={<Users className="w-3.5 h-3.5" />}
                  label="Behavior"
                  value={data.behaviorType}
                />

                <InfoPill
                  icon={<Activity className="w-3.5 h-3.5" />}
                  label="Engagement"
                  value={data.engagementLevel}
                />

                <InfoPill
                  icon={<Database className="w-3.5 h-3.5" />}
                  label="Customer ID"
                  value={String(data.rawId)}
                />

                <InfoPill
                  icon={<ShieldCheck className="w-3.5 h-3.5" />}
                  label="Prediction"
                  value={predictedBuyer ? "BUY" : "NO BUY"}
                />
              </div>
            </GlassCard>

            {/* =================================================
                MODEL INPUTS
                ================================================= */}

            <GlassCard className="p-6">
              <SectionTitle
                title="Model Inputs"
                subtitle="Real customer behavior"
              />

              <div className="space-y-3">
                <FeatureRow
                  icon={<Eye className="w-4 h-4" />}
                  label="Total Views"
                  value={data.features.totalViews.toLocaleString()}
                />

                <FeatureRow
                  icon={<ShoppingCart className="w-4 h-4" />}
                  label="Cart Additions"
                  value={data.features.totalAddToCarts.toLocaleString()}
                />

                <FeatureRow
                  icon={<Activity className="w-4 h-4" />}
                  label="Engagement Score"
                  value={data.features.engagementScore.toLocaleString()}
                />

                <FeatureRow
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Total Events"
                  value={data.features.totalEvents.toLocaleString()}
                />

                <FeatureRow
                  icon={<Target className="w-4 h-4" />}
                  label="View → Cart Rate"
                  value={`${data.features.viewToCartRate.toFixed(2)}%`}
                />

                <FeatureRow
                  icon={<Activity className="w-4 h-4" />}
                  label="Activity Ratio"
                  value={data.features.activityRatio.toFixed(4)}
                />

                <FeatureRow
                  icon={<Brain className="w-4 h-4" />}
                  label="Engagement Percentile"
                  value={`${data.features.engagementPercentile.toFixed(
                    1
                  )}%`}
                />

                <FeatureRow
                  icon={<ShoppingCart className="w-4 h-4" />}
                  label="Cart Rate Flag"
                  value={
                    data.features.cartRateFlag
                      ? "Active"
                      : "Inactive"
                  }
                />
              </div>
            </GlassCard>
          </div>

          {/* =================================================
              FEATURE IMPORTANCE + MODEL PERFORMANCE
              ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
            <GlassCard className="p-6">
              <SectionTitle
                title="Feature Importance"
                subtitle="Actual XGBoost feature importance from Module 3 V2"
              />

              <div className="space-y-4">
                {data.featureImportance.map((feature) => (
                  <div key={feature.feature}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        {feature.feature}
                      </span>

                      <span className="text-xs font-mono">
                        {(feature.value * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                        style={{
                          width: `${Math.min(
                            100,
                            feature.value * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl glass p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Strongest signal
                </div>

                <div className="mt-1 text-sm font-medium">
                  Cart Additions
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Cart additions contribute 90% of the reported
                  feature importance in the Module 3 V2 model.
                </div>
              </div>
            </GlassCard>

            {/* Model performance */}

            <GlassCard className="p-6">
              <SectionTitle
                title="Model Performance"
                subtitle="Held-out test set"
                right={
                  <Chip tone="emerald">
                    <Trophy className="w-3 h-3" />
                    XGBoost Champion
                  </Chip>
                }
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetricBox
                  label="ROC-AUC"
                  value={data.modelPerformance.rocAuc.toFixed(3)}
                />

                <MetricBox
                  label="Accuracy"
                  value={`${(
                    data.modelPerformance.accuracy * 100
                  ).toFixed(2)}%`}
                />

                <MetricBox
                  label="Precision"
                  value={data.modelPerformance.precision.toFixed(4)}
                />

                <MetricBox
                  label="Recall"
                  value={data.modelPerformance.recall.toFixed(4)}
                />

                <MetricBox
                  label="F1 Score"
                  value={data.modelPerformance.f1.toFixed(4)}
                />

                <MetricBox
                  label="Avg Precision"
                  value={data.modelPerformance.averagePrecision.toFixed(
                    4
                  )}
                />
              </div>

              <div className="mt-5 rounded-xl glass p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Classification threshold
                    </div>

                    <div className="mt-1 text-lg font-semibold font-mono">
                      {(
                        data.modelPerformance.threshold * 100
                      ).toFixed(0)}
                      %
                    </div>
                  </div>

                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* =================================================
              CROSS VALIDATION
              ================================================= */}

          <GlassCard className="p-6 mt-4">
            <SectionTitle
              title="Cross-Validation Stability"
              subtitle="Five-fold evaluation of the model"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricBox
                label="Folds"
                value={String(data.crossValidation.folds)}
              />

              <MetricBox
                label="Mean ROC-AUC"
                value={data.crossValidation.meanAuc.toFixed(4)}
              />

              <MetricBox
                label="Std. Deviation"
                value={data.crossValidation.stdAuc.toFixed(4)}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald" />

              Low AUC variation across folds indicates stable model
              performance.
            </div>
          </GlassCard>

          {/* =================================================
              MODEL COMPARISON
              ================================================= */}

          <GlassCard className="p-6 mt-4">
            <SectionTitle
              title="Model Comparison"
              subtitle="Actual Module 3 V2 benchmark results"
              right={
                <Chip tone="emerald">
                  <Trophy className="w-3 h-3" />
                  Champion: XGBoost
                </Chip>
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr className="border-b border-white/5">
                    <th className="text-left font-medium py-3 px-2">
                      Model
                    </th>

                    <th className="text-left font-medium py-3 px-2">
                      Accuracy
                    </th>

                    <th className="text-left font-medium py-3 px-2">
                      ROC-AUC
                    </th>

                    <th className="text-left font-medium py-3 px-2">
                      Precision
                    </th>

                    <th className="text-left font-medium py-3 px-2">
                      Recall
                    </th>

                    <th className="text-left font-medium py-3 px-2">
                      F1
                    </th>

                    <th className="text-left font-medium py-3 px-2">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.modelComparison.map((model) => (
                    <tr
                      key={model.model}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition"
                    >
                      <td className="py-3 px-2 font-medium">
                        {model.model}
                      </td>

                      <td className="py-3 px-2 font-mono">
                        {(model.accuracy * 100).toFixed(2)}%
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-[image:var(--gradient-primary)]"
                              style={{
                                width: `${Math.min(
                                  100,
                                  model.rocAuc * 100
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="font-mono text-xs">
                            {model.rocAuc.toFixed(4)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2 font-mono">
                        {model.precision.toFixed(4)}
                      </td>

                      <td className="py-3 px-2 font-mono">
                        {model.recall.toFixed(4)}
                      </td>

                      <td className="py-3 px-2 font-mono">
                        {model.f1.toFixed(4)}
                      </td>

                      <td className="py-3 px-2">
                        {model.status === "Champion" ? (
                          <Chip tone="emerald">
                            <Trophy className="w-3 h-3" />
                            Champion
                          </Chip>
                        ) : (
                          <Chip>Candidate</Chip>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* =================================================
              DATA INTEGRITY NOTE
              ================================================= */}

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <Database className="w-4 h-4 text-primary mt-0.5" />

              <div>
                <div className="text-xs font-medium">
                  Prediction source
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  This page is connected to the Flask Prediction Lab
                  API and displays the stored Module 3 V2 XGBoost
                  results for the selected RetailRocket customer. No
                  frontend prediction formula or synthetic customer
                  values are used.
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
   ========================================================= */

function BigStat({
  label,
  value,
  accent,
  mono = true,
}: {
  label: string;
  value: string;
  accent: "primary" | "emerald" | "violet" | "amber";
  mono?: boolean;
}) {
  const map: Record<string, string> = {
    primary: "from-primary/25",
    emerald: "from-emerald/25",
    violet: "from-violet/25",
    amber: "from-amber/25",
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden p-4 border border-white/5 bg-gradient-to-br to-transparent ${map[accent]}`}
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div
        className={`mt-1 text-2xl font-semibold ${
          mono ? "font-display" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl glass p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}

        <span className="text-[10px] uppercase tracking-widest">
          {label}
        </span>
      </div>

      <div className="mt-2 text-sm font-medium">
        {value}
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>

        <span className="text-xs text-muted-foreground">
          {label}
        </span>
      </div>

      <span className="text-xs font-mono font-medium">
        {value}
      </span>
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl glass p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 text-xl font-semibold font-mono">
        {value}
      </div>
    </div>
  );
}