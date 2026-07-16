import { createFileRoute } from "@tanstack/react-router";
import { useReducer } from "react";
import { GlassCard, PageHeader, SectionTitle, Chip } from "@/components/premium";
import {
  Eye,
  ShoppingCart,
  CreditCard,
  XCircle,
  TicketPercent,
  Mail,
  Bell,
  Award,
  Store,
  ScanLine,
  PhoneCall,
  Globe,
  Smartphone,
  Megaphone,
  Sparkles,
  RotateCcw,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/simulator")({
  component: JourneySimulator,
});

type State = {
  views: number;
  carts: number;
  purchases: number;
  coupon: boolean;
  email: boolean;
  push: boolean;
  loyalty: number;
  offlineVisits: number;
  posPurchases: number;
  callCenter: number;
  webActivity: number;
  mobileActivity: number;
  social: number;
};

const initial: State = {
  views: 24, carts: 3, purchases: 1, coupon: false, email: false, push: false,
  loyalty: 240, offlineVisits: 1, posPurchases: 0, callCenter: 0,
  webActivity: 40, mobileActivity: 55, social: 12,
};

function reducer(s: State, a: Partial<State> | "reset"): State {
  if (a === "reset") return initial;
  return { ...s, ...a };
}

function computeMetrics(s: State) {
  const base =
    s.views * 0.5 + s.carts * 4 + s.purchases * 7 +
    s.webActivity * 0.4 + s.mobileActivity * 0.5 +
    s.offlineVisits * 3 + s.posPurchases * 6 +
    s.social * 0.6 + s.loyalty * 0.02 -
    s.callCenter * 1.5;
  const bonus = (s.coupon ? 22 : 0) + (s.email ? 6 : 0) + (s.push ? 4 : 0);
  const buy = Math.max(0.02, Math.min(0.98, (base + bonus) / 140));
  const eng = Math.max(0.05, Math.min(0.99, (base + bonus) / 160 + 0.2));
  const clv = Math.round(buy * 21000 + 1200);
  const roi = Number((buy * 5 + 0.7).toFixed(2));
  const seg = buy > 0.75 ? "Power Buyer" : buy > 0.55 ? "Loyalist" : buy > 0.35 ? "Explorer" : "Window Shopper";
  return { buy, eng, clv, roi, seg };
}

function JourneySimulator() {
  const [state, dispatch] = useReducer(reducer, initial);
  const before = computeMetrics(initial);
  const after = computeMetrics(state);
  const delta = (after.buy - before.buy) * 100;

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Omnichannel Journey Simulator"
        title="What-if, for every customer."
        description="Nudge any signal or action across web, mobile, store, POS, email and campaigns — see the twin re-form instantly."
        actions={
          <button onClick={() => dispatch("reset")} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs hover:bg-white/5">
            <RotateCcw className="w-3 h-3" /> Reset scenario
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mt-8">
        {/* Controls */}
        <GlassCard className="p-6 xl:col-span-2">
          <SectionTitle title="Actions" subtitle="Tap to inject signals into the twin" />

          <GroupLabel>Digital Signals</GroupLabel>
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn icon={Eye} label="+ Views" onClick={() => dispatch({ views: state.views + 5 })} v={state.views} />
            <ActionBtn icon={ShoppingCart} label="+ Cart Adds" onClick={() => dispatch({ carts: state.carts + 1 })} v={state.carts} />
            <ActionBtn icon={CreditCard} label="+ Purchase" onClick={() => dispatch({ purchases: state.purchases + 1 })} v={state.purchases} tone="emerald" />
            <ActionBtn icon={XCircle} label="Abandon Cart" onClick={() => dispatch({ carts: Math.max(0, state.carts - 1) })} v={state.carts} tone="rose" />
          </div>

          <GroupLabel>Marketing</GroupLabel>
          <div className="grid grid-cols-2 gap-2">
            <ToggleBtn icon={TicketPercent} label="10% Coupon" on={state.coupon} onClick={() => dispatch({ coupon: !state.coupon })} tone="amber" />
            <ToggleBtn icon={Mail} label="Send Email" on={state.email} onClick={() => dispatch({ email: !state.email })} />
            <ToggleBtn icon={Bell} label="Push Notification" on={state.push} onClick={() => dispatch({ push: !state.push })} />
            <ActionBtn icon={Award} label="+ Loyalty pts" onClick={() => dispatch({ loyalty: state.loyalty + 100 })} v={state.loyalty} tone="emerald" />
          </div>

          <GroupLabel>Offline</GroupLabel>
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn icon={Store} label="Store Visit" onClick={() => dispatch({ offlineVisits: state.offlineVisits + 1 })} v={state.offlineVisits} />
            <ActionBtn icon={ScanLine} label="POS Purchase" onClick={() => dispatch({ posPurchases: state.posPurchases + 1 })} v={state.posPurchases} tone="emerald" />
            <ActionBtn icon={PhoneCall} label="Call Center" onClick={() => dispatch({ callCenter: state.callCenter + 1 })} v={state.callCenter} tone="rose" />
          </div>

          <GroupLabel>Channels</GroupLabel>
          <div className="space-y-3">
            <SliderRow icon={Globe} label="Web Activity" value={state.webActivity} onChange={(v) => dispatch({ webActivity: v })} max={100} />
            <SliderRow icon={Smartphone} label="Mobile App" value={state.mobileActivity} onChange={(v) => dispatch({ mobileActivity: v })} max={100} />
            <SliderRow icon={Megaphone} label="Social Campaign" value={state.social} onChange={(v) => dispatch({ social: v })} max={100} />
          </div>
        </GlassCard>

        {/* Impact */}
        <div className="xl:col-span-3 space-y-4">
          <GlassCard className="p-6" glow>
            <SectionTitle
              title="Twin State — Before vs After"
              subtitle="Live delta from baseline scenario"
              right={<Chip tone={delta >= 0 ? "emerald" : "rose"}><Zap className="w-3 h-3" /> Δ Buy {delta >= 0 ? "+" : ""}{delta.toFixed(1)}pp</Chip>}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Compare label="Buy Probability" b={before.buy * 100} a={after.buy * 100} suffix="%" />
              <Compare label="Engagement" b={before.eng * 100} a={after.eng * 100} suffix="%" />
              <Compare label="Expected CLV" b={before.clv} a={after.clv} prefix="$" fmt />
              <Compare label="ROI" b={before.roi} a={after.roi} suffix="x" />
            </div>
            <div className="mt-4 p-3 rounded-lg glass flex items-center justify-between">
              <div className="text-[12px] text-muted-foreground">Segment</div>
              <div className="flex items-center gap-2 text-[13px]">
                <Chip>{before.seg}</Chip>
                <span className="text-muted-foreground">→</span>
                <Chip tone={after.seg === before.seg ? "primary" : "emerald"}>{after.seg}</Chip>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle title="Animated Journey" subtitle="How this twin now moves through the funnel" />
            <JourneyRibbon buy={after.buy} />
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center shrink-0">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Business Recommendation</div>
                <div className="mt-1 text-[15px] leading-relaxed">
                  {state.coupon
                    ? <>Offering a <span className="text-emerald font-semibold">10% coupon</span> lifts purchase probability from <span className="font-mono">{(before.buy * 100).toFixed(1)}%</span> to <span className="font-mono text-emerald">{(after.buy * 100).toFixed(1)}%</span>. Expected CLV rises by <span className="text-emerald font-semibold">${(after.clv - before.clv).toLocaleString()}</span>.</>
                    : <>Enable a <span className="text-primary font-semibold">targeted coupon + push</span> to convert this twin — projected uplift is <span className="text-emerald font-semibold">+18–24pp</span> in buy probability within 72h.</>}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: string }) {
  return <div className="mt-5 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{children}</div>;
}

