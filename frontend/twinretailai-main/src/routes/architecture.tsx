import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, SectionTitle, Chip } from "@/components/premium";
import { Globe, Smartphone, Store, ScanLine, CreditCard, Database, Cpu, Brain, Target, Workflow, LayoutDashboard, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/architecture")({
  component: SystemArchitecture,
});

function SystemArchitecture() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="System Architecture"
        title="The AI operating system for retail."
        description="Streaming ingestion, unified twin engine, and low-latency serving — deployed across cloud + edge."
      />

      <GlassCard className="p-8 mt-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative">
          <Layer title="Event Sources" tone="primary">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Source icon={Globe} label="Website" sub="Web events · SDK" />
              <Source icon={Smartphone} label="Mobile App" sub="iOS · Android" />
              <Source icon={Store} label="Store Visits" sub="Beacons · WiFi" />
              <Source icon={ScanLine} label="POS" sub="Offline txn stream" />
              <Source icon={CreditCard} label="Loyalty" sub="Membership card" />
            </div>
          </Layer>

          <Arrow />

          <Layer title="Data Pipeline" tone="violet">
            <PipelineRow items={["Kafka · CDC", "Schema Registry", "Feature Store", "Vector Index"]} />
          </Layer>

          <Arrow />

          <Layer title="Digital Twin Engine" tone="primary" spotlight>
            <div className="text-sm text-muted-foreground mb-3">Unified representation across online + offline · 42M twins · 1.2B daily state updates</div>
            <PipelineRow items={["Identity Graph", "Behavior Encoder", "Segmentation", "CLV / Risk Scoring"]} />
          </Layer>

          <Arrow />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniLayer icon={Brain} title="Prediction Engine" tone="violet" bullets={["XGBoost v4", "SHAP inference", "8.2ms p99"]} />
            <MiniLayer icon={Target} title="Recommendation Engine" tone="primary" bullets={["Popularity · CF · Segment", "Hybrid meta-ranker", "Coverage 78.6%"]} />
            <MiniLayer icon={Workflow} title="Journey Simulator" tone="emerald" bullets={["What-if orchestrator", "Cross-channel policy", "Realtime deltas"]} />
          </div>

          <Arrow />

          <Layer title="Analytics & Serving" tone="emerald">
            <PipelineRow items={["gRPC + REST APIs", "Executive Dashboard", "Model Observatory", "Alerting & SLOs"]} />
          </Layer>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <SysStat label="Twins" value="42.1M" />
        <SysStat label="Events / day" value="1.2B" />
        <SysStat label="p99 inference" value="8.2 ms" />
        <SysStat label="SLA uptime" value="99.98%" />
      </div>
    </div>
  );
}

function Layer({ title, tone, children, spotlight }: { title: string; tone: "primary" | "violet" | "emerald"; children: React.ReactNode; spotlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${spotlight ? "border-primary/30 shadow-[var(--shadow-glow)]" : "border-white/8"} glass`}>
      <div className="flex items-center gap-2 mb-3">
        <Chip tone={tone}>{title}</Chip>
      </div>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-3">
      <div className="flex flex-col items-center">
        <div className="w-px h-6 bg-gradient-to-b from-primary/60 to-violet/60" />
        <ArrowDown className="w-3 h-3 text-primary" />
      </div>
    </div>
  );
}

function Source({ icon: Icon, label, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; sub: string }) {
  return (
    <div className="rounded-xl p-3 bg-white/[0.03] border border-white/5 hover:border-white/15 transition">
      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center mb-2">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="text-[13px] font-medium">{label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function PipelineRow({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((i) => (
        <div key={i} className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-[12px] font-medium text-center">
          {i}
        </div>
      ))}
    </div>
  );
}

function MiniLayer({ icon: Icon, title, tone, bullets }: { icon: React.ComponentType<{ className?: string }>; title: string; tone: "primary" | "violet" | "emerald"; bullets: string[] }) {
  return (
    <div className="rounded-2xl p-4 glass">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg grid place-items-center bg-${tone}/10 border border-${tone}/20`}>
          <Icon className={`w-4 h-4 text-${tone}`} />
        </div>
        <div className="text-[13px] font-semibold">{title}</div>
      </div>
      <ul className="space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span className={`w-1 h-1 rounded-full bg-${tone}`} /> {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SysStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold font-display">{value}</div>
    </div>
  );
}