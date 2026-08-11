import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  User,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Clock,
  Package,
  Info,
  Zap,
  Users,
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
} from "recharts";

import {
  GlassCard,
  PageHeader,
  SectionTitle,
  Chip,
} from "@/components/premium";

import { useTwin } from "@/hooks/use-twin";

export const Route = createFileRoute("/twin")({
  component: TwinExplorer,
});

function TwinExplorer() {
  const [q, setQ] = useState("C-1150086");
  const [selectedVisitorId, setSelectedVisitorId] =
    useState<number | null>(1150086);

  const { data, isLoading, isError, error } = useTwin(selectedVisitorId);

  const handleResolveTwin = () => {
    const rawId = q.trim().replace(/^C-/i, "");

    if (!/^\d+$/.test(rawId)) {
      return;
    }

    setSelectedVisitorId(Number(rawId));
  };

  const handleQuickSelect = (visitorId: number) => {
    setQ(`C-${visitorId}`);
    setSelectedVisitorId(visitorId);
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Customer Digital Twin Explorer"
        title="Every customer, modeled as a living twin."
        description="Behavioral, transactional and contextual signals unified into a single explainable representation."
      />

      {/* ============================================================
          SEARCH
          ============================================================ */}
      <GlassCard className="mt-6 p-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground ml-3" />

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleResolveTwin();
            }
          }}
          placeholder="Enter customer ID..."
          className="flex-1 bg-transparent px-1 py-2.5 text-sm focus:outline-none placeholder:text-muted-foreground/60"
        />

        <button
          onClick={handleResolveTwin}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-[image:var(--gradient-primary)] text-background text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Resolving..." : "Resolve Twin"}
        </button>
      </GlassCard>

      {/* ============================================================
          QUICK CUSTOMER SELECTOR
          ============================================================ */}
      <GlassCard className="mt-4 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />

          <div>
            <div className="text-sm font-medium">
              Representative Customers
            </div>

            <div className="text-[11px] text-muted-foreground">
              Quickly explore real RetailRocket customer profiles
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <QuickCustomerButton
            icon={<Zap className="w-3.5 h-3.5" />}
            label="Power Buyer"
            visitorId={1150086}
            description="High activity"
            active={selectedVisitorId === 1150086}
            onClick={handleQuickSelect}
          />

          <QuickCustomerButton
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
            label="Engaged Browser"
            visitorId={719708}
            description="High-intent cart"
            active={selectedVisitorId === 719708}
            onClick={handleQuickSelect}
          />

          <QuickCustomerButton
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
            label="Engaged Browser"
            visitorId={1032742}
            description="High-intent cart"
            active={selectedVisitorId === 1032742}
            onClick={handleQuickSelect}
          />

          <QuickCustomerButton
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
            label="Engaged Browser"
            visitorId={1109474}
            description="High-intent cart"
            active={selectedVisitorId === 1109474}
            onClick={handleQuickSelect}
          />

          <QuickCustomerButton
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
            label="Engaged Browser"
            visitorId={371257}
            description="High-intent cart"
            active={selectedVisitorId === 371257}
            onClick={handleQuickSelect}
          />
        </div>
      </GlassCard>

      {/* ============================================================
          LOADING
          ============================================================ */}
      {isLoading && (
        <GlassCard className="mt-6 p-6">
          <div className="text-sm text-muted-foreground">
            Resolving Digital Twin for {q}...
          </div>
        </GlassCard>
      )}

      {/* ============================================================
          ERROR
          ============================================================ */}
      {isError && (
        <GlassCard className="mt-6 p-6 border border-red-500/20">
          <div className="text-sm text-red-400">
            Unable to resolve customer {q}.
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Unknown API error"}
          </div>
        </GlassCard>
      )}

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      {!isLoading && !isError && data && (
        <>
          {/* ============================================================
              CUSTOMER PROFILE + PREDICTION
              ============================================================ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
            {/* Profile */}
            <GlassCard className="p-6 xl:col-span-2" glow>
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[image:var(--gradient-primary)] grid place-items-center">
                    <User className="w-7 h-7 text-background" />
                  </div>

                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald border-2 border-background" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-mono text-lg font-semibold">
                      {data.visitorId}
                    </div>

                    <Chip tone="primary">
                      {data.segment}
                    </Chip>

                    <Chip tone="emerald">
                      CLV · {data.clvTier}
                    </Chip>

                    <Chip tone="violet">
                      {data.behaviorType}
                    </Chip>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Active {data.activeDays} days
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {data.engagementLevel} engagement
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {data.totalPurchases.toLocaleString()} purchases
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <MiniStat
                  label="Funnel Position"
                  value={data.funnelPosition}
                  tone="emerald"
                />

                <MiniStat
                  label="Total Views"
                  value={data.totalViews.toLocaleString()}
                  tone="primary"
                />

                <MiniStat
                  label="Add to Carts"
                  value={data.totalAddToCarts.toLocaleString()}
                  tone="violet"
                />

                <MiniStat
                  label="Engagement"
                  value={`${data.engagementPercentile.toFixed(1)} percentile`}
                  tone="amber"
                />
              </div>

              {/* Journey Timeline */}
              <div className="mt-6">
                <SectionTitle
                  title="Journey Timeline"
                  subtitle="RetailRocket online event history"
                />

                <div className="relative pl-6">
                  <div className="absolute left-2 top-1 bottom-1 w-px bg-white/10" />

                  {data.timeline.map((event, index) => (
                    <div
                      key={`${event.date}-${event.time}-${event.itemId}-${index}`}
                      className="relative pb-4 last:pb-0"
                    >
                      <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-[image:var(--gradient-primary)] ring-4 ring-background" />

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[13px] font-medium">
                            {event.event} · {event.itemId}
                          </div>

                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {event.channel} · {event.date}
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-muted-foreground">
                          {event.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Prediction + Radar */}
            <div className="space-y-4">
              <Gauge
                label="Buy Probability"
                value={data.buyProbability}
                color="var(--primary)"
              />

              <Gauge
                label="Engagement Percentile"
                value={data.engagementPercentile / 100}
                color="var(--emerald)"
              />

              <GlassCard className="p-6">
                <SectionTitle
                  title="Behavior Radar"
                  subtitle="6-axis persona projection"
                />

                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data.radar}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />

                      <PolarAngleAxis
                        dataKey="trait"
                        tick={{
                          fill: "rgba(255,255,255,0.6)",
                          fontSize: 10,
                        }}
                      />

                      <PolarRadiusAxis
                        stroke="transparent"
                        tick={false}
                      />

                      <Radar
                        dataKey="value"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* ============================================================
              RECOMMENDATIONS + EXPLAINABLE AI
              ============================================================ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
            {/* Recommendations */}
            <GlassCard className="p-6 xl:col-span-2">
              <SectionTitle
                title="Personalized Recommendations"
                subtitle="Ranked hybrid: collaborative × segment × popularity"
                right={
                  <Chip tone="primary">
                    <Sparkles className="w-3 h-3" />
                    AI ranked
                  </Chip>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.recommendations.map((recommendation) => (
                  <div
                    key={recommendation.itemId}
                    className="p-4 rounded-xl glass hover:border-white/15 transition group"
                  >
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/20 via-violet/15 to-transparent grid place-items-center mb-3">
                      <Package className="w-8 h-8 text-white/70" />
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <Chip tone="violet">
                        {recommendation.tag}
                      </Chip>

                      <span className="text-[11px] font-mono text-emerald">
                        Rank #{recommendation.rank}
                      </span>
                    </div>

                    <div className="text-[13px] font-medium">
                      {recommendation.itemId}
                    </div>

                    <div className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                      {recommendation.reason}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Explainable AI */}
            <GlassCard className="p-6">
              <SectionTitle
                title="Explainable AI"
                subtitle="Feature contributions to prediction"
                right={
                  <Info className="w-4 h-4 text-muted-foreground" />
                }
              />

              <div className="space-y-3">
                {data.featureImportance.map((feature) => (
                  <div key={feature.feature}>
                    <div className="flex items-center justify-between text-[12px] mb-1">
                      <span className="text-foreground/80">
                        {feature.feature}
                      </span>

                      <span className="font-mono text-muted-foreground">
                        {(feature.weight * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                        style={{
                          width: `${Math.min(
                            feature.weight * 100 * 2.5,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3 rounded-lg glass text-[12px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">
                  Model context.
                </span>{" "}
                {data.narrative}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================
   QUICK CUSTOMER BUTTON
   ================================================================ */

function QuickCustomerButton({
  icon,
  label,
  visitorId,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  visitorId: number;
  description: string;
  active: boolean;
  onClick: (visitorId: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(visitorId)}
      className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
        active
          ? "border-primary/40 bg-primary/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-lg grid place-items-center ${
          active
            ? "bg-primary/20 text-primary"
            : "bg-white/5 text-muted-foreground group-hover:text-foreground"
        }`}
      >
        {icon}
      </div>

      <div>
        <div className="text-[12px] font-medium">
          {label}
        </div>

        <div className="text-[10px] text-muted-foreground">
          {description} · C-{visitorId}
        </div>
      </div>
    </button>
  );
}

/* ================================================================
   MINI STAT
   ================================================================ */

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "emerald" | "violet" | "amber";
}) {
  const map: Record<string, string> = {
    primary: "border-primary/20 bg-primary/5",
    emerald: "border-emerald/20 bg-emerald/5",
    violet: "border-violet/20 bg-violet/5",
    amber: "border-amber/20 bg-amber/5",
  };

  return (
    <div className={`rounded-xl border p-3 ${map[tone]}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 text-lg font-semibold font-display">
        {value}
      </div>
    </div>
  );
}

/* ================================================================
   GAUGE
   ================================================================ */

function Gauge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const chartData = [
    {
      name: label,
      value: value * 100,
      fill: color,
    },
  ];

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 100%, ${color}, transparent 60%)`,
        }}
      />

      <div className="relative">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>

        <div className="h-[140px] -my-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={chartData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={20}
                background={{
                  fill: "rgba(255,255,255,0.05)",
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center -mt-8">
          <div className="text-3xl font-semibold font-display">
            {(value * 100).toFixed(2)}%
          </div>

          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Model output
          </div>
        </div>
      </div>
    </GlassCard>
  );
}