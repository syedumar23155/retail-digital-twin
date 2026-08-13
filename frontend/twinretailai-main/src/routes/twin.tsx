import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  User,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Clock,
  Package,
  Info,
  Activity,
  Target,
  Eye,
  ShoppingCart,
  CreditCard,
  RefreshCw,
  ArrowUpRight,
  Database,
  Brain,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from "recharts";

import {
  GlassCard,
  PageHeader,
  SectionTitle,
} from "@/components/premium";

import { useTwin } from "@/hooks/use-twin";

export const Route = createFileRoute("/twin")({
  component: TwinExplorer,
});

/* ============================================================
   REPRESENTATIVE CUSTOMERS
   ============================================================

   These are REAL RetailRocket visitor IDs already verified
   against the project's processed Digital Twin dataset.

   We deliberately include a low-probability customer so the
   explorer demonstrates the real range of model outputs instead
   of showing five nearly identical high-intent customers.
============================================================ */

const REPRESENTATIVE_CUSTOMERS = [
  {
    id: 1150086,
    fallbackSegment: "Power Buyer",
    description: "High activity",
    icon: Sparkles,
  },
  {
    id: 1150114,
    fallbackSegment: "Passive Visitor",
    description: "Low activity",
    icon: Eye,
  },
  {
    id: 719708,
    fallbackSegment: "Engaged Browser",
    description: "High-intent cart",
    icon: ShoppingCart,
  },
  {
    id: 1032742,
    fallbackSegment: "Engaged Browser",
    description: "High-intent cart",
    icon: ShoppingCart,
  },
  {
    id: 371257,
    fallbackSegment: "Engaged Browser",
    description: "High-intent cart",
    icon: ShoppingCart,
  },
];

/* ============================================================
   HELPERS
============================================================ */

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function segmentTone(segment: string) {
  switch (segment) {
    case "Power Buyer":
      return "border-violet-400/30 bg-violet-400/10 text-violet-300";

    case "Buyer":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

    case "Engaged Browser":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

    case "Window Shopper":
      return "border-amber-400/30 bg-amber-400/10 text-amber-300";

    default:
      return "border-slate-400/20 bg-slate-400/10 text-slate-300";
  }
}

function probabilityTone(probability: number) {
  if (probability >= 0.75) {
    return "text-emerald-300";
  }

  if (probability >= 0.5) {
    return "text-cyan-300";
  }

  if (probability >= 0.2) {
    return "text-amber-300";
  }

  return "text-slate-300";
}

function eventIcon(event: string) {
  if (event.toLowerCase().includes("purchase")) {
    return CreditCard;
  }

  if (event.toLowerCase().includes("cart")) {
    return ShoppingCart;
  }

  return Eye;
}

/* ============================================================
   MAIN PAGE
============================================================ */

