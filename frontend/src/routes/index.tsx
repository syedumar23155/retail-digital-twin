import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Crown,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Activity,
  AlertTriangle,
  Flame,
  CircleDot,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { GlassCard, PageHeader, StatCard, SectionTitle, Chip } from "@/components/premium";
import { useOverview } from "@/hooks/use-overview";

export const Route = createFileRoute("/")({
  component: ExecutiveCommandCenter,
});

export const tooltipStyle = {
  background: "oklch(0.19 0.025 265 / 0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  fontSize: 11,
  color: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
};

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function ExecutiveCommandCenter() {
  const { data, isLoading, isError, error } = useOverview();

  if (isLoading) {
    return (
      <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto flex items-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading real Digital Twin intelligence…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
        <GlassCard className="p-6">
          <div className="text-rose font-medium">Could not reach the backend API.</div>
          <div className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Unknown error"} — confirm
            <code className="mx-1 px-1.5 py-0.5 rounded bg-white/5">python -m backend.app</code>
            is running on port 5000.
          </div>
        </GlassCard>
      </div>
    );
  }

  const { kpis, dailyActivity, funnel, segments, buyProbabilityHistogram,
          insights, abandonedHighIntent, trendingItems, segmentClvMatrix } = data;

  const maxMatrixValue = Math.max(...segmentClvMatrix.values.flat(), 1);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Executive Command Center"
        title="Retail Digital Twin intelligence, live from RetailRocket."
        description={`${kpis.totalCustomers.toLocaleString()} customer Digital Twins, generated from 2.75M real e-commerce events (May\u2013Sep 2015) and scored by our XGBoost engagement model.`}
        actions={
          <>
            <Chip tone="emerald"><CircleDot className="w-3 h-3" /> Live</Chip>
            <Chip tone="primary">RetailRocket dataset</Chip>
          </>
        }
      />

      {/* KPI Grid — all real, no deltas invented */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <StatCard label="Total Customers" value={kpis.totalCustomers.toLocaleString()} hint="Digital twins generated" icon={Users} />
        <StatCard label="Buyers" value={kpis.buyers.toLocaleString()} hint={`${kpis.buyerPct}% of all customers`} icon={ShoppingBag} accent="emerald" />
        <StatCard label="High Value (CLV)" value={kpis.highValueCount.toLocaleString()} hint="HIGH + PREMIUM tier" icon={Crown} accent="amber" />
        <StatCard label="Predicted Buyers" value={kpis.predictedBuyers.toLocaleString()} hint="XGBoost model output" icon={Sparkles} accent="primary" />
        <StatCard label="Avg Buy Probability" value={`${kpis.avgBuyProbability}%`} hint="Mean across all customers" icon={TrendingUp} accent="violet" />
        <StatCard label="Conversion Rate" value={`${kpis.conversionRate}%`} hint="Views \u2192 purchases" icon={Activity} accent="violet" />
        <StatCard label="Avg Engagement Score" value={kpis.avgEngagementScore.toLocaleString()} hint="Weighted behavior score" icon={Flame} accent="amber" />
        <StatCard label="Model AUC" value="0.974" hint="XGBoost, held-out test set" icon={Sparkles} accent="emerald" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        <GlassCard className="p-6 xl:col-span-2">
          <SectionTitle
            title="Daily Activity — May to September 2015"
            subtitle="Views, cart additions and purchases across the full RetailRocket window"
            right={
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <Legend color="var(--primary)" label="Views" />
                <Legend color="var(--violet)" label="Carts" />
                <Legend color="var(--emerald)" label="Purchases" />
              </div>
            }
          />
          <div className="h-[300px]">
            <ResponsiveContainer>
              <AreaChart data={dailyActivity} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--violet)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--emerald)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={2} fill="url(#gv)" />
                <Area type="monotone" dataKey="carts" stroke="var(--violet)" strokeWidth={2} fill="url(#gc)" />
                <Area type="monotone" dataKey="purchases" stroke="var(--emerald)" strokeWidth={2} fill="url(#gp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6" glow>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center">
              <Sparkles className="w-3.5 h-3.5 text-background" />
            </div>
            <div>
              <div className="text-sm font-semibold">AI Insights</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Generated from live pipeline output
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {insights.map((i, idx) => (
              <div key={idx} className="p-3 rounded-xl glass hover:bg-white/[0.05] transition group">
                <div className="flex items-center justify-between mb-1.5">
                  <Chip tone={i.tone as never}>{i.label}</Chip>
                  <span className="text-[11px] font-mono text-foreground/80">{i.pct}</span>
                </div>
                <div className="text-[13px] leading-relaxed text-foreground/90">{i.text}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="p-6">
          <SectionTitle title="Customer Funnel" subtitle="View \u2192 Cart \u2192 Purchase (real RetailRocket events)" />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <FunnelChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Funnel dataKey="value" data={funnel} isAnimationActive>
                  <LabelList dataKey="name" position="right" fill="rgba(255,255,255,0.85)" fontSize={11} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle title="Segment Distribution" subtitle="Digital Twin behavioral cohorts" />
          <div className="h-[220px]">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie data={segments} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3} stroke="none">
                  {segments.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            {segments.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-mono">{s.pct}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle title="Buy Probability Distribution" subtitle="XGBoost model output, all 1.4M customers" />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={buyProbabilityHistogram} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gbar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--violet)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="bin" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="url(#gbar)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Row 3: segment x CLV matrix + abandoned carts + trending items */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="p-6 xl:col-span-2">
          <SectionTitle
            title="Segment \u00d7 CLV Matrix"
            subtitle="Customer count by behavioral segment and lifetime value tier"
          />
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground font-normal pb-2">Segment</th>
                  {segmentClvMatrix.tiers.map((tier) => (
                    <th key={tier} className="text-center text-muted-foreground font-normal pb-2 px-2">
                      {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentClvMatrix.segments.map((seg, rowIdx) => (
                  <tr key={seg}>
                    <td className="py-1 pr-3 text-foreground/90 whitespace-nowrap">{seg}</td>
                    {segmentClvMatrix.values[rowIdx].map((val, colIdx) => {
                      const intensity = val / maxMatrixValue;
                      return (
                        <td key={colIdx} className="px-2 py-1">
                          <div
                            className="rounded-md text-center py-2 font-mono transition-transform hover:scale-105"
                            style={{
                              background: `oklch(0.6 0.15 265 / ${0.08 + intensity * 0.55})`,
                            }}
                          >
                            {val.toLocaleString()}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-6">
            <SectionTitle
              title="Abandoned High-Intent Carts"
              subtitle="Added to cart, never purchased"
              right={<AlertTriangle className="w-4 h-4 text-rose" />}
            />
            <div className="space-y-2">
              {abandonedHighIntent.map((a) => (
                <div key={a.visitorId} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition">
                  <div className="w-8 h-8 rounded-lg bg-rose/10 border border-rose/20 grid place-items-center text-[10px] font-mono text-rose">
                    {a.visitorId.slice(-2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate font-mono">{a.visitorId}</div>
                    <div className="text-[10px] text-muted-foreground">{a.segment}</div>
                  </div>
                  <div className="text-[11px] font-mono text-rose">{(a.risk * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle title="Trending Items" subtitle="7-day view velocity (raw item IDs — no product metadata in dataset)" />
            <div className="space-y-2">
              {trendingItems.map((t) => (
                <div key={t.itemId} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 grid place-items-center">
                    <Flame className="w-4 h-4 text-emerald" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate font-mono">{t.itemId}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{t.viewsLast7d} views</div>
                  </div>
                  <div className="text-[11px] font-mono text-emerald">{t.uplift}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}