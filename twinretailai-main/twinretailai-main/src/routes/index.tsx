import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserCheck,
  Crown,
  ShoppingBag,
  Sparkles,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle,
  Flame,
  CircleDot,
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

export const Route = createFileRoute("/")({
  component: ExecutiveCommandCenter,
});

const seeded = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};
const activity = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  views: 4000 + Math.round(Math.sin(i / 3) * 1500 + seeded(i) * 800 + i * 90),
  carts: 900 + Math.round(Math.sin(i / 4) * 400 + seeded(i + 7) * 200 + i * 20),
  purchases: 220 + Math.round(Math.sin(i / 5) * 120 + seeded(i + 13) * 60 + i * 6),
}));

const funnelData = [
  { name: "Impressions", value: 1_240_000, fill: "var(--cyan)" },
  { name: "Views", value: 682_400, fill: "var(--primary)" },
  { name: "Add to Cart", value: 184_320, fill: "var(--violet)" },
  { name: "Checkout", value: 74_890, fill: "var(--accent)" },
  { name: "Purchase", value: 41_270, fill: "var(--emerald)" },
];

const segments = [
  { name: "Power Buyers", value: 18, color: "var(--emerald)" },
  { name: "Loyalists", value: 24, color: "var(--primary)" },
  { name: "Explorers", value: 21, color: "var(--violet)" },
  { name: "Window Shoppers", value: 22, color: "var(--amber)" },
  { name: "At Risk", value: 15, color: "var(--rose)" },
];

const buyProb = Array.from({ length: 20 }, (_, i) => ({
  bin: `${(i * 5).toString().padStart(2, "0")}`,
  count: Math.round(
    2000 * Math.exp(-((i - 12) ** 2) / 30) + 400 * Math.exp(-((i - 4) ** 2) / 20),
  ),
}));

const insights = [
  { tone: "emerald", label: "Power Buyers", text: "Power Buyers cohort grew by 14.2% WoW driven by loyalty push", pct: "+14.2%" },
  { tone: "amber", label: "Window Shoppers", text: "Window Shoppers dropped 6.1% — retargeting audience shrinking", pct: "-6.1%" },
  { tone: "primary", label: "Recommender", text: "Hybrid recommender CTR improved to 8.9% (Δ +1.4pp)", pct: "+1.4pp" },
  { tone: "violet", label: "Model Health", text: "Prediction confidence at 94.1% across 12M daily inferences", pct: "94.1%" },
] as const;

const alerts = [
  { name: "C-8811283", segment: "Power Buyer", risk: 0.82 },
  { name: "C-2049112", segment: "Loyalist", risk: 0.78 },
  { name: "C-5501842", segment: "Explorer", risk: 0.71 },
  { name: "C-6698301", segment: "Loyalist", risk: 0.68 },
];

const trending = [
  { sku: "SNK-AIR-2049", name: "AeroKnit Runner", cat: "Footwear", uplift: "+38%" },
  { sku: "APL-ULT-M14", name: "Aurora Smartwatch", cat: "Wearables", uplift: "+31%" },
  { sku: "HGD-NC-88", name: "Noise-Cancel Pods", cat: "Audio", uplift: "+27%" },
  { sku: "KTC-STL-12", name: "Titanium Cookware", cat: "Home", uplift: "+19%" },
];

