import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, SectionTitle, Chip } from "@/components/premium";
import { Target, TrendingUp, Package, Users, Layers, Sparkles, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { tooltipStyle } from "./index";

export const Route = createFileRoute("/recommendations")({
  component: RecommendationIntelligence,
});

const pipeline = [
  { name: "Popularity", icon: TrendingUp, desc: "Global winners baseline" },
  { name: "Collaborative", icon: Users, desc: "User × item matrix factorization" },
  { name: "Segment-Aware", icon: Layers, desc: "Cohort-conditioned ranking" },
  { name: "Hybrid Ranker", icon: Sparkles, desc: "Learned meta-ranker with context" },
];

const recs = [
  { name: "AeroKnit Runner", price: "$189", conf: 0.94, source: "Hybrid", reason: "Strong signal from Power Buyer cohort + repeat-category affinity" },
  { name: "Aurora Smartwatch", price: "$349", conf: 0.91, source: "Collaborative", reason: "Neighbors with 0.88 similarity converted at 32%" },
  { name: "Titanium Cookware", price: "$429", conf: 0.87, source: "Segment", reason: "Loyalist cohort momentum +19% this week" },
  { name: "Noise-Cancel Pods", price: "$249", conf: 0.83, source: "Hybrid", reason: "Bundle affinity with recent audio browsing" },
  { name: "TrailFlex Socks", price: "$29", conf: 0.79, source: "Collaborative", reason: "Complementary attach for Runner buyers" },
  { name: "Merino Base Layer", price: "$99", conf: 0.74, source: "Popularity", reason: "Trending in region, high catalog velocity" },
];

const analytics = [
  { m: "Precision@10", v: 0.412 },
  { m: "Recall@10", v: 0.318 },
  { m: "HitRate@10", v: 0.687 },
  { m: "NDCG@10", v: 0.542 },
  { m: "Coverage", v: 0.786 },
];

const dist = [
  { s: "Popularity", v: 12 },
  { s: "Collaborative", v: 28 },
  { s: "Segment", v: 24 },
  { s: "Content", v: 15 },
  { s: "Hybrid", v: 21 },
];

function RecommendationIntelligence() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Recommendation Intelligence"
        title="Hybrid ranker, in production."
        description="Popularity, collaborative, segment-aware and content signals fused by a learned meta-ranker."
        actions={<Chip tone="primary"><Target className="w-3 h-3" /> Serving 42M twins</Chip>}
      />

      {/* Pipeline */}
      <GlassCard className="p-6 mt-8">
        <SectionTitle title="Recommendation Pipeline" subtitle="From raw signals to ranked slate" />
        <div className="flex flex-wrap items-stretch gap-3">
          {pipeline.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 flex-1 min-w-[200px]">
              <div className="flex-1 p-4 rounded-xl glass hover:border-white/15 transition group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center">
                    <p.icon className="w-4 h-4 text-background" />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Stage {i + 1}</div>
                </div>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{p.desc}</div>
              </div>
              {i < pipeline.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="xl:col-span-2">
          <GlassCard className="p-6">
            <SectionTitle title="Top Recommendations" subtitle="Ranked slate for the active audience" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recs.map((r) => (
                <div key={r.name} className="p-4 rounded-xl glass hover:border-white/15 group transition">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/25 via-violet/20 to-transparent grid place-items-center shrink-0">
                      <Package className="w-6 h-6 text-white/80" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[13px] font-semibold truncate">{r.name}</div>
                        <div className="text-[12px] font-mono text-muted-foreground">{r.price}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip tone="violet">{r.source}</Chip>
                        <span className="text-[11px] font-mono text-emerald">{(r.conf * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{r.reason}</div>
                      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-[image:var(--gradient-primary)]" style={{ width: `${r.conf * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-6" glow>
            <SectionTitle title="Recommendation Analytics" subtitle="Offline evaluation" />
            <div className="space-y-3">
              {analytics.map((a) => (
                <div key={a.m}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-foreground/80">{a.m}</span>
                    <span className="font-mono">{a.v.toFixed(3)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-[image:var(--gradient-primary)]" style={{ width: `${a.v * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle title="Source Distribution" subtitle="Share of served items" />
            <div className="h-[220px]">
              <ResponsiveContainer>
                <BarChart data={dist} margin={{ top: 10, right: 8, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="s" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="v" fill="var(--violet)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Network */}
      <GlassCard className="p-6 mt-4">
        <SectionTitle title="User × Item Network" subtitle="Bipartite graph of top recommendations" right={<Chip tone="primary">Live edges 8,412</Chip>} />
        <RecommendationGraph />
      </GlassCard>
    </div>
  );
}

function RecommendationGraph() {
  const users = Array.from({ length: 7 }, (_, i) => i);
  const items = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className="relative h-[320px] rounded-xl overflow-hidden bg-grid">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {users.map((u) =>
          items.map((it) => {
            const s = Math.sin(u * 12.9898 + it * 78.233) * 43758.5453;
            const r = s - Math.floor(s);
            if (r > 0.45) return null;
            const y1 = 30 + (u * 260) / (users.length - 1);
            const y2 = 30 + (it * 260) / (items.length - 1);
            return (
              <line
                key={`${u}-${it}`}
                x1="15%"
                y1={y1}
                x2="85%"
                y2={y2}
                stroke="url(#edge)"
                strokeWidth="1"
                opacity="0.7"
              />
            );
          }),
        )}
      </svg>
      <div className="absolute inset-0 flex justify-between items-center px-6">
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u} className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 grid place-items-center backdrop-blur-sm">
              <Users className="w-4 h-4 text-primary" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            <div key={it} className="w-10 h-10 rounded-lg bg-violet/20 border border-violet/40 grid place-items-center backdrop-blur-sm">
              <Package className="w-4 h-4 text-violet" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-muted-foreground">Customers</div>
      <div className="absolute bottom-2 right-3 text-[10px] uppercase tracking-widest text-muted-foreground">Products</div>
    </div>
  );
}