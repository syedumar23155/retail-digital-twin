import { createFileRoute } from "@tanstack/react-router";
import {
  GlassCard,
  PageHeader,
  SectionTitle,
  Chip,
} from "@/components/premium";

import {
  FlaskConical,
  Database,
  Award,
  GitBranch,
  BookOpen,
  Brain,
  Network,
  Lightbulb,
  Layers,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { tooltipStyle } from "./index";

export const Route = createFileRoute("/research")({
  component: ResearchObservatory,
});

const datasetStats = [
  {
    label: "Digital Twins",
    value: "1,407,580",
  },
  {
    label: "Features",
    value: "22",
  },
  {
    label: "Behavior Segments",
    value: "5",
  },
  {
    label: "Recommendation Records",
    value: "10K+",
  },
];

const segmentDistribution = [
  {
    name: "Passive Visitor",
    value: 1325326,
  },
  {
    name: "Window Shopper",
    value: 43389,
  },
  {
    name: "Engaged Browser",
    value: 27146,
  },
  {
    name: "Buyer",
    value: 11581,
  },
  {
    name: "Power Buyer",
    value: 138,
  },
];

const benchmarkModels = [
  {
    model: "RetailTwin-XGBoost",
    accuracy: 0.982,
    auc: 0.974,
    f1: 0.452,
    champion: true,
  },
  {
    model: "Gradient Boosting",
    accuracy: 0.982,
    auc: 0.972,
    f1: 0.438,
  },
  {
    model: "Random Forest",
    accuracy: 0.981,
    auc: 0.969,
    f1: 0.422,
  },
  {
    model: "Logistic Regression",
    accuracy: 0.931,
    auc: 0.912,
    f1: 0.18,
  },
];

const explainableAI = [
  "High engagement score",
  "Strong view-to-cart conversion",
  "Large interaction volume",
  "High activity ratio",
  "High-intent customer segment",
];

const contributions = [
  "Digital Twin Generation",
  "Customer Segmentation",
  "XGBoost Purchase Prediction",
  "Recommendation Intelligence",
  "What-if Journey Simulation",
  "Omnichannel Analytics Dashboard",
];

const findings = [
  {
    title: "Contribution",
    value: "Generated 1.4 million behavioral digital twins.",
  },
  {
    title: "Limitation",
    value: "Anonymous RetailRocket item identifiers limit explainability.",
  },
  {
    title: "Future Work",
    value: "Transformer-based sequential recommendation models.",
  },
];

function ResearchObservatory() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-8">
      <PageHeader
        eyebrow="Research Observatory"
        title="AI Research, Experimentation & Explainability"
        description="A complete research environment built on real RetailRocket customer behavior."
        actions={
          <Chip tone="primary">
            <FlaskConical className="w-3 h-3" />
            IEEE Ready
          </Chip>
        }
      />

      {/* Dataset */}

      <GlassCard className="p-6 mt-8">
        <SectionTitle
          title="Dataset Observatory"
          subtitle="Processed RetailRocket behavioral data"
          right={<Database className="w-4 h-4" />}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {datasetStats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl glass p-5 text-center"
            >
              <div className="text-2xl font-bold">{item.value}</div>

              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Pipeline */}

      <GlassCard className="p-6 mt-4">
        <SectionTitle
          title="AI Pipeline Architecture"
          subtitle="End-to-end digital twin generation"
          right={<Network className="w-4 h-4" />}
        />

        <div className="grid md:grid-cols-7 gap-3 text-center">
          {[
            "RetailRocket",
            "Feature Engineering",
            "Segmentation",
            "XGBoost",
            "Recommendations",
            "Simulation",
            "Analytics",
          ].map((step) => (
            <div
              key={step}
              className="glass rounded-xl p-4 text-sm font-medium"
            >
              {step}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Feature importance */}

      <div className="grid xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-6">
          <SectionTitle
            title="Feature Engineering"
            subtitle="Behavioral importance analysis"
            right={<Layers className="w-4 h-4" />}
          />

          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={features}>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip contentStyle={tooltipStyle} />

                <Bar
                  dataKey="value"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Model leaderboard */}

        <GlassCard className="p-6">
          <SectionTitle
            title="Model Benchmark"
            subtitle="Comparative evaluation"
            right={
              <Chip tone="emerald">
                <Award className="w-3 h-3" />
                Champion
              </Chip>
            }
          />

          <div className="space-y-3">
            {leaderboard.map((model) => (
              <div
                key={model.model}
                className="glass rounded-xl p-4"
              >
                <div className="flex justify-between">
                  <div className="font-medium">
                    {model.model}
                  </div>

                  {model.best && (
                    <Chip tone="emerald">
                      Best
                    </Chip>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <Metric
                    label="Accuracy"
                    value={model.accuracy.toFixed(3)}
                  />

                  <Metric
                    label="ROC-AUC"
                    value={model.auc.toFixed(3)}
                  />

                  <Metric
                    label="F1"
                    value={model.f1.toFixed(3)}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Explainability */}

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-6">
          <SectionTitle
            title="Explainable AI"
            subtitle="Why does the model predict a purchase?"
            right={<Brain className="w-4 h-4" />}
          />

          <ul className="space-y-3 text-sm">
            <li>✓ High engagement score</li>
            <li>✓ Strong view-to-cart conversion</li>
            <li>✓ Large interaction volume</li>
            <li>✓ High activity ratio</li>
            <li>✓ Customer belongs to a high-intent segment</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle
            title="Research Contributions"
            subtitle="Project innovations"
            right={<Lightbulb className="w-4 h-4" />}
          />

          <ul className="space-y-3 text-sm">
            <li>✓ Digital Twin Generation</li>
            <li>✓ Customer Segmentation</li>
            <li>✓ XGBoost Purchase Prediction</li>
            <li>✓ Recommendation Intelligence</li>
            <li>✓ What-if Journey Simulation</li>
            <li>✓ Omnichannel Analytics Dashboard</li>
          </ul>
        </GlassCard>
      </div>

      {/* Limitations */}

      <GlassCard className="p-6 mt-4">
        <SectionTitle
          title="Research Findings"
          subtitle="Limitations and future work"
          right={<BookOpen className="w-4 h-4" />}
        />

        <div className="grid md:grid-cols-3 gap-4">
          <Finding
            title="Contribution"
            text="Generated 1.4 million behavioral digital twins from real-world retail interactions."
          />

          <Finding
            title="Limitation"
            text="Anonymous RetailRocket item identifiers limit product-level explainability."
          />

          <Finding
            title="Future Work"
            text="Integrate transformer-based sequential recommendation models."
          />
        </div>
      </GlassCard>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] py-2">
      <div className="text-xs text-muted-foreground">
        {label}
      </div>

      <div className="font-mono font-bold">
        {value}
      </div>
    </div>
  );
}

function Finding({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="font-semibold">
        {title}
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        {text}
      </div>
    </div>
  );
}