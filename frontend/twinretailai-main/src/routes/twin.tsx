import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  User,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ShoppingBag,
  Clock,
  Zap,
  Package,
  MapPin,
  Mail,
  Info,
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
  PolarAngleAxis as PA,
} from "recharts";
import { GlassCard, PageHeader, SectionTitle, Chip } from "@/components/premium";
import { useTwin } from "@/hooks/use-twin";

export const Route = createFileRoute("/twin")({
  component: TwinExplorer,
});

const radar = [
  { trait: "Engagement", A: 88 },
  { trait: "Recency", A: 74 },
  { trait: "Frequency", A: 92 },
  { trait: "Monetary", A: 81 },
  { trait: "Loyalty", A: 66 },
  { trait: "Discovery", A: 58 },
];

const timeline = [
  { t: "09:12", event: "Viewed AeroKnit Runner", ch: "Mobile App", tone: "primary" },
  { t: "09:14", event: "Added to Cart · Size 10", ch: "Mobile App", tone: "violet" },
  { t: "09:41", event: "Opened re-engagement email", ch: "Email", tone: "amber" },
  { t: "10:03", event: "Visited flagship store", ch: "Offline · POS", tone: "emerald" },
  { t: "10:22", event: "Purchased AeroKnit Runner", ch: "Offline · POS", tone: "emerald" },
  { t: "10:24", event: "Loyalty +240 points", ch: "Loyalty", tone: "primary" },
];

const recs = [
  { name: "Aurora Smartwatch S2", conf: 0.94, reason: "Similar Power Buyers bought this within 14 days of Runner purchase.", tag: "Cross-sell" },
  { name: "TrailFlex Merino Socks", conf: 0.88, reason: "Frequently paired · complements footwear category affinity.", tag: "Complementary" },
  { name: "Titanium Water Bottle", conf: 0.72, reason: "High CLV cluster shows +32% attach on active-lifestyle bundles.", tag: "Bundle" },
];

const shap = [
  { f: "Recent Cart Adds (7d)", w: 0.31 },
  { f: "Purchase Frequency", w: 0.24 },
  { f: "Loyalty Tier", w: 0.19 },
  { f: "Session Duration", w: 0.13 },
  { f: "Category Diversity", w: 0.08 },
  { f: "Email Open Rate", w: 0.05 },
];

function TwinExplorer() {
  const [q, setQ] = useState("C-8811283");
  const buy = 0.78;
  const engage = 0.86;

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Customer Digital Twin Explorer"
        title="Every customer, modeled as a living twin."
        description="Behavioral, transactional and contextual signals unified into a single explainable representation."
      />

      {/* Search */}
      <GlassCard className="mt-6 p-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground ml-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Enter customer ID or email…"
          className="flex-1 bg-transparent px-1 py-2.5 text-sm focus:outline-none placeholder:text-muted-foreground/60"
        />
        <button className="px-4 py-2 rounded-lg bg-[image:var(--gradient-primary)] text-background text-sm font-medium">
          Resolve Twin
        </button>
      </GlassCard>

      {/* Profile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
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
                <div className="font-mono text-lg font-semibold">{q}</div>
                <Chip tone="primary">Power Buyer</Chip>
                <Chip tone="emerald">CLV · Platinum</Chip>
                <Chip tone="violet">Explorer Behavior</Chip>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> Austin, TX</span>
                <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> j.marlowe@…</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Twin active 3.4y</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <MiniStat label="Funnel Position" value="Checkout" tone="emerald" />
            <MiniStat label="Lifetime Value" value="$14,820" tone="primary" />
            <MiniStat label="ROI Contribution" value="4.2x" tone="violet" />
            <MiniStat label="Risk Score" value="0.22" tone="amber" />
          </div>

          {/* Journey */}
          <div className="mt-6">
            <SectionTitle title="Journey Timeline" subtitle="Cross-channel event stream" />
            <div className="relative pl-6">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-white/10" />
              {timeline.map((e, i) => (
                <div key={i} className="relative pb-4 last:pb-0">
                  <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-[image:var(--gradient-primary)] ring-4 ring-background" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-medium">{e.event}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{e.ch}</div>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">{e.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Gauges */}
        <div className="space-y-4">
          <Gauge label="Buy Probability" value={buy} color="var(--primary)" />
          <Gauge label="Engagement" value={engage} color="var(--emerald)" />

          <GlassCard className="p-6">
            <SectionTitle title="Behavior Radar" subtitle="6-axis persona projection" />
            <div className="h-[240px]">
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="trait" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
                  <PolarRadiusAxis stroke="transparent" tick={false} />
                  <Radar dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recommendations + XAI */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="p-6 xl:col-span-2">
          <SectionTitle
            title="Personalized Recommendations"
            subtitle="Ranked hybrid: collaborative × segment × content"
            right={<Chip tone="primary"><Sparkles className="w-3 h-3" /> AI ranked</Chip>}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recs.map((r) => (
              <div key={r.name} className="p-4 rounded-xl glass hover:border-white/15 transition group">
                <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/20 via-violet/15 to-transparent grid place-items-center mb-3">
                  <Package className="w-8 h-8 text-white/70" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <Chip tone="violet">{r.tag}</Chip>
                  <span className="text-[11px] font-mono text-emerald">{(r.conf * 100).toFixed(0)}%</span>
                </div>
                <div className="text-[13px] font-medium">{r.name}</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{r.reason}</div>
                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[image:var(--gradient-primary)]" style={{ width: `${r.conf * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle
            title="Explainable AI"
            subtitle="Feature contributions to prediction"
            right={<Info className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="space-y-3">
            {shap.map((s) => (
              <div key={s.f}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="text-foreground/80">{s.f}</span>
                  <span className="font-mono text-muted-foreground">{(s.w * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                    style={{ width: `${s.w * 100 * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-lg glass text-[12px] text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Why buy?</span> Recent cart velocity, loyalty tier and repeat category behavior jointly push the estimate above the 0.75 decision threshold with 94% confidence.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "primary" | "emerald" | "violet" | "amber" }) {
  const map: Record<string, string> = {
    primary: "border-primary/20 bg-primary/5",
    emerald: "border-emerald/20 bg-emerald/5",
    violet: "border-violet/20 bg-violet/5",
    amber: "border-amber/20 bg-amber/5",
  };
  return (
    <div className={`rounded-xl border p-3 ${map[tone]}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold font-display">{value}</div>
    </div>
  );
}

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  const data = [{ name: label, v: value * 100, fill: color }];
  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 100%, ${color}, transparent 60%)` }} />
      <div className="relative">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="h-[140px] -my-2">
          <ResponsiveContainer>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={0}>
              <PA type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="v" cornerRadius={20} background={{ fill: "rgba(255,255,255,0.05)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center -mt-8">
          <div className="text-3xl font-semibold font-display">{(value * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Confidence 94%</div>
        </div>
      </div>
    </GlassCard>
  );
}