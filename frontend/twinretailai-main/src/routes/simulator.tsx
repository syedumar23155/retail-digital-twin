import { createFileRoute } from "@tanstack/react-router";
import { useReducer } from "react";
import { GlassCard, PageHeader, SectionTitle, Chip } from "@/components/premium";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import {
  Eye,
  ShoppingCart,
  CreditCard,
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
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  ArrowRight,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/simulator")({
  component: OmnichannelDigitalTwinLab,
});

type State = {
  views: number;
  carts: number;
  purchases: number;

  storeVisits: number;
  posPurchases: number;

  coupon: boolean;
  email: boolean;
  push: boolean;

  loyalty: number;

  web: number;
  mobile: number;
  social: number;

  callCenter: number;
};

const initialState: State = {
  views: 276,
  carts: 149,
  purchases: 4,

  storeVisits: 1,
  posPurchases: 0,

  coupon: false,
  email: false,
  push: false,

  loyalty: 89,

  web: 65,
  mobile: 30,
  social: 20,

  callCenter: 0,
};

function reducer(state: State, action: Partial<State> | "reset"): State {
  if (action === "reset") {
    return initialState;
  }

  return {
    ...state,
    ...action,
  };
}

function calculateTwin(state: State) {
  const normalizedViews = Math.min(100, state.views / 100);
  const normalizedCarts = Math.min(100, state.carts / 10);
  const normalizedPurchases = Math.min(100, state.purchases / 10);

  let score = 0;

  score += normalizedViews * 0.15;
  score += normalizedCarts * 0.3;
  score += normalizedPurchases * 0.25;
  score += state.storeVisits * 2;
  score += state.posPurchases * 3;
  score += state.web * 0.08;
  score += state.mobile * 0.1;
  score += state.social * 0.05;
  score += state.loyalty / 100;
  score -= state.callCenter * 2;

  if (state.coupon) {
    score += 8;
  }
  if (state.email) {
    score += 5;
  }
  if (state.push) {
    score += 6;
  }

  const buyProbability = Math.max(5, Math.min(99.9, score));

  const engagement = Math.min(
    100,
    state.web * 0.4 + state.mobile * 0.4 + state.social * 0.2
  );

  const estimatedOrderValue = 75;
  const clv = Math.round(
    state.purchases *
      estimatedOrderValue *
      (1 + state.storeVisits * 0.1)
  );

  const roi = (
    clv /
    Math.max(
      500,
      (state.coupon ? 1 : 0) * 50 +
        (state.email ? 1 : 0) * 100 +
        (state.push ? 1 : 0) * 100
    )
  ).toFixed(1);

  let segment = "Passive Visitor";

  if (buyProbability >= 85) {
    segment = "Power Buyer";
  } else if (buyProbability >= 65) {
    segment = "Buyer";
  } else if (buyProbability >= 45) {
    segment = "Engaged Browser";
  } else if (buyProbability >= 25) {
    segment = "Window Shopper";
  }

  let funnelPosition = "Awareness";

  if (buyProbability >= 85) {
    funnelPosition = "Purchased";
  } else if (buyProbability >= 55) {
    funnelPosition = "Cart Intent";
  } else if (buyProbability >= 25) {
    funnelPosition = "Consideration";
  }

  let behaviorType = "CASUAL";

  const cartToViewRatio = state.views > 0 ? state.carts / state.views : 0;

  if (state.purchases >= 5 && cartToViewRatio > 0.05) {
    behaviorType = "LOYAL";
  } else if (state.views > 20 && state.purchases === 0) {
    behaviorType = "EXPLORER";
  } else if (cartToViewRatio > 0.1) {
    behaviorType = "RESEARCHER";
  }

  return {
    buyProbability,
    engagement,
    clv,
    roi,
    segment,
    funnelPosition,
    behaviorType,
    purchases: state.purchases,
  };
}