function ActionBtn({ icon: Icon, label, onClick, v, tone = "primary" }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; v: number; tone?: "primary" | "emerald" | "rose" | "amber" }) {
  const t: Record<string, string> = {
    primary: "hover:border-primary/40 hover:bg-primary/5",
    emerald: "hover:border-emerald/40 hover:bg-emerald/5",
    rose: "hover:border-rose/40 hover:bg-rose/5",
    amber: "hover:border-amber/40 hover:bg-amber/5",
  };
  return (
    <button onClick={onClick} className={`text-left p-3 rounded-xl glass transition ${t[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-[12px] font-medium truncate">{label}</span>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground font-mono">count: {v}</div>
    </button>
  );
}

function ToggleBtn({ icon: Icon, label, on, onClick, tone = "primary" }: { icon: React.ComponentType<{ className?: string }>; label: string; on: boolean; onClick: () => void; tone?: "primary" | "amber" }) {
  return (
    <button onClick={onClick} className={`text-left p-3 rounded-xl transition border ${on ? `border-${tone}/50 bg-${tone}/10` : "border-white/10 glass hover:border-white/20"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span className="text-[12px] font-medium">{label}</span></div>
        <span className={`w-2 h-2 rounded-full ${on ? "bg-emerald" : "bg-white/20"}`} />
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{on ? "Enabled" : "Disabled"}</div>
    </button>
  );
}

function SliderRow({ icon: Icon, label, value, onChange, max }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="p-3 rounded-xl glass">
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-2 text-[12px]"><Icon className="w-3.5 h-3.5" /> {label}</span>
        <span className="text-[11px] font-mono">{value}</span>
      </div>
      <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[color:var(--primary)] h-1" />
    </div>
  );
}

function Compare({ label, b, a, prefix = "", suffix = "", fmt = false }: { label: string; b: number; a: number; prefix?: string; suffix?: string; fmt?: boolean }) {
  const format = (n: number) => (fmt ? Math.round(n).toLocaleString() : n.toFixed(1));
  return (
    <div className="rounded-xl p-3 glass">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-muted-foreground line-through text-[12px] font-mono">{prefix}{format(b)}{suffix}</span>
        <span className="text-lg font-semibold font-display">{prefix}{format(a)}{suffix}</span>
      </div>
    </div>
  );
}

function JourneyRibbon({ buy }: { buy: number }) {
  const stages = [
    { label: "View", pct: 100 },
    { label: "Consider", pct: Math.min(100, buy * 100 + 25) },
    { label: "Cart", pct: Math.min(100, buy * 100 + 12) },
    { label: "Checkout", pct: Math.min(100, buy * 100 + 6) },
    { label: "Purchase", pct: buy * 100 },
    { label: "Loyalty", pct: Math.max(4, buy * 100 - 12) },
  ];
  return (
    <div className="grid grid-cols-6 gap-2">
      {stages.map((s, i) => (
        <div key={s.label} className="relative">
          <div className="h-24 rounded-xl bg-gradient-to-b from-primary/25 via-violet/15 to-transparent border border-white/5 overflow-hidden relative">
            <div
              className="absolute inset-x-0 bottom-0 bg-[image:var(--gradient-primary)] transition-[height] duration-500"
              style={{ height: `${s.pct}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <div className="text-[11px] font-medium">{s.label}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{s.pct.toFixed(0)}%</div>
          </div>
          {i < stages.length - 1 && (
            <div className="absolute top-10 -right-1.5 w-3 h-0.5 bg-primary/40" />
          )}
        </div>
      ))}
    </div>
  );
}