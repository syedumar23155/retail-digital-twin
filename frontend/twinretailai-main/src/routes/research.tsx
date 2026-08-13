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
  Network,
  BookOpen,
  Brain,
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
    value: "1.4M",
  },
  {
    label: "Features",
    value: "22",
  },
  {
    label: "Segments",
    value: "5",
  },
  {
    label: "Recommendations",
    value: "10K+",
  },
];

const featureImportance = [
  {
    name: "Cart Additions",
    value: 90,
  },
  {
    name: "Total Views",
    value: 5,
  },
  {
    name: "Engagement",
    value: 2,
  },
  {
    name: "Events",
    value: 1,
  },
  {
    name: "View→Cart",
    value: 1,
  },
  {
    name: "Percentile",
    value: 1,
  },
];

const models = [
  {
    model: "RetailTwin XGBoost",
    accuracy: 0.9824,
    auc: 0.974,
    f1: 0.4516,
    best: true,
  },
  {
    model: "Gradient Boosting",
    accuracy: 0.9816,
    auc: 0.9718,
    f1: 0.4379,
    best: false,
  },
  {
    model: "Random Forest",
    accuracy: 0.9807,
    auc: 0.9685,
    f1: 0.4224,
    best: false,
  },
  {
    model: "Logistic Regression",
    accuracy: 0.9312,
    auc: 0.9124,
    f1: 0.1798,
    best: false,
  },
];

const pipeline = [
  "RetailRocket",
  "Digital Twin",
  "Segmentation",
  "Prediction",
  "Recommendation",
  "Simulation",
  "Dashboard",
];

const contributions = [
  "1.4M customer digital twins",
  "Behavioral customer segmentation",
  "Real-time engagement prediction",
  "Cross-channel recommendation engine",
  "Customer journey simulation",
  "Omnichannel analytics dashboard",
];

function ResearchObservatory() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-8">
      <PageHeader
        eyebrow="Research Observatory"
        title="Retail Digital Twin Research Laboratory"
        description="Reproducible AI research built on real RetailRocket customer behavior."
        actions={
          <Chip tone="primary">
            <FlaskConical className="w-3 h-3" />
            IEEE Ready
          </Chip>
        }
      />

      <GlassCard className="p-6 mt-8">
        <SectionTitle
          title="Dataset Observatory"
          subtitle="Real dataset statistics"
          right={<Database className="w-4 h-4" />}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {datasetStats.map((item) => (
            <div
              key={item.label}
              className="glass rounded-xl p-5 text-center"
            >
              <div className="text-3xl font-bold">
                {item.value}
              </div>

              <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 mt-4">
        <SectionTitle
          title="Customer Behavior Digital Twin Architecture"
          subtitle="End-to-end retail intelligence pipeline"
          right={<Network className="w-4 h-4" />}
        />

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {pipeline.map((step) => (
            <div
              key={step}
              className="glass rounded-xl p-4 text-center text-sm font-medium"
            >
              {step}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid xl:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-6">
          <SectionTitle
            title="Feature Importance"
            subtitle="Real XGBoost behavioral signals"
            right={<Layers className="w-4 h-4" />}
          />

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance}>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
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

        <GlassCard className="p-6">
          <SectionTitle
            title="Model Benchmark"
            subtitle="Module 3 evaluation results"
            right={
              <Chip tone="emerald">
                <Award className="w-3 h-3" />
                Champion
              </Chip>
            }
          />

          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.model}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {model.model}
                  </div>

                  {model.best && (
                    <Chip tone="emerald">
                      #1
                    </Chip>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <Metric
                    label="Accuracy"
                    value={`${(
                      model.accuracy * 100
                    ).toFixed(2)}%`}
                  />

                  <Metric
                    label="ROC-AUC"
                    value={model.auc.toFixed(3)}
                  />

                  <Metric
                    label="F1 Score"
                    value={model.f1.toFixed(3)}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <GlassCard className="p-6">
          <SectionTitle
            title="Explainable AI"
            subtitle="Why does the model predict purchases?"
            right={<Brain className="w-4 h-4" />}
          />

          <div className="space-y-3">
            {[
              "High engagement score",
              "Strong view-to-cart conversion",
              "Large interaction volume",
              "High activity ratio",
              "High-intent customer segment",
            ].map((item) => (
              <div
                key={item}
                className="glass rounded-xl p-3"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle
            title="Research Contributions"
            subtitle="Project deliverables"
            right={<Lightbulb className="w-4 h-4" />}
          />

          <div className="space-y-3">
            {contributions.map((item) => (
              <div
                key={item}
                className="glass rounded-xl p-3"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 mt-4">
        <SectionTitle
          title="Research Findings"
          subtitle="Contributions, limitations and future work"
          right={<BookOpen className="w-4 h-4" />}
        />

        <div className="grid md:grid-cols-3 gap-4">
          <Finding
            title="Contribution"
            text="Generated 1.4 million behavioral digital twins from real-world customer interactions."
          />

          <Finding
            title="Limitation"
            text="RetailRocket provides anonymous product identifiers, limiting product-level explainability."
          />

          <Finding
            title="Future Work"
            text="Integrate transformer-based sequential recommendation models and continual learning."
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
    <div className="rounded-lg bg-white/[0.03] p-3 text-center">
      <div className="text-xs text-muted-foreground">
        {label}
      </div>

      <div className="font-mono font-bold mt-1">
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

      <div className="mt-2 text-sm text-muted-foreground">
        {text}
      </div>
    </div>
  );
}

export default ResearchObservatory;