function ExecutiveCommandCenter() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Executive Command Center"
        title="Global Retail Intelligence, live."
        description="Unified telemetry across 42M customer twins, 8 channels, and 1.2B daily events — synthesized into decisions in under 40 ms."
        actions={
          <>
            <Chip tone="emerald"><CircleDot className="w-3 h-3" /> Live</Chip>
            <Chip tone="primary">Last sync 3s ago</Chip>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <StatCard label="Total Customers" value="42.1M" delta={2.4} hint="Digital twins provisioned" icon={Users} />
        <StatCard label="Active (30d)" value="18.7M" delta={5.1} hint="Engaged in rolling window" icon={Activity} accent="violet" />
        <StatCard label="High Value" value="1.28M" delta={9.6} hint="CLV tier ≥ Platinum" icon={Crown} accent="amber" />
        <StatCard label="Buyers (24h)" value="284K" delta={3.8} hint="Realtime purchase events" icon={ShoppingBag} accent="emerald" />
        <StatCard label="Predicted Buyers (7d)" value="2.94M" delta={12.1} hint="Model confidence 94.1%" icon={Sparkles} accent="primary" />
        <StatCard label="Revenue Opportunity" value="$184.6M" delta={7.3} hint="Uncaptured pipeline this week" icon={DollarSign} accent="emerald" />
        <StatCard label="Conversion Rate" value="6.71%" delta={0.9} hint="Site + app + store, blended" icon={TrendingUp} accent="violet" />
        <StatCard label="Avg Engagement" value="72.4" delta={-1.2} hint="Composite behavior score" icon={Flame} accent="amber" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        <GlassCard className="p-6 xl:col-span-2">
          <SectionTitle
            title="Customer Activity — Last 24h"
            subtitle="Views, cart additions and purchases, streaming"
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
              <AreaChart data={activity} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
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
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={2} fill="url(#gv)" />
                <Area type="monotone" dataKey="carts" stroke="var(--violet)" strokeWidth={2} fill="url(#gc)" />
                <Area type="monotone" dataKey="purchases" stroke="var(--emerald)" strokeWidth={2} fill="url(#gp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Insights */}
        <GlassCard className="p-6" glow>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center">
              <Sparkles className="w-3.5 h-3.5 text-background" />
            </div>
            <div>
              <div className="text-sm font-semibold">AI Insights</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Auto-generated · 4m ago</div>
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
          <SectionTitle title="Customer Funnel" subtitle="View → Cart → Purchase" />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <FunnelChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList dataKey="name" position="right" fill="rgba(255,255,255,0.85)" fontSize={11} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle title="Segment Distribution" subtitle="Behavioral cohorts" />
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
                <span className="ml-auto font-mono">{s.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle title="Buy Probability Distribution" subtitle="Population density by score" />
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={buyProb} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gbar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--violet)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="bin" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="url(#gbar)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Row 3: heatmap + alerts + trending */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="p-6 xl:col-span-2">
          <SectionTitle
            title="Revenue Opportunity Map"
            subtitle="Global regions weighted by uncaptured value"
            right={<Chip tone="primary">$184.6M unlocked</Chip>}
          />
          <div className="grid grid-cols-16 gap-1 mt-2" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
            {Array.from({ length: 24 * 8 }).map((_, i) => {
              const raw = Math.sin(i * 12.9898) * 43758.5453;
              const v = Math.round((raw - Math.floor(raw)) * 1000) / 1000;
              const c = v > 0.9 ? "var(--rose)" : v > 0.75 ? "var(--amber)" : v > 0.5 ? "var(--primary)" : v > 0.3 ? "var(--violet)" : "rgba(255,255,255,0.04)";
              const op = Math.round((0.35 + v * 0.6) * 1000) / 1000;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm transition-transform hover:scale-125"
                  style={{ background: c, opacity: op }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-[11px] text-muted-foreground">
            <span>Low opportunity</span>
            <div className="flex-1 mx-4 h-1.5 rounded-full bg-gradient-to-r from-white/10 via-primary to-rose" />
            <span>High opportunity</span>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-6">
            <SectionTitle title="High-Risk Customers" subtitle="Churn probability > 0.65" right={<AlertTriangle className="w-4 h-4 text-rose" />} />
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition">
                  <div className="w-8 h-8 rounded-lg bg-rose/10 border border-rose/20 grid place-items-center text-[10px] font-mono text-rose">
                    {a.name.slice(-2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate font-mono">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">{a.segment}</div>
                  </div>
                  <div className="text-[11px] font-mono text-rose">{(a.risk * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle title="Trending Products" subtitle="24h velocity" />
            <div className="space-y-2">
              {trending.map((t) => (
                <div key={t.sku} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 grid place-items-center">
                    <Flame className="w-4 h-4 text-emerald" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{t.sku} · {t.cat}</div>
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