function TwinExplorer() {
  const [q, setQ] = useState("C-1150086");
  const [selectedVisitorId, setSelectedVisitorId] =
    useState<number | null>(1150086);

  const { data, isLoading, isError, error } =
    useTwin(selectedVisitorId);

  /* ----------------------------------------------------------
     Search
  ---------------------------------------------------------- */

  const handleResolveTwin = () => {
    const rawId = q.trim().replace(/^C-/i, "");

    if (!/^\d+$/.test(rawId)) {
      return;
    }

    setSelectedVisitorId(Number(rawId));
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleResolveTwin();
    }
  };

  /* ----------------------------------------------------------
     Representative customer selection
  ---------------------------------------------------------- */

  const selectRepresentative = (id: number) => {
    setQ(`C-${id}`);
    setSelectedVisitorId(id);
  };

  /* ----------------------------------------------------------
     Radar chart
  ---------------------------------------------------------- */

  const radarData = useMemo(() => {
    if (!data) return [];

    return data.radar.map((point) => ({
      trait: point.trait,
      value: point.value,
      fullMark: 100,
    }));
  }, [data]);

  /* ----------------------------------------------------------
     Probability chart
  ---------------------------------------------------------- */

  const probabilityData = useMemo(() => {
    if (!data) return [];

    return [
      {
        name: "Probability",
        value: Number((data.buyProbability * 100).toFixed(2)),
      },
    ];
  }, [data]);

  /* ----------------------------------------------------------
     Max feature importance
  ---------------------------------------------------------- */

  const maxFeatureWeight = useMemo(() => {
    if (!data?.featureImportance?.length) return 1;

    return Math.max(
      ...data.featureImportance.map((item) => item.weight),
      1
    );
  }, [data]);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader
        eyebrow="Customer Digital Twin Explorer"
        title="Every customer, modeled as a living twin."
        description="Behavioral, transactional and contextual signals unified into a single explainable representation."
      />

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <GlassCard className="mt-6 p-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground ml-3" />

        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Enter customer ID..."
          className="flex-1 bg-transparent px-1 py-2.5 text-sm focus:outline-none placeholder:text-muted-foreground/60"
        />

        <button
          onClick={handleResolveTwin}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-[image:var(--gradient-primary)] text-background text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Resolving...
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              Resolve Twin
            </>
          )}
        </button>
      </GlassCard>

      {/* ======================================================
          REPRESENTATIVE CUSTOMERS
      ====================================================== */}

      <GlassCard className="mt-5 p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />

              <h2 className="text-sm font-semibold">
                Representative Customers
              </h2>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Quickly explore real RetailRocket customer profiles
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Database className="w-3 h-3" />
            Live dataset
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
          {REPRESENTATIVE_CUSTOMERS.map((customer) => {
            const Icon = customer.icon;
            const active =
              selectedVisitorId === customer.id;

            return (
              <button
                key={customer.id}
                onClick={() =>
                  selectRepresentative(customer.id)
                }
                className={[
                  "text-left rounded-xl border p-3 transition-all",
                  "hover:bg-white/[0.04]",
                  active
                    ? "border-cyan-400/60 bg-cyan-400/[0.08] shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                    : "border-white/[0.08] bg-white/[0.015]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center",
                      active
                        ? "bg-cyan-400/15 text-cyan-300"
                        : "bg-white/[0.05] text-muted-foreground",
                    ].join(" ")}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">
                      {customer.fallbackSegment}
                    </div>

                    <div className="text-[10px] text-muted-foreground truncate">
                      {customer.description} · C-
                      {customer.id}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Representative customers are real RetailRocket visitor
            profiles. Their model probabilities are loaded from the
            backend rather than generated by the interface.
          </p>
        </div>
      </GlassCard>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {isLoading && (
        <GlassCard className="mt-5 p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />

            <div>
              <div className="text-sm font-medium">
                Resolving Digital Twin
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                Loading real customer intelligence for {q}...
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {isError && (
        <GlassCard className="mt-5 p-6 border border-red-500/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-red-400" />
            </div>

            <div>
              <div className="text-sm font-medium text-red-300">
                Unable to resolve customer
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                Customer {q} could not be loaded from the Digital
                Twin API.
              </div>

              <div className="text-[11px] text-red-400/80 mt-2 font-mono">
                {error instanceof Error
                  ? error.message
                  : "Unknown API error"}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ======================================================
          MAIN CUSTOMER CONTENT
      ====================================================== */}

      {!isLoading && !isError && data && (
        <>
          {/* ====================================================
              PROFILE + PROBABILITY
          ==================================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-5">
            {/* PROFILE */}

            <GlassCard className="p-6 xl:col-span-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center">
                      <User className="w-8 h-8 text-background" />
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-4 border-background" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {data.visitorId}
                      </h2>

                      <span
                        className={[
                          "px-2 py-1 rounded-full border text-[10px] font-medium",
                          segmentTone(data.segment),
                        ].join(" ")}
                      >
                        {data.segment}
                      </span>

                      <span className="px-2 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-300 text-[10px]">
                        CLV · {data.clvTier}
                      </span>

                      <span className="px-2 py-1 rounded-full border border-violet-400/20 bg-violet-400/5 text-violet-300 text-[10px]">
                        {data.behaviorType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Active {data.activeDays} days
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {data.engagementLevel} engagement
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {formatNumber(data.totalPurchases)} purchases
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Raw visitor ID
                  </div>

                  <div className="font-mono text-sm mt-1">
                    {data.rawId}
                  </div>
                </div>
              </div>

              {/* KPI STRIP */}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
                <MetricCard
                  label="Funnel Position"
                  value={data.funnelPosition}
                  icon={Target}
                  tone="emerald"
                />

                <MetricCard
                  label="Total Views"
                  value={formatNumber(data.totalViews)}
                  icon={Eye}
                  tone="cyan"
                />

                <MetricCard
                  label="Add To Carts"
                  value={formatNumber(data.totalAddToCarts)}
                  icon={ShoppingCart}
                  tone="violet"
                />

                <MetricCard
                  label="Engagement"
                  value={`${data.engagementPercentile.toFixed(1)} percentile`}
                  icon={Activity}
                  tone="amber"
                />
              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <InfoRow
                  label="First seen"
                  value={formatDate(data.firstSeen)}
                />

                <InfoRow
                  label="Last seen"
                  value={formatDate(data.lastSeen)}
                />
              </div>
            </GlassCard>

            {/* PROBABILITY */}

            <GlassCard className="p-6 flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Buy Probability
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    XGBoost model output
                  </div>
                </div>

                <Brain className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="flex-1 min-h-[250px] flex items-center justify-center">
                <div className="w-full h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="65%"
                      outerRadius="92%"
                      startAngle={220}
                      endAngle={-40}
                      data={probabilityData}
                      barSize={18}
                      cx="50%"
                      cy="55%"
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={12}
                        fill="var(--color-cyan-400)"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                    <div
                      className={[
                        "text-4xl font-semibold tracking-tight",
                        probabilityTone(data.buyProbability),
                      ].join(" ")}
                    >
                      {formatPercent(data.buyProbability)}
                    </div>

                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                      model output
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <MiniStat
                  label="Predicted state"
                  value={
                    data.buyProbability >= 0.97
                      ? "High intent"
                      : data.buyProbability >= 0.5
                        ? "Likely"
                        : data.buyProbability >= 0.2
                          ? "Developing"
                          : "Low intent"
                  }
                />

                <MiniStat
                  label="Engagement"
                  value={`${data.engagementPercentile.toFixed(1)}%`}
                />
              </div>
            </GlassCard>
          </div>

          {/* ====================================================
              MODEL NARRATIVE
          ==================================================== */}

          <GlassCard className="mt-4 p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-cyan-300">
                  Digital Twin Interpretation
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                  {data.narrative}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* ====================================================
              RADAR + FEATURE IMPORTANCE
          ==================================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
            {/* RADAR */}

            <GlassCard className="p-6">
              <SectionTitle
                title="Behavioral Twin Profile"
                subtitle="Real percentile and intent signals for this customer"
              />

              <div className="h-[360px] mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />

                    <PolarAngleAxis
                      dataKey="trait"
                      tick={{
                        fill: "rgba(255,255,255,0.65)",
                        fontSize: 10,
                      }}
                    />

                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{
                        fill: "rgba(255,255,255,0.35)",
                        fontSize: 9,
                      }}
                    />

                    <Radar
                      name="Customer"
                      dataKey="value"
                      stroke="var(--color-cyan-400)"
                      fill="var(--color-cyan-400)"
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.96)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        fontSize: 11,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.radar.map((point) => (
                  <div
                    key={point.trait}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                  >
                    <div className="text-[10px] text-muted-foreground">
                      {point.trait}
                    </div>

                    <div className="font-mono text-sm mt-1">
                      {point.value.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* FEATURE IMPORTANCE */}

            <GlassCard className="p-6">
              <SectionTitle
                title="Model Signal Importance"
                subtitle="Global XGBoost feature importance used by the project"
              />

              <div className="space-y-5 mt-7">
                {data.featureImportance.map((item) => {
                  const width =
                    (item.weight / maxFeatureWeight) * 100;

                  return (
                    <div key={item.feature}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs">
                          {item.feature}
                        </span>

                        <span className="font-mono text-xs text-muted-foreground">
                          {(item.weight * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-white/[0.05] mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 mt-0.5" />

                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    These are global model feature importances from
                    the trained XGBoost classifier. They are not
                    fabricated per-customer SHAP values.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ====================================================
              JOURNEY TIMELINE
          ==================================================== */}

          <GlassCard className="mt-4 p-6">
            <SectionTitle
              title="Journey Timeline"
              subtitle="Real RetailRocket online event history for this customer"
            />

            {data.timeline.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No event history available for this customer.
              </div>
            ) : (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />

                  <div className="space-y-5">
                    {data.timeline.map((event, index) => {
                      const Icon = eventIcon(event.event);

                      return (
                        <div
                          key={`${event.date}-${event.time}-${event.itemId}-${index}`}
                          className="relative flex items-start gap-4"
                        >
                          <div className="relative z-10 w-4 h-4 rounded-full border-2 border-background bg-[image:var(--gradient-primary)] mt-1 shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />

                                <span className="text-sm font-medium truncate">
                                  {event.event}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                  ·
                                </span>

                                <span className="font-mono text-xs text-cyan-300 truncate">
                                  {event.itemId}
                                </span>
                              </div>

                              <span className="font-mono text-[11px] text-muted-foreground">
                                {event.time}
                              </span>
                            </div>

                            <div className="text-[11px] text-muted-foreground mt-1">
                              {event.channel} · {event.date}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* ====================================================
              RECOMMENDATIONS
          ==================================================== */}

          <GlassCard className="mt-4 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <SectionTitle
                title="Personalized Recommendations"
                subtitle="Real ranked items generated by the Hybrid Recommender"
              />

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.04] text-[10px] uppercase tracking-widest text-cyan-300">
                <Sparkles className="w-3 h-3" />
                Live recommendation state
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {data.recommendations.map((recommendation) => (
                <div
                  key={`${recommendation.rank}-${recommendation.itemId}`}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 hover:bg-white/[0.035] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center text-background font-mono text-xs font-semibold">
                        #{recommendation.rank}
                      </div>

                      <div>
                        <div className="font-mono text-sm font-medium">
                          {recommendation.itemId}
                        </div>

                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                          {recommendation.tag}
                        </div>
                      </div>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                    {recommendation.reason}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] p-4">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />

                <div>
                  <div className="text-xs font-medium text-amber-200">
                    RetailRocket catalog limitation
                  </div>

                  <p className="text-[11px] leading-relaxed text-muted-foreground mt-1">
                    RetailRocket provides anonymous item IDs only.
                    Product names, categories and prices are not
                    available in the recommendation pipeline, so
                    the system intentionally displays real item IDs
                    instead of inventing product metadata.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ====================================================
              CUSTOMER SIGNAL SUMMARY
          ==================================================== */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <SummaryCard
              icon={Eye}
              label="Views"
              value={formatNumber(data.totalViews)}
              detail="Real event count"
            />

            <SummaryCard
              icon={ShoppingCart}
              label="Cart additions"
              value={formatNumber(data.totalAddToCarts)}
              detail="Real event count"
            />

            <SummaryCard
              icon={CreditCard}
              label="Purchases"
              value={formatNumber(data.totalPurchases)}
              detail="Real transactions"
            />

            <SummaryCard
              icon={TrendingUp}
              label="Buy probability"
              value={formatPercent(data.buyProbability)}
              detail="XGBoost output"
            />
          </div>

          {/* ====================================================
              DATA INTEGRITY FOOTER
          ==================================================== */}

          <div className="mt-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Real RetailRocket customer data
            </div>

            <div className="flex items-center gap-4">
              <span>Visitor {data.rawId}</span>

              <span>·</span>

              <span>Backend resolved</span>

              <span>·</span>

              <span>XGBoost scored</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   REUSABLE UI COMPONENTS
============================================================ */

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "cyan" | "violet" | "amber";
}) {
  const toneClasses = {
    emerald:
      "border-emerald-400/20 bg-emerald-400/[0.035] text-emerald-300",
    cyan:
      "border-cyan-400/20 bg-cyan-400/[0.035] text-cyan-300",
    violet:
      "border-violet-400/20 bg-violet-400/[0.035] text-violet-300",
    amber:
      "border-amber-400/20 bg-amber-400/[0.035] text-amber-300",
  };

  return (
    <div
      className={[
        "rounded-xl border p-4 min-h-[104px]",
        toneClasses[tone],
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>

        <Icon className="w-4 h-4 opacity-70" />
      </div>

      <div className="text-lg font-semibold mt-4 leading-tight">
        {value}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div className="text-xs font-mono mt-1">
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div className="text-xs font-medium mt-1">
        {value}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>

        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">
        {label}
      </div>

      <div className="font-mono text-xl font-semibold mt-1">
        {value}
      </div>

      <div className="text-[10px] text-muted-foreground mt-1">
        {detail}
      </div>
    </GlassCard>
  );
}