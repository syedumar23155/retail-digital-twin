import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GlassCard, PageHeader, SectionTitle, Chip } from "@/components/premium";
import { Brain, Zap, Trophy, GitCompare, Timer } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from "recharts";
import { tooltipStyle } from "./index";

export const Route = createFileRoute("/prediction")({
  component: PredictionLab,
});

const rocCurve = Array.from({ length: 50 }, (_, i) => {
  const x = i / 49;
  return { fpr: x, tpr: Math.min(1, Math.pow(x, 0.32) + 0.02) };
});

const prCurve = Array.from({ length: 50 }, (_, i) => {
  const x = i / 49;
  return { recall: x, precision: Math.max(0.4, 1 - Math.pow(x, 1.6) * 0.55) };
});

const models = [
  { name: "XGBoost v4", acc: 0.941, auc: 0.976, lat: 8.2, best: true },
  { name: "Gradient Boosting", acc: 0.926, auc: 0.968, lat: 14.7 },
  { name: "Random Forest", acc: 0.902, auc: 0.951, lat: 22.1 },
  { name: "Logistic Reg.", acc: 0.851, auc: 0.906, lat: 3.1 },
];

const confusion = [
  { label: "True Buy", value: 8420, tone: "emerald" },
  { label: "False Buy", value: 340, tone: "amber" },
  { label: "False No-Buy", value: 512, tone: "rose" },
  { label: "True No-Buy", value: 14728, tone: "primary" },
];