function OmnichannelDigitalTwinLab() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const baseline = calculateTwin(initialState);
  const simulation = calculateTwin(state);
  const uplift = simulation.buyProbability - baseline.buyProbability;
  const clv = simulation.clv;

  const journeyStages = [
    { label: "Website Visit", value: 20 },
    { label: "Product Discovery", value: 35 },
    { label: "Add To Wishlist", value: 50 },
    { label: "Add To Cart", value: 70 },
    { label: "Store Interaction", value: 85 },
    { label: "Purchase", value: 100 },
  ];

  const channelData = [
    {
      channel: "Website",
      value: state.web,
    },
    {
      channel: "Mobile",
      value: state.mobile,
    },
    {
      channel: "Social",
      value: state.social,
    },
    {
      channel: "Store",
      value: Math.min(100, state.storeVisits * 15),
    },
    {
      channel: "Marketing",
      value:
        (state.email ? 30 : 0) +
        (state.push ? 30 : 0) +
        (state.coupon ? 40 : 0),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <PageHeader
        eyebrow="Retail Digital Twin"
        title="Omnichannel Customer Journey Laboratory"
        description="Simulate customer navigation, engagement and purchasing behavior across online and offline retail channels."
        actions={
          <button
            onClick={() => dispatch("reset")}
            className="px-4 py-2 rounded-xl glass inline-flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        }
      />

      <div className="grid xl:grid-cols-5 gap-4 mt-8">
        <GlassCard className="p-6 xl:col-span-2">
          <SectionTitle title="Simulation Controls" subtitle="Inject behavioral signals" />

          <Label>ONLINE EVENTS</Label>

          <div className="grid grid-cols-2 gap-2">
            <Action icon={Eye} label="Views" value={state.views} click={() => dispatch({ views: state.views + 100 })} />
            <Action icon={ShoppingCart} label="Cart Adds" value={state.carts} click={() => dispatch({ carts: state.carts + 10 })} />
            <Action icon={CreditCard} label="Purchases" value={state.purchases} click={() => dispatch({ purchases: state.purchases + 5 })} />
            <Action icon={Award} label="Loyalty" value={state.loyalty} click={() => dispatch({ loyalty: state.loyalty + 50 })} />
          </div>

          <Label>MARKETING</Label>

          <div className="grid grid-cols-3 gap-2">
            <Toggle icon={TicketPercent} label="Coupon" active={state.coupon} click={() => dispatch({ coupon: !state.coupon })} />
            <Toggle icon={Mail} label="Email" active={state.email} click={() => dispatch({ email: !state.email })} />
            <Toggle icon={Bell} label="Push" active={state.push} click={() => dispatch({ push: !state.push })} />
          </div>

          <Label>OFFLINE CHANNELS</Label>

          <div className="grid grid-cols-3 gap-2">
            <Action icon={Store} label="Store Visits" value={state.storeVisits} click={() => dispatch({ storeVisits: state.storeVisits + 1 })} />
            <Action icon={ScanLine} label="POS Sales" value={state.posPurchases} click={() => dispatch({ posPurchases: state.posPurchases + 1 })} />
            <Action icon={PhoneCall} label="Support" value={state.callCenter} click={() => dispatch({ callCenter: state.callCenter + 1 })} />
          </div>

          <Label>CHANNEL INTENSITY</Label>

          <Slider icon={Globe} label="Website" value={state.web} change={(v: number) => dispatch({ web: v })} />
          <Slider icon={Smartphone} label="Mobile App" value={state.mobile} change={(v: number) => dispatch({ mobile: v })} />
          <Slider icon={Megaphone} label="Social Media" value={state.social} change={(v: number) => dispatch({ social: v })} />
        </GlassCard>

        <div className="xl:col-span-3 space-y-4">
          <GlassCard className="p-6">
            <SectionTitle title="Live Customer Digital Twin" subtitle="Real-time simulated persona" />

            <div className="flex gap-8 items-center mt-4">
              <div className="relative h-28 w-28 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center shrink-0">
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-background" />

                <div className="text-5xl">
                  {simulation.segment === "Power Buyer"
                    ? "👑"
                    : simulation.segment === "Buyer"
                    ? "🛍️"
                    : simulation.segment === "Engaged Browser"
                    ? "🔍"
                    : simulation.segment === "Window Shopper"
                    ? "👀"
                    : "🙂"}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer Segment:</span>
                  <span className="ml-2 font-semibold">{simulation.segment}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Behavior:</span>
                  <span className="ml-2 font-semibold">{simulation.behaviorType}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Funnel Stage:</span>
                  <span className="ml-2 font-semibold">{simulation.funnelPosition}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Conversion Probability:</span>
                  <span className="ml-2 font-semibold text-emerald-400">
                    {simulation.buyProbability.toFixed(1)}%
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground">Twin Health Score:</span>
                  <span className="ml-2 font-semibold text-cyan-400">
                    {Math.round((simulation.buyProbability + simulation.engagement) / 2)}
                    /100
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle
              title="Real-Time Twin Analytics"
              subtitle="Before vs after simulation"
              right={
                <Chip tone={uplift >= 0 ? "emerald" : "primary"}>
                  <Zap className="w-3 h-3" />
                  {uplift >= 0 ? "+" : ""}
                  {uplift.toFixed(1)}pp
                </Chip>
              }
            />

            <div className="grid md:grid-cols-4 gap-3">
              <Metric icon={TrendingUp} title="Buy Probability" old={baseline.buyProbability} current={simulation.buyProbability} suffix="%" />
              <Metric icon={Activity} title="Engagement" old={baseline.engagement} current={simulation.engagement} suffix="%" />
              <Metric icon={DollarSign} title="Estimated Customer Value" old={baseline.clv} current={simulation.clv} prefix="$" />
              <Metric icon={Users} title="ROI" old={Number(baseline.roi)} current={Number(simulation.roi)} suffix="x" />
            </div>
          </GlassCard>

          <div className="glass rounded-3xl p-6">
            <div className="text-sm text-muted-foreground">
              Estimated Customer Value
            </div>

            <div className="mt-3 text-4xl font-bold">
              ${clv}
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              RetailRocket has no price data.
              CLV is estimated from purchases,
              store visits and omnichannel activity.
            </div>
          </div>

          <GlassCard className="p-6">
            <SectionTitle
              title="Customer Journey Simulation"
              subtitle="Cross-channel customer movement across online and offline retail touchpoints"
            />

            <div className="flex items-end justify-between gap-4 mt-4">
              {journeyStages.map((stage) => (
                <div key={stage.label} className="flex flex-col items-center flex-1">
                  <div
                    className="
                      w-full
                      rounded-t-3xl
                      bg-[image:var(--gradient-primary)]
                      transition-all
                      duration-700
                      hover:scale-105
                      hover:shadow-2xl
                    "
                    style={{
                      height: `${Math.max(
                        20,
                        (stage.value / 100) * (simulation.buyProbability * 2.5)
                      )}px`,
                    }}
                  />
                  <div className="mt-4 text-center text-xs font-semibold leading-4">
                    {stage.label}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle title="Omnichannel Channel Impact" subtitle="Contribution of each retail channel" />

            <div className="h-[300px] mt-4">
              <ResponsiveContainer>
                <BarChart data={channelData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="channel" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.19 0.025 265 / 0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]}>
                    <LabelList
                      dataKey="value"
                      position="top"
                      fontSize={11}
                      fill="rgba(255,255,255,0.7)"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex gap-3">
              <Sparkles className="w-6 h-6 shrink-0" />

              <div className="w-full">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  AI Decision Engine
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {state.coupon && (
                    <div className="rounded-xl glass p-3">
                      🎟️ Deploy personalized coupon campaign
                    </div>
                  )}

                  {state.email && (
                    <div className="rounded-xl glass p-3">
                      📧 Trigger behavioral email workflow
                    </div>
                  )}

                  {state.push && (
                    <div className="rounded-xl glass p-3">
                      🔔 Send push notification sequence
                    </div>
                  )}

                  {state.storeVisits > 5 && (
                    <div className="rounded-xl glass p-3">
                      🏪 Increase physical store promotions
                    </div>
                  )}

                  {state.posPurchases > 0 && (
                    <div className="rounded-xl glass p-3">
                      💳 Offer POS loyalty rewards
                    </div>
                  )}

                  {!state.coupon &&
                    !state.email &&
                    !state.push &&
                    state.storeVisits <= 5 &&
                    state.posPurchases === 0 && (
                      <div className="space-y-3">
                        <div className="rounded-xl glass p-3">
                          🎯 Recommended action: increase cross-channel engagement.
                        </div>

                        <div className="rounded-xl glass p-3">
                          🤖 AI detected: customer abandonment risk.
                        </div>

                        <div className="rounded-xl glass p-3">
                          📈 Best conversion channel:
                          {state.web >= state.mobile ? " Website" : " Mobile App"}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle
              title="Digital Twin Architecture"
              subtitle="Customer behavior simulation pipeline"
            />

            <div className="grid md:grid-cols-5 gap-3 mt-4">
              {[
                "Customer Events",
                "Digital Twin",
                "Prediction Engine",
                "Recommendation Engine",
                "Omnichannel Dashboard",
              ].map((step) => (
                <div
                  key={step}
                  className="glass rounded-xl p-4 text-center text-sm font-medium"
                >
                  {step}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
      {children}
    </div>
  );
}

function Action({ icon: Icon, label, value, click }: any) {
  return (
    <button onClick={click} className="glass rounded-xl p-3 text-left">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>

      <div className="mt-2 text-sm font-mono">{value}</div>
    </button>
  );
}

function Toggle({ icon: Icon, label, active, click }: any) {
  return (
    <button
      onClick={click}
      className={`rounded-xl p-3 border ${
        active ? "border-primary bg-primary/10" : "glass border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Icon className="w-4 h-4" />
          {label}
        </div>

        <div className={`w-2 h-2 rounded-full ${active ? "bg-emerald-500" : "bg-white/20"}`} />
      </div>
    </button>
  );
}

function Slider({ icon: Icon, label, value, change }: any) {
  return (
    <div className="glass rounded-xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs">
          <Icon className="w-4 h-4" />
          {label}
        </div>

        <div className="font-mono text-xs">{value}</div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => change(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Metric({ icon: Icon, title, old, current, prefix = "", suffix = "" }: any) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="w-4 h-4" />
        {title}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="line-through text-xs text-muted-foreground">
          {prefix}
          {old.toFixed(1)}
          {suffix}
        </span>

        <ArrowRight className="w-4 h-4" />

        <span className="text-lg font-semibold">
          {prefix}
          {current.toFixed(1)}
          {suffix}
        </span>
      </div>
    </div>
  );
}