function PredictionLab() {
  const [views, setViews] = useState(42);
  const [carts, setCarts] = useState(6);
  const [purchases, setPurchases] = useState(2);
  const [engagement, setEngagement] = useState(72);
  const [activity, setActivity] = useState(58);
  const [time, setTime] = useState(340);

  const prob = useMemo(() => {
    const raw =
      (views * 0.6 + carts * 4 + purchases * 8 + engagement * 0.9 + activity * 0.7 + time * 0.05) /
      180;
    return Math.max(0.02, Math.min(0.98, raw));
  }, [views, carts, purchases, engagement, activity, time]);

  const segment = prob > 0.75 ? "Power Buyer" : prob > 0.5 ? "Loyalist" : prob > 0.25 ? "Explorer" : "Window Shopper";
  const clv = Math.round(prob * 18000 + 1400);
  const roi = (prob * 4.5 + 0.6).toFixed(2);

  const shap = [
    { f: "Cart Adds (7d)", w: carts * 0.048 },
    { f: "Engagement Score", w: engagement * 0.0035 },
    { f: "Session Time", w: time * 0.00085 },
    { f: "Recent Views", w: views * 0.0028 },
    { f: "Activity Freq.", w: activity * 0.0026 },
    { f: "Prior Purchases", w: purchases * 0.02 },
  ].sort((a, b) => b.w - a.w);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Engagement Prediction Lab"
        title="Interactive ML laboratory."
        description="Move any signal — watch prediction, segment, CLV and ROI update in real time. Every inference explained."
        actions={<Chip tone="primary"><Brain className="w-3 h-3" /> XGBoost v4 · 12M inferences/day</Chip>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-8">
        {/* Sliders */}
        <GlassCard className="p-6 xl:col-span-1">
          <SectionTitle title="Live Simulation" subtitle="Adjust customer signals" right={<Zap className="w-4 h-4 text-primary" />} />
          <div className="space-y-5">
            <SliderRow label="Views (7d)" value={views} setValue={setViews} min={0} max={200} />
            <SliderRow label="Cart Adds" value={carts} setValue={setCarts} min={0} max={30} />
            <SliderRow label="Purchases" value={purchases} setValue={setPurchases} min={0} max={20} />
            <SliderRow label="Engagement Score" value={engagement} setValue={setEngagement} min={0} max={100} />
            <SliderRow label="Activity Frequency" value={activity} setValue={setActivity} min={0} max={100} />
            <SliderRow label="Time Spent (min)" value={time} setValue={setTime} min={0} max={1000} />
          </div>
        </GlassCard>

        {/* Prediction */}
        <GlassCard className="p-6 xl:col-span-2" glow>
          <SectionTitle title="Instant Prediction" subtitle="Inference in 8.2 ms" right={<Chip tone="emerald"><Timer className="w-3 h-3" /> Realtime</Chip>} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BigStat label="Buy Probability" value={`${(prob * 100).toFixed(1)}%`} accent="primary" />
            <BigStat label="Confidence" value="95.2%" accent="emerald" />
            <BigStat label="Segment" value={segment} accent="violet" mono={false} />
            <BigStat label="Expected CLV" value={`$${clv.toLocaleString()}`} accent="amber" />
          </div>
          <div className="mt-4 p-4 rounded-xl glass">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              <span>Probability curve</span>
              <span>Threshold 0.5</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-500"
                style={{ width: `${prob * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-5">
            <SectionTitle title="SHAP Feature Importance" subtitle="Live contribution to this prediction" />
            <div className="space-y-2">
              {shap.map((s) => (
                <div key={s.f} className="flex items-center gap-3">
                  <div className="w-36 text-[12px] text-muted-foreground truncate">{s.f}</div>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-[image:var(--gradient-primary)]" style={{ width: `${Math.min(100, s.w * 200)}%` }} />
                  </div>
                  <div className="w-14 text-right text-[11px] font-mono">{(s.w * 100).toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <MiniPill label="ROI" value={`${roi}x`} />
            <MiniPill label="Latency" value="8.2 ms" />
            <MiniPill label="Recommendations" value="12 ready" />
          </div>
        </GlassCard>
      </div>

      {/* Curves + Confusion */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        <GlassCard className="p-6">
          <SectionTitle title="ROC Curve" subtitle="AUC 0.976" />
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={rocCurve} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="number" domain={[0, 1]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="tpr" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle title="Precision–Recall" subtitle="AP 0.941" />
          <div className="h-[240px]">
            <ResponsiveContainer>
              <LineChart data={prCurve} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="recall" type="number" domain={[0, 1]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="number" domain={[0, 1]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="precision" stroke="var(--violet)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle title="Confusion Matrix" subtitle="Holdout set" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {confusion.map((c) => {
              const tones: Record<string, string> = {
                emerald: "from-emerald/30 to-emerald/5 text-emerald border-emerald/20",
                amber: "from-amber/30 to-amber/5 text-amber border-amber/20",
                rose: "from-rose/30 to-rose/5 text-rose border-rose/20",
                primary: "from-primary/30 to-primary/5 text-primary border-primary/20",
              };
              return (
                <div key={c.label} className={`rounded-xl border bg-gradient-to-br p-4 ${tones[c.tone]}`}>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  <div className="mt-1 text-2xl font-semibold font-display">{c.value.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Model comparison */}
      <GlassCard className="p-6 mt-4">
        <SectionTitle
          title="Model Comparison"
          subtitle="Accuracy vs latency vs AUC"
          right={<Chip tone="emerald"><Trophy className="w-3 h-3" /> Champion: XGBoost v4</Chip>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-white/5">
                <th className="text-left font-medium py-3 px-2">Model</th>
                <th className="text-left font-medium py-3 px-2">Accuracy</th>
                <th className="text-left font-medium py-3 px-2">ROC-AUC</th>
                <th className="text-left font-medium py-3 px-2">Latency (ms)</th>
                <th className="text-left font-medium py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name} className="border-b border-white/5 hover:bg-white/[0.03] transition">
                  <td className="py-3 px-2 font-medium">{m.name}</td>
                  <td className="py-3 px-2 font-mono">{(m.acc * 100).toFixed(1)}%</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-[image:var(--gradient-primary)]" style={{ width: `${m.auc * 100}%` }} />
                      </div>
                      <span className="font-mono text-xs">{m.auc.toFixed(3)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 font-mono">{m.lat}</td>
                  <td className="py-3 px-2">{m.best ? <Chip tone="emerald">Champion</Chip> : <Chip>Candidate</Chip>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function SliderRow({ label, value, setValue, min, max }: { label: string; value: number; setValue: (v: number) => void; min: number; max: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="text-[12px] font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-[color:var(--primary)] h-1"
      />
    </div>
  );
}

function BigStat({ label, value, accent, mono = true }: { label: string; value: string; accent: "primary" | "emerald" | "violet" | "amber"; mono?: boolean }) {
  const map: Record<string, string> = {
    primary: "from-primary/25", emerald: "from-emerald/25", violet: "from-violet/25", amber: "from-amber/25",
  };
  return (
    <div className={`relative rounded-xl overflow-hidden p-4 border border-white/5 bg-gradient-to-br to-transparent ${map[accent]}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${mono ? "font-display" : ""}`}>{value}</div>
    </div>
  );
}

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg glass p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-mono">{value}</div>
    </div>
  );